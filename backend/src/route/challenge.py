from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..ai_generator import generate_challenge_ai
from ..database.db import (
    get_challenge_quota,
    create_challenge_quota,
    reset_quota_if_needed,
    get_user_challenges_history,
    create_challenge
)
from ..util import authenticate_get_user_details
from ..database.models import get_db

import json
from datetime import datetime
import traceback

router = APIRouter()

class ChallengeRequest(BaseModel):
    difficulty: str

    class Config:
        json_schema_extra = {"example": {"difficulty": "easy"}}

@router.post("/generate-challenge")
async def generate_challenge(request: ChallengeRequest, request_obj: Request, db: Session=Depends(get_db)):
    try:
        user_details = authenticate_get_user_details(request_obj)
        user_id = user_details.get("user_id")

        quota = get_challenge_quota(db, user_id)
        if not quota:
            create_challenge_quota(db, user_id)

        quota = reset_quota_if_needed(db, quota)

        if quota.quota_remaining <= 0 :
            raise HTTPException(status_code=429, detail="Quota not enough")
        
        challenge_data = generate_challenge_ai(request.difficulty)
        new_challenge = create_challenge(
            db=db, 
            difficulty=request.difficulty,
            created_by=user_id,
            title=challenge_data['title'],
            options=json.dumps(challenge_data['options']),
            correct_answer_id=challenge_data['correct_answer_id'],
            explanation=challenge_data['explanation']
        )

        quota.quota_remaining -= 1
        db.commit()

        return {
            "id": new_challenge.id,
            "difficulty": new_challenge.difficulty,
            "title": new_challenge.title,
            "options": json.loads(new_challenge.options),
            "correct_answer_id": new_challenge.correct_answer_id,
            "explanation": new_challenge.explanation,
            "timestamp": new_challenge.date_created.isoformat()
        }

    except HTTPException as http_exec:
        raise http_exec

    except Exception as e:
        db.rollback()
        print(f"Error in generate_challenge: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/my-history")
async def my_history(request: Request, db: Session = Depends(get_db)):
    user_details = authenticate_get_user_details(request)
    user_id = user_details.get("user_id")

    challenges = get_user_challenges_history(db, user_id)
    return {"challenges": challenges}

@router.get("/quota")
async def get_quota(request: Request, db: Session = Depends(get_db)):
    user_details = authenticate_get_user_details(request)
    user_id = user_details.get("user_id")

    quota = get_challenge_quota(db, user_id)
    if not quota:
        return {
            "user_id" : user_id,
            "quota_remaining" : 0,
            "last_reset_date" : datetime.now()
        }
    quota = reset_quota_if_needed(db, quota)
    return quota