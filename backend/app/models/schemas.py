from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class AnswerItem(BaseModel):
    id: str
    label: str
    question: str
    answer: str = Field(..., max_length=1000)

class IdeaValidationRequest(BaseModel):
    startupName: str = Field(..., min_length=1, max_length=120)
    answers: List[AnswerItem]

class MetaData(BaseModel):
    id: str
    submitted_at: str
    idea_name: str
    idea_one_liner: str

class Scorecard(BaseModel):
    overall_score: float
    verdict: Literal["NEEDS WORK", "PROMISING", "STRONG", "EXCEPTIONAL"]
    fatal_flaw: Optional[str] = None
    risk_flag_count: int
    assumption_count: int
    next_move_count: int

class Dimension(BaseModel):
    id: str
    label: str
    score: float
    analysis: str
    fix: str

class Assumption(BaseModel):
    id: int
    assumption: str
    likelihood: int
    impact: int
    quadrant: Literal["CRITICAL", "WATCH", "MONITOR", "LOW_PRIORITY"]

class FailureMode(BaseModel):
    rank: int
    title: str
    description: str
    impact: int

class RiskFlag(BaseModel):
    id: int
    severity: Literal["CRITICAL", "HIGH", "MEDIUM"]
    flag: str

class NextMove(BaseModel):
    id: int
    title: str
    description: str
    timeline: str

class SwotAnalysis(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]

class MarketValidation(BaseModel):
    score: float
    analysis: str
    evidence_quality: Literal["NONE", "ANECDOTAL", "WEAK", "MODERATE", "STRONG"]
    recommended_experiments: List[str]

class SolutionFeasibility(BaseModel):
    score: float
    analysis: str
    technical_complexity: Literal["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]
    build_path: str

class Competitor(BaseModel):
    name: str
    advantage: str
    weakness: str

class CompetitiveLandscape(BaseModel):
    analysis: str
    competitors: List[Competitor]

class RoadmapPhase(BaseModel):
    phase: str
    milestones: List[str]
    timeline: str

class ProductRoadmap(BaseModel):
    strategic_direction: str
    phases: List[RoadmapPhase]

class ValidationReport(BaseModel):
    meta: MetaData
    scorecard: Scorecard
    dimensions: List[Dimension]
    assumptions_risk_matrix: List[Assumption]
    failure_modes: List[FailureMode]
    risk_flags: List[RiskFlag]
    next_moves: List[NextMove]
    swot: SwotAnalysis
    market_validation: MarketValidation
    solution_feasibility: SolutionFeasibility
    competitive_landscape: CompetitiveLandscape
    product_roadmap: ProductRoadmap
    deep_narrative_summary: str
    provider: Optional[str] = None
