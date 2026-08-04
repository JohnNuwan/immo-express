"""Contact routes"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Contact, Bien

router = APIRouter(prefix="/api/contact", tags=["contact"])

class ContactRequest(BaseModel):
    bien_id: int = 0
    name: str
    email: str
    phone: str = ""
    message: str

@router.post("")
def submit_contact(req: ContactRequest, db: Session = Depends(get_db)):
    contact = Contact(
        bien_id=req.bien_id if req.bien_id else None,
        name=req.name,
        email=req.email,
        phone=req.phone,
        message=req.message
    )
    db.add(contact)
    db.commit()
    return {"ok": True, "message": "Message envoyé avec succès"}

@router.get("")
def list_contacts(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    contacts = db.query(Contact).order_by(Contact.created_at.desc()).offset(skip).limit(limit).all()
    return [{
        "id": c.id,
        "bien_id": c.bien_id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone or "",
        "message": c.message or "",
        "created_at": str(c.created_at) if c.created_at else ""
    } for c in contacts]