import urllib.parse
from fastapi import APIRouter, Response
from app.models.schemas import ValidationReport
from app.services.pdf_export import export_report_to_pdf

router = APIRouter()

class ExportPdfRequest(ValidationReport):
    startupName: str

@router.post("/export-pdf")
async def export_pdf(payload: ExportPdfRequest):
    """
    Export a validation report to PDF.
    Accepts validation report schema plus startupName.
    """
    pdf_bytes = export_report_to_pdf(payload.startupName, payload)
    
    # Safely URL-encode the filename for the headers
    filename = f"{payload.startupName}-validation-report.pdf"
    encoded_filename = urllib.parse.quote(filename)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
