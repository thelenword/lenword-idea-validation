import asyncio
from app.models.schemas import IdeaValidationRequest, AnswerItem
from app.services.ai_orchestrator import generate_fallback_report
from app.services.input_quality import analyze_input_quality
from app.services.pdf_export import export_report_to_pdf

def run_tests():
    print("Testing input quality analyzer...")
    answers = {
        "problem": "asdfasdf",
        "solution": "qwerqwer",
        "target_customer": "zxcvzxcv"
    }
    mult, verdict, field_scores = analyze_input_quality(answers, "Test")
    print(f"Quality Mult for gibberish: {mult} (Expected < 0.5)")

    print("\nTesting fallback generator...")
    payload = IdeaValidationRequest(
        startupName="TestApp",
        answers=[
            AnswerItem(id="problem", label="Problem", question="Q1", answer="People are too busy to cook."),
            AnswerItem(id="solution", label="Solution", question="Q2", answer="An automated cooking robot."),
            AnswerItem(id="target_customer", label="Target Customer", question="Q3", answer="Busy professionals working 60+ hours."),
            AnswerItem(id="business_model", label="Business Model", question="Q4", answer="Hardware sales + SaaS recipe subscription."),
            AnswerItem(id="traction", label="Traction", question="Q5", answer="We have 100 beta users and $5k in pre-orders."),
            AnswerItem(id="team", label="Team", question="Q6", answer="3 former Tesla engineers."),
            AnswerItem(id="competitors", label="Competitors", question="Q7", answer="Tovala, Thermomix, eating out."),
        ]
    )
    report = generate_fallback_report(payload)
    print(f"Generated fallback report with {len(report.dimensions)} dimensions (Expected 10)")
    
    print("\nTesting PDF export...")
    pdf_bytes = export_report_to_pdf("TestApp", report)
    print(f"Generated PDF with {len(pdf_bytes)} bytes")
    
    with open("test_export.pdf", "wb") as f:
        f.write(pdf_bytes)
    print("Wrote PDF to test_export.pdf")

if __name__ == "__main__":
    run_tests()
