import uuid
from typing import Optional
from fastapi import APIRouter, Request, Depends, BackgroundTasks, HTTPException
from pydantic import BaseModel
from app.models.schemas import IdeaValidationRequest
from app.limiter import limiter
from app.config import settings
from app.auth import get_current_user, get_optional_user, User
from app.supabase_client import supabase_client
from app.tasks.validation import run_validation_pipeline

router = APIRouter()

class ClaimReportRequest(BaseModel):
    report_id: str

@router.post("/validate-idea")
@limiter.limit(settings.RATE_LIMIT_STRING)
async def validate_idea(request: Request, payload: IdeaValidationRequest, background_tasks: BackgroundTasks, user: Optional[User] = Depends(get_optional_user)):
    """
    Validate a startup idea based on name and 8 strategic answers.
    Dispatches to Background Task and returns report_id.
    """
    report_id = str(uuid.uuid4())
    user_id = user.id if user else None
    
    # Insert pending report into Supabase
    supabase_client.table("validation_reports").insert({
        "id": report_id,
        "user_id": user_id,
        "startup_name": payload.startupName,
        "status": "pending",
        "score": 0,
        "report_data": {}
    }).execute()

    # Dispatch Background Task instead of Celery
    answers_dict = [a.model_dump() for a in payload.answers]
    background_tasks.add_task(run_validation_pipeline, report_id, user_id, payload.startupName, answers_dict)

    return {"status": "pending", "report_id": report_id}

@router.get("/report-status/{report_id}")
async def get_report_status(report_id: str):
    res = supabase_client.table("validation_reports").select("status, report_data, startup_name").eq("id", report_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "status": res.data[0].get("status"), 
        "report_data": res.data[0].get("report_data"),
        "startup_name": res.data[0].get("startup_name")
    }

@router.post("/claim-report")
async def claim_report(payload: ClaimReportRequest, user: User = Depends(get_current_user)):
    res = supabase_client.table("validation_reports").select("user_id").eq("id", payload.report_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report = res.data[0]
    if report.get("user_id"):
        if report.get("user_id") != user.id:
            raise HTTPException(status_code=403, detail="Report already claimed by another user")
        return {"status": "already_claimed"}
        
    supabase_client.table("validation_reports").update({"user_id": user.id}).eq("id", payload.report_id).execute()
    return {"status": "claimed"}
