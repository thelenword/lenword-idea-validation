import asyncio
from app.config import settings
from app.services.ai_orchestrator import get_validation
from app.services.pdf_export import export_report_to_pdf
from app.models.schemas import IdeaValidationRequest
from app.supabase_client import supabase_client
import json
import logging

logger = logging.getLogger(__name__)

def run_validation_pipeline(report_id: str, user_id: str, startup_name: str, answers_dict: list):
    """
    Celery task that runs the AI validation pipeline, generates the PDF,
    and updates the Supabase record.
    """
    try:
        # Mark as processing
        supabase_client.table("validation_reports").update({"status": "processing"}).eq("id", report_id).execute()

        # Run AI Orchestrator
        payload = IdeaValidationRequest(
            startupName=startup_name,
            answers=answers_dict
        )
        
        # get_validation is async, so we use asyncio.run to execute it in this thread
        report = asyncio.run(get_validation(payload))

        # Update Supabase with the report JSON and score
        report_dict = report.model_dump()
        score = report.scorecard.overall_score
        
        supabase_client.table("validation_reports").update({
            "report_data": report_dict,
            "score": score,
            "status": "completed"
        }).eq("id", report_id).execute()

        # Generate PDF
        pdf_bytes = export_report_to_pdf(startup_name, report)
        
        # Upload PDF to Supabase Storage
        file_path = f"{user_id}/{report_id}.pdf"
        res = supabase_client.storage.from_("pdfs").upload(
            file_path,
            pdf_bytes,
            file_options={"content-type": "application/pdf"}
        )

        # Update PDF URL in DB
        pdf_url = supabase_client.storage.from_("pdfs").get_public_url(file_path)
        supabase_client.table("validation_reports").update({
            "pdf_url": pdf_url
        }).eq("id", report_id).execute()

        return {"status": "success", "report_id": report_id}

    except Exception as exc:
        logger.error(f"Validation pipeline failed for {report_id}: {exc}")
        supabase_client.table("validation_reports").update({"status": "failed"}).eq("id", report_id).execute()
