import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
import json
from datetime import datetime

# Import the FastAPI app
from app.main import app

from app.auth import get_current_user

class MockUser:
    id = "123e4567-e89b-12d3-a456-426614174000"

class TestIdeaValidatorAPI(unittest.TestCase):
    def setUp(self):
        app.dependency_overrides[get_current_user] = lambda: MockUser()
        self.client = TestClient(app)
        
        # New 9-question payload
        self.valid_payload = {
            "startupName": "SupplyFlow",
            "answers": [
                {"id": "idea_name", "label": "Idea Name", "question": "What is the name?", "answer": "SupplyFlow"},
                {"id": "one_liner", "label": "One-Line Description", "question": "Describe your idea?", "answer": "Inventory for cafes."},
                {"id": "problem", "label": "Problem", "question": "What problem?", "answer": "Manual inventory is slow."},
                {"id": "target_customer", "label": "Target Customer", "question": "Who are customers?", "answer": "Small coffee shops."},
                {"id": "solution", "label": "Solution", "question": "How solve?", "answer": "Automated scanning app."},
                {"id": "business_model", "label": "Business Model", "question": "How revenue?", "answer": "$49/mo SaaS."},
                {"id": "traction", "label": "Traction", "question": "What evidence?", "answer": "5 beta users."},
                {"id": "team", "label": "Team", "question": "Who building?", "answer": "Ex-barista and developer."},
                {"id": "competitors", "label": "Competitors", "question": "Who competitors?", "answer": "Excel and Square."},
            ]
        }

    def test_health_check(self):
        """Test the health check endpoint returns 200 OK."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    @patch('app.routers.validate.supabase_client')
    @patch('app.services.ai_orchestrator.analyze_input_quality')
    @patch('app.services.ai_orchestrator.call_groq')
    @patch('app.services.ai_orchestrator.settings')
    def test_validate_idea_success(self, mock_settings, mock_call_groq, mock_analyze_quality, mock_supabase):
        """Test validation endpoint works with new schema."""
        mock_settings.GROQ_API_KEY = "dummy-key"
        mock_settings.GEMINI_API_KEY = "dummy-key"
        mock_analyze_quality.return_value = (1.0, "GOOD", {})
        
        # New Detailed JSON Report Mock
        mock_report = {
            "meta": {
                "id": "TEST1234",
                "submitted_at": datetime.now().isoformat(),
                "idea_name": "SupplyFlow",
                "idea_one_liner": "Inventory for cafes."
            },
            "scorecard": {
                "overall_score": 7.5,
                "verdict": "STRONG",
                "fatal_flaw": None,
                "risk_flag_count": 1,
                "assumption_count": 2,
                "next_move_count": 3
            },
            "dimensions": [
                {"id": "problem", "label": "Problem Clarity", "score": 8, "analysis": "High", "fix": "N/A"},
                {"id": "market", "label": "Market Fit", "score": 7, "analysis": "Good", "fix": "N/A"}
            ],
            "assumptions_risk_matrix": [
                {"id": 1, "assumption": "Wifi works", "likelihood": 2, "impact": 9, "quadrant": "MONITOR"}
            ],
            "failure_modes": [
                {"rank": 1, "title": "No internet", "description": "Offline issues", "impact": 4}
            ],
            "risk_flags": [
                {"id": 1, "severity": "MEDIUM", "flag": "Competition"}
            ],
            "next_moves": [
                {"id": 1, "title": "Pilot", "description": "Run pilot", "timeline": "Week 1"}
            ],
            "swot": {
                "strengths": ["Speed"], "weaknesses": ["Cost"], "opportunities": ["Scale"], "threats": ["Big tech"]
            },
            "market_validation": {
                "score": 6, "analysis": "Evidence found", "evidence_quality": "MODERATE", "recommended_experiments": ["Ads"]
            },
            "solution_feasibility": {
                "score": 9, "analysis": "Easy to build", "technical_complexity": "LOW", "build_path": "React Native"
            },
            "competitive_landscape": {
                "analysis": "Moderate competition",
                "competitors": [
                    {"name": "Competitor A", "advantage": "First mover", "weakness": "High price"}
                ]
            },
            "product_roadmap": {
                "strategic_direction": "Build MVP first, then scale",
                "phases": [
                    {"phase": "MVP", "milestones": ["M1"], "timeline": "1 month"}
                ]
            },
            "deep_narrative_summary": "Overall very promising idea with clear path to validation."
        }
        mock_call_groq.return_value = json.dumps(mock_report)

        response = self.client.post("/api/validate-idea", json=self.valid_payload)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["status"], "pending")
        self.assertIn("report_id", data)

    @patch('app.services.ai_orchestrator.call_groq')
    @patch('app.services.ai_orchestrator.settings')
    def test_export_pdf(self, mock_settings, mock_call_groq):
        """Test PDF export with new schema."""
        mock_settings.GROQ_API_KEY = "dummy-key"
        mock_settings.GEMINI_API_KEY = "dummy-key"
        
        # Setup valid report first
        mock_report = {
            "meta": {"id": "PDF123", "submitted_at": "2024-01-01", "idea_name": "SupplyFlow", "idea_one_liner": "Scan"},
            "scorecard": {"overall_score": 8, "verdict": "STRONG", "fatal_flaw": None, "risk_flag_count": 0, "assumption_count": 0, "next_move_count": 0},
            "dimensions": [],
            "assumptions_risk_matrix": [],
            "failure_modes": [],
            "risk_flags": [],
            "next_moves": [],
            "swot": {"strengths": [], "weaknesses": [], "opportunities": [], "threats": []},
            "market_validation": {"score": 5, "analysis": "G", "evidence_quality": "WEAK", "recommended_experiments": []},
            "solution_feasibility": {"score": 5, "analysis": "G", "technical_complexity": "LOW", "build_path": "G"},
            "competitive_landscape": {
                "analysis": "Some landscape analysis",
                "competitors": [{"name": "C1", "advantage": "A1", "weakness": "W1"}]
            },
            "product_roadmap": {
                "strategic_direction": "G",
                "phases": [{"phase": "P1", "milestones": ["M1"], "timeline": "T1"}]
            },
            "deep_narrative_summary": "Deep narrative summary goes here."
        }
        
        export_payload = {
            "startupName": "SupplyFlow",
            **mock_report
        }

        response = self.client.post("/api/export-pdf", json=export_payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("content-type"), "application/pdf")

if __name__ == "__main__":
    unittest.main()
