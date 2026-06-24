import json
import logging
from fastapi import HTTPException
from pydantic import ValidationError
import uuid
from datetime import datetime

from app.models.schemas import IdeaValidationRequest, ValidationReport
from app.services.prompt_builder import build_system_prompt, build_user_prompt
from app.services.grok_client import call_grok, GrokError
from app.services.gemini_client import call_gemini, GeminiError
from app.config import settings
from app.services.input_quality import analyze_input_quality

logger = logging.getLogger(__name__)

def trunc(text: str, max_len: int) -> str:
    """Helper to cleanly truncate strings without appending '...' if not needed."""
    if len(text) <= max_len:
        return text
    return f"{text[:max_len]}..."

def parse_and_validate(raw_text: str, provider: str) -> ValidationReport:
    """
    Clean the AI raw response, parse JSON, run Pydantic checks.
    """
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    parsed_json = json.loads(cleaned)
    parsed_json["provider"] = provider
    
    return ValidationReport(**parsed_json)

def apply_quality_penalty(report: ValidationReport, quality_mult: float) -> ValidationReport:
    if quality_mult >= 0.95:
        return report

    # Scale overall score
    report.scorecard.overall_score = round(report.scorecard.overall_score * quality_mult, 1)
    
    # Recalculate verdict based on new score
    if report.scorecard.overall_score >= 8.0:
        report.scorecard.verdict = "EXCEPTIONAL" if report.scorecard.overall_score >= 9.0 else "STRONG"
    elif report.scorecard.overall_score < 6.0:
        report.scorecard.verdict = "NEEDS WORK"
    else:
        report.scorecard.verdict = "PROMISING"

    # Scale dimension scores
    for dim in report.dimensions:
        dim.score = round(dim.score * quality_mult, 1)

    # Scale market & feasibility scores
    report.market_validation.score = round(report.market_validation.score * quality_mult, 1)
    report.solution_feasibility.score = round(report.solution_feasibility.score * quality_mult, 1)

    # Update fatal flaw if gibberish
    if quality_mult < 0.5:
        report.scorecard.fatal_flaw = "Low Quality Input: The validation scores have been heavily penalized because the provided startup idea description lacks meaningful detail or contains gibberish. Please provide comprehensive answers for accurate validation."

    return report

async def get_validation(payload: IdeaValidationRequest) -> ValidationReport:
    """
    Orchestrates validation using Grok with Gemini fallback.
    Supports exactly one corrective retry for malformed JSON before switching/failing.
    """
    if not settings.XAI_API_KEY and not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=400,
            detail="API keys are not configured. Please configure XAI_API_KEY or GEMINI_API_KEY in the environment variables."
        )

    answers_map = {item.id: item.answer for item in payload.answers}
    quality_mult, verdict, field_scores = analyze_input_quality(answers_map, payload.startupName)

    system_prompt = build_system_prompt()
    user_prompt = build_user_prompt(payload)

    # --- 1. GROK ATTEMPT ---
    grok_messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    grok_raw = None
    try:
        grok_raw = await call_grok(grok_messages, timeout=40.0)
        report = parse_and_validate(grok_raw, "grok")
        return apply_quality_penalty(report, quality_mult)
    except Exception as e:
        logger.warning(f"Grok first attempt failed ({type(e).__name__}: {e})")
        if isinstance(e, (json.JSONDecodeError, ValidationError)) and grok_raw is not None:
            grok_messages.append({"role": "assistant", "content": grok_raw})
            grok_messages.append({
                "role": "user",
                "content": "your previous response was not valid JSON matching the schema, return ONLY the JSON object, no markdown fences, no commentary"
            })
            try:
                grok_raw_retry = await call_grok(grok_messages, timeout=40.0)
                report = parse_and_validate(grok_raw_retry, "grok")
                return apply_quality_penalty(report, quality_mult)
            except Exception:
                pass
        
    # --- 2. GEMINI FALLBACK ATTEMPT ---
    gemini_messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    gemini_raw = None
    try:
        gemini_raw = await call_gemini(gemini_messages, timeout=40.0)
        report = parse_and_validate(gemini_raw, "gemini")
        return apply_quality_penalty(report, quality_mult)
    except Exception as e:
        logger.warning(f"Gemini first attempt failed ({type(e).__name__}: {e})")
        if isinstance(e, (json.JSONDecodeError, ValidationError)) and gemini_raw is not None:
            gemini_messages.append({"role": "assistant", "content": gemini_raw})
            gemini_messages.append({
                "role": "user",
                "content": "your previous response was not valid JSON matching the schema, return ONLY the JSON object, no markdown fences, no commentary"
            })
            try:
                gemini_raw_retry = await call_gemini(gemini_messages, timeout=40.0)
                report = parse_and_validate(gemini_raw_retry, "gemini")
                return apply_quality_penalty(report, quality_mult)
            except Exception:
                pass

    logger.warning("Both Grok and Gemini API calls failed. Falling back to the deterministic validation report generator.")
    try:
        report = generate_fallback_report(payload)
        return apply_quality_penalty(report, quality_mult)
    except Exception as fallback_err:
        logger.error(f"Fallback generator also failed: {fallback_err}")
        raise HTTPException(
            status_code=503,
            detail="AI validation is temporarily unavailable."
        )


