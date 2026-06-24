from fastapi import APIRouter, Depends, HTTPException, status
import logging
from app.auth import get_current_user, User
from app.supabase_client import supabase_client

router = APIRouter()
logger = logging.getLogger(__name__)

@router.delete("/auth/delete-account")
async def delete_account(current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    try:
        # 1. Delete avatars from storage
        try:
            # We list the files in the user's avatar folder
            avatar_files = supabase_client.storage.from_("avatars").list(user_id)
            if avatar_files:
                file_paths = [f"{user_id}/{f['name']}" for f in avatar_files]
                if file_paths:
                    supabase_client.storage.from_("avatars").remove(file_paths)
        except Exception as e:
            logger.warning(f"Failed to delete avatars for user {user_id}: {str(e)}")

        # 2. Delete pitch-decks from storage
        try:
            pitch_files = supabase_client.storage.from_("pitch-decks").list(user_id)
            if pitch_files:
                file_paths = [f"{user_id}/{f['name']}" for f in pitch_files]
                if file_paths:
                    supabase_client.storage.from_("pitch-decks").remove(file_paths)
        except Exception as e:
            logger.warning(f"Failed to delete pitch-decks for user {user_id}: {str(e)}")

        # 3. Delete the user entirely from auth.users
        # Note: Depending on supabase-py version, the method is auth.admin.delete_user
        response = supabase_client.auth.admin.delete_user(user_id)
        
        return {"success": True, "message": "Account deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting account for {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )
