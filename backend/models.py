from pydantic import BaseModel
from typing import List, Optional

class RegisterPerson(BaseModel):
    name: str
    userid: str

class VerificationResponse(BaseModel):
    verified: bool
    userid: Optional[str] = None
    name: Optional[str] = None
    confidence: Optional[float] = None