def generate_fallback_report(payload: IdeaValidationRequest) -> ValidationReport:
    answers_map = {item.id: item.answer.strip() for item in payload.answers}
    
    name = payload.startupName
    if "Q01" in answers_map:
        problem = answers_map.get("Q01", "A market problem.")
        customer = answers_map.get("Q02", "Target customers.")
        solution = answers_map.get("Q03", "A product solution.")
        stage = answers_map.get("Q04", "Idea phase.")
        competitors_raw = answers_map.get("Q05", "Direct and indirect competitors.")
        business_model = answers_map.get("Q06", "Revenue generation.")
        acquisition = answers_map.get("Q07", "Customer acquisition channels.")
        traction = answers_map.get("Q08", "Early validation phase.")
        one_liner = f"Venture addressing problem: {problem[:50]}..."
        team = f"Stage: {stage}. Acquisition strategy: {acquisition[:50]}..."
    else:
        one_liner = answers_map.get("one_liner", "A new startup venture.")
        problem = answers_map.get("problem", "A market problem.")
        customer = answers_map.get("target_customer", "Target customers.")
        solution = answers_map.get("solution", "A product solution.")
        business_model = answers_map.get("business_model", "Revenue generation.")
        traction = answers_map.get("traction", "Early validation phase.")
        team = answers_map.get("team", "The founding team.")
        competitors_raw = answers_map.get("competitors", "Direct and indirect competitors.")
    
    # 1. Clean list of competitors
    competitor_list = []
    if competitors_raw:
        parts = []
        for p in competitors_raw.replace(" and ", ",").replace(";", ",").split(","):
            val = p.strip()
            if val and val.lower() not in ["none", "no one", "not yet", "na", "n/a", "no competitors", "excel", "spreadsheets", "paper"]:
                parts.append(val)
        competitor_list = parts[:3]
        
    if not competitor_list:
        competitor_list = ["Indirect Alternatives (e.g. manual spreadsheets or paper workflows)"]
        no_competitors_flag = True
    else:
        no_competitors_flag = False

    # 2. Heuristics for Traction
    traction_score = 5.0
    evidence_quality = "NONE"
    traction_lower = traction.lower()
    
    if any(x in traction_lower for x in ["paying", "revenue", "sales", "sold", "profit", "$", "dollar"]):
        traction_score = 8.2
        evidence_quality = "STRONG"
    elif any(x in traction_lower for x in ["customer", "client", "user", "active", "pilot", "test"]):
        traction_score = 6.8
        evidence_quality = "MODERATE"
    elif any(x in traction_lower for x in ["waitlist", "signup", "subscriber", "leads", "survey"]):
        traction_score = 5.8
        evidence_quality = "WEAK"
    elif any(x in traction_lower for x in ["none", "nothing", "just an idea", "no traction", "n/a", "started yesterday"]):
        traction_score = 3.5
        evidence_quality = "NONE"
    else:
        if len(traction) > 10:
            traction_score = 5.0
            evidence_quality = "ANECDOTAL"

    # 3. Heuristics for Customer Specificity
    customer_lower = customer.lower()
    customer_score = 7.0
    if any(x in customer_lower for x in ["everyone", "anyone", "all businesses", "all people", "global market", "everybody", "mass market"]):
        customer_score = 4.5
    elif len(customer) < 15:
        customer_score = 5.5

    # 4. Heuristics for Problem Severity & Clarity
    problem_len = len(problem)
    problem_score = 7.0
    if problem_len < 15:
        problem_score = 4.2
    elif problem_len < 30:
        problem_score = 5.8
    elif problem_len > 120:
        problem_score = 8.2

    # 5. Heuristics for Team Fit
    team_lower = team.lower()
    team_score = 6.0
    if any(x in team_lower for x in ["years", "experience", "expert", "built", "ex-", "phd", "engineer", "developer", "industry"]):
        team_score = 8.0
    elif len(team) < 15:
        team_score = 5.0

    # 6. Competitor Awareness Score
    comp_score = 7.5
    if no_competitors_flag:
        comp_score = 4.0

    # 7. Monetization Logic
    bm_lower = business_model.lower()
    bm_score = 6.5
    if any(x in bm_lower for x in ["subscription", "saas", "pricing", "$", "monthly", "yearly", "license"]):
        bm_score = 7.5
    elif any(x in bm_lower for x in ["ads", "advertising", "free", "donation"]):
        bm_score = 5.2

    # 8. Execution & Scalability
    sol_lower = solution.lower()
    sol_score = 7.0
    tech_complexity = "MEDIUM"
    if any(x in sol_lower for x in ["ai", "machine learning", "blockchain", "hardware", "iot", "biotech", "deep learning"]):
        tech_complexity = "HIGH"
        sol_score = 5.8
    elif any(x in sol_lower for x in ["app", "website", "platform", "marketplace", "software", "saas"]):
        tech_complexity = "MEDIUM"
        sol_score = 7.8
    elif len(solution) < 15:
        tech_complexity = "LOW"
        sol_score = 5.0

    # Add dummy scores for missing dimensions to ensure complete 10 dimensions coverage
    scalability_score = 6.5
    defensibility_score = 6.0
    regulatory_score = 7.5
    
    # Calculate overall validation scorecard
    scores = [problem_score, customer_score, bm_score, comp_score, sol_score, traction_score, scalability_score, defensibility_score, regulatory_score, team_score]
    overall_score = round(sum(scores) / len(scores), 1)

    verdict = "PROMISING"
    if overall_score >= 8.0:
        verdict = "EXCEPTIONAL" if overall_score >= 9.0 else "STRONG"
    elif overall_score < 6.0:
        verdict = "NEEDS WORK"

    fatal_flaw = None
    if no_competitors_flag:
        fatal_flaw = "Low Competitive Awareness: Assuming zero competition is a major red flag. If no direct competitors exist, customers are either solving this using manual workarounds (like Excel), or there is no market demand."
    elif overall_score < 6.0:
        fatal_flaw = "Severe Validation Gap: The venture lacks early traction evidence and target customer definition. High customer acquisition costs relative to unproven demand pose an immediate existential threat."

    # Dynamic SWOT Opportunities & Threats
    strengths = [
        f"Targeted core focus on solving: '{trunc(problem, 60)}'",
        f"Clear product value proposition: '{one_liner}'",
    ]
    if team_score >= 7.5:
        strengths.append(f"Experienced founding team fit: '{team}'")
    else:
        strengths.append("Identified team structure for early product development.")

    if not no_competitors_flag:
        strengths.append(f"Active competitor awareness of players like {', '.join(competitor_list)}.")

    weaknesses = [
        f"Currently in early validation stage: '{traction}'",
    ]
    if customer_score < 6.0:
        weaknesses.append("Target customer definition is too broad, leading to high marketing dilution.")
    if no_competitors_flag:
        weaknesses.append("Lack of research on direct competitor alternatives.")
    if len(solution) < 20:
        weaknesses.append("Solution specifications are brief; core product scope remains undefined.")

    opportunities = [
        f"Direct beachhead validation in segment: '{trunc(customer, 40)}'",
        "Developing proprietary software features to increase customer switching costs",
        "Establishing strategic integrations with industry platforms to lower acquisition friction"
    ]

    threats = [
        f"Established incumbents ({', '.join(competitor_list)}) copying product features or undercutting pricing",
        "Market education costs if the target pain point is not acute enough for users to switch",
        "Running out of funding/runway before reaching repeatable product-market fit"
    ]

    # Create dimensions (10 total)
    dimensions = [
        {
            "id": "problem_clarity",
            "label": "Problem Clarity",
            "score": problem_score,
            "analysis": f"The problem you are solving is described as: '{problem}'. A clear problem statement is the foundation of product development. " + (
                "However, the description is very brief. You need to gather more quantitative evidence of how severely this pain point hurts your users." if problem_score < 6.0 else
                "This is a well-articulated pain point. Focus on identifying the exact moments when this problem occurs and what trigger events cause it."
            ),
            "fix": "Draft a detailed problem scenario document and validate it through 10 customer interviews."
        },
        {
            "id": "customer_specificity",
            "label": "Customer Specificity",
            "score": customer_score,
            "analysis": f"You are targeting: '{customer}'. " + (
                "This definition is quite broad (e.g. targeting too many cohorts at once). Early stage startups succeed by dominating a small, hyper-focused beachhead market first." if customer_score < 6.0 else
                "This target market shows good specialization. Ensure you can reach these buyers cost-effectively through targeted digital or offline channels."
            ),
            "fix": "Refine your target customer profile to a single, easily reachable beachhead group (e.g. by industry, geography, or budget)."
        },
        {
            "id": "market_realism",
            "label": "Market Realism",
            "score": round((problem_score + customer_score)/2, 1),
            "analysis": f"Market demand for '{name}' facing '{trunc(problem, 40)}' is driven by active pain. However, market size is irrelevant if acquisition channels are blocked. You must determine if this target group actively searches for a solution today.",
            "fix": "Use keyword search tools and forums (like Reddit/Quora) to identify if your target customer is actively complaining about this problem."
        },
        {
            "id": "monetization_logic",
            "label": "Monetization Logic",
            "score": bm_score,
            "analysis": f"You plan to monetize via: '{business_model}'. " + (
                "Ad-based or free models require massive scale to be sustainable. Ensure your pricing structure aligns with the direct business value or utility you create." if bm_score < 6.0 else
                "Subscription or transaction fee models show strong monetization logic. Focus on pricing optimization to match the customer's perceived return on investment (ROI)."
            ),
            "fix": "Run a simple pricing survey with potential users to find the price range where they perceive the product as high value but fair."
        },
        {
            "id": "competitive_awareness",
            "label": "Competitive Awareness",
            "score": comp_score,
            "analysis": f"You identified competitors: '{competitors_raw}'. " + (
                "Claiming no competitors is a critical risk. You must map out indirect competitors, manual workarounds, spreadsheets, or legacy workflows." if no_competitors_flag else
                f"You have good competitive awareness of players like {', '.join(competitor_list)}. Focus on your unfair distribution advantage or product workflow focus."
            ),
            "fix": "Build a competitive landscape sheet. Define your specific 'value proposition wedge' that makes you 10x better for your beachhead niche."
        },
        {
            "id": "execution_feasibility",
            "label": "Execution Feasibility",
            "score": sol_score,
            "analysis": f"Your solution is: '{solution}'. " + (
                "Technical complexity is low to medium, which means speed-to-market is your main competitive advantage. Build a lean version quickly." if tech_complexity != "HIGH" else
                "Technical complexity is high. Focus on building a minimal proof-of-concept (POC) to prove technical feasibility before building the wrapper operations."
            ),
            "fix": "List the absolute minimum features required to solve the core problem. Strip out all nice-to-haves for your initial release."
        },
        {
            "id": "scalability_potential",
            "label": "Scalability Potential",
            "score": scalability_score,
            "analysis": f"Based on your solution '{trunc(solution, 40)}', the product needs to reach a wide audience. Your business model '{trunc(business_model, 40)}' might face scaling challenges if acquisition cost isn't tightly controlled.",
            "fix": "Map out customer acquisition channels and ensure unit economics improve as you scale."
        },
        {
            "id": "defensibility_moat",
            "label": "Defensibility Moat",
            "score": defensibility_score,
            "analysis": f"With players like {', '.join(competitor_list)} in the market, building a durable moat is crucial. Consider network effects or high switching costs.",
            "fix": "Identify one core workflow that, once adopted, makes it very difficult for a customer to leave your platform."
        },
        {
            "id": "regulatory_landscape",
            "label": "Regulatory Landscape",
            "score": regulatory_score,
            "analysis": "Data privacy and compliance are baseline requirements. Ensure you have assessed any industry-specific regulations that could stall your deployment.",
            "fix": "Review standard compliance frameworks (e.g., GDPR/CCPA) applicable to your target market."
        },
        {
            "id": "team_fit_alignment",
            "label": "Team Fit Alignment",
            "score": team_score,
            "analysis": f"Your team background ('{trunc(team, 40)}') suggests a certain capacity. Building '{name}' requires deep domain expertise and execution speed.",
            "fix": "Ensure you have the right mix of technical and sales talent to reach your next milestone."
        }
    ]

    # Create next moves
    next_moves = []
    if traction_score <= 4.0:
        next_moves.append({
            "id": 1,
            "title": "Validate problem severity",
            "description": "Speak with 5 target users this week. Ask about how they currently handle this issue and what it costs them in time or money.",
            "timeline": "Next 5 days"
        })
    else:
        next_moves.append({
            "id": 1,
            "title": "Validate willingness to pay",
            "description": "Pitch the specific solution price point to 5 prospects to test pricing model validity and collect initial signups.",
            "timeline": "Next 7 days"
        })

    next_moves.append({
        "id": 2,
        "title": "Create a landing page MVP",
        "description": f"Build a simple one-page site presenting the {name} value proposition. Collect email signups to build an early waitlist.",
        "timeline": "Next 14 days"
    })
    
    if no_competitors_flag:
        next_moves.append({
            "id": 3,
            "title": "Map user workarounds",
            "description": "Research how target users solve this problem today using standard software (e.g., spreadsheets, emails, pen-and-paper).",
            "timeline": "Next 7 days"
        })
    else:
        next_moves.append({
            "id": 3,
            "title": "Define your competitive wedge",
            "description": f"Draft the single core feature that distinguishes {name} from {competitor_list[0]} and explain it in one sentence.",
            "timeline": "Next 7 days"
        })

    # Critical assumptions
    assumptions = [
        {
            "id": 1,
            "assumption": f"Target customers ('{trunc(customer, 60)}') find the problem ('{trunc(problem, 50)}') painful enough to search for a new tool.",
            "likelihood": 7,
            "impact": 9,
            "quadrant": "CRITICAL"
        },
        {
            "id": 2,
            "assumption": f"The proposed solution ('{trunc(solution, 60)}') solves this problem better than manual alternatives.",
            "likelihood": 5,
            "impact": 8,
            "quadrant": "WATCH"
        }
    ]
    if no_competitors_flag:
        assumptions.append({
            "id": 3,
            "assumption": "No new incumbent will enter this space or build this feature next month.",
            "likelihood": 8,
            "impact": 7,
            "quadrant": "CRITICAL"
        })
    else:
        assumptions.append({
            "id": 3,
            "assumption": f"Competitors ({', '.join(competitor_list)}) will not match our core beachhead feature within 6 months.",
            "likelihood": 6,
            "impact": 7,
            "quadrant": "MONITOR"
        })

    # Failure modes
    failure_modes = [
        {
            "rank": 1,
            "title": "Product-Market Fit Miss",
            "description": f"Target customers do not view '{trunc(problem, 60)}' as a burning pain point. The solution is built but lacks active engagement.",
            "impact": 5
        },
        {
            "rank": 2,
            "title": "High Acquisition Friction",
            "description": f"Customer acquisition cost (CAC) exceeds lifetime value (LTV). Customer onboarding is too high-touch for a '{trunc(business_model, 40)}' model.",
            "impact": 4
        }
    ]

    # Risk flags
    risk_flags = []
    if traction_score <= 4.0:
        risk_flags.append({
            "id": 1,
            "severity": "CRITICAL",
            "flag": "No active customer traction or validated willingness to pay has been demonstrated."
        })
    else:
        risk_flags.append({
            "id": 1,
            "severity": "HIGH",
            "flag": f"Willingness to pay for '{trunc(business_model, 40)}' relies on unproven customer conversion rates."
        })

    if no_competitors_flag:
        risk_flags.append({
            "id": 2,
            "severity": "HIGH",
            "flag": "Underestimated competitive landscape: Spreadsheet workarounds and legacy habits are strong competitors."
        })
    else:
        risk_flags.append({
            "id": 2,
            "severity": "MEDIUM",
            "flag": f"Venture enters a competitive space occupied by {', '.join(competitor_list)}."
        })

    # Competitors mapping
    landscape_competitors = []
    for comp in competitor_list:
        landscape_competitors.append({
            "name": comp,
            "advantage": "Established brand authority and pre-existing customer distribution channel.",
            "weakness": "Generic feature set designed for broad markets rather than hyper-focused niche workflows."
        })

    # Deep narrative summary
    deep_narrative = (
        f"- {trunc(name, 40)} targets a clear customer problem with a defined early scope.\n"
        "- Prove demand, pricing, and repeatable acquisition before building more."
    )

    report_dict = {
        "meta": {
            "id": uuid.uuid4().hex[:8].upper(),
            "submitted_at": datetime.utcnow().isoformat() + "Z",
            "idea_name": name,
            "idea_one_liner": one_liner
        },
        "scorecard": {
            "overall_score": overall_score,
            "verdict": verdict,
            "fatal_flaw": fatal_flaw,
            "risk_flag_count": len(risk_flags),
            "assumption_count": len(assumptions),
            "next_move_count": len(next_moves)
        },
        "dimensions": dimensions,
        "assumptions_risk_matrix": assumptions,
        "failure_modes": failure_modes,
        "risk_flags": risk_flags,
        "next_moves": next_moves,
        "swot": {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "opportunities": opportunities,
            "threats": threats
        },
        "market_validation": {
            "score": traction_score,
            "analysis": f"Your current traction is: '{traction}'. The target audience specificity score is {customer_score}/10. While there is qualitative validation, quantitative market signals are required to prove demand scale.",
            "evidence_quality": evidence_quality,
            "recommended_experiments": [
                "Create a simple mockup prototype and test it with 5 target users this week.",
                "Build a landing page waitlist and measure conversion rates from direct ad outreach."
            ]
        },
        "solution_feasibility": {
            "score": sol_score,
            "analysis": f"Technical feasibility is rated {sol_score}/10, indicating {tech_complexity.lower()} complexity. The solution '{solution}' can be built in phases, matching team background: '{team}'.",
            "technical_complexity": tech_complexity,
            "build_path": f"Develop a high-fidelity visual prototype first, gather feedback, then build a minimal web platform."
        },
        "competitive_landscape": {
            "analysis": f"Direct competition includes: '{competitors_raw}'. You must differentiate {name} by focusing on specific workflow gaps or localized channels where incumbents are weak.",
            "competitors": landscape_competitors
        },
        "product_roadmap": {
            "strategic_direction": f"Establish customer discovery validation first, then release a private beta, validate pricing model ('{business_model}'), and scale distribution.",
            "phases": [
                {
                    "phase": "Phase 1: Validation & Discovery",
                    "milestones": ["Conduct 10 discovery interviews", "Setup landing page waitlist", "Design core visual prototype"],
                    "timeline": "Month 1"
                },
                {
                    "phase": "Phase 2: Private Beta & Onboarding",
                    "milestones": [f"Onboard 10 beta users from '{trunc(customer, 40)}'", "Validate core problem resolution", "Setup Stripe payment flow"],
                    "timeline": "Months 2-3"
                },
                {
                    "phase": "Phase 3: Scale & Automate",
                    "milestones": ["Automate customer onboarding", "Begin direct marketing push"],
                    "timeline": "Months 4-6"
                }
            ]
        },
        "deep_narrative_summary": deep_narrative,
        "provider": "fallback_orchestrator"
    }
    
    return ValidationReport(**report_dict)
