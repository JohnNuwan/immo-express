"""Admin routes"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, Bien, Contact
from auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    total_biens = db.query(func.count(Bien.id)).scalar()
    total_contacts = db.query(func.count(Contact.id)).scalar()
    active_biens = db.query(func.count(Bien.id)).filter(Bien.status == "active").scalar()
    total_views = db.query(func.sum(Bien.views)).scalar() or 0

    return {
        "total_users": total_users,
        "total_biens": total_biens,
        "active_biens": active_biens,
        "total_contacts": total_contacts,
        "total_views": total_views,
    }

@router.get("/users")
def list_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [{"id": u.id, "email": u.email, "username": u.username, "role": u.role, "created_at": str(u.created_at)} for u in users]

@router.get("/biens")
def admin_list_biens(
    status: str = Query("all"),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Bien)
    if status != "all":
        query = query.filter(Bien.status == status)
    biens = query.order_by(Bien.created_at.desc()).all()
    return [{"id": b.id, "title": b.title, "city": b.city, "price": b.price, "status": b.status, "views": b.views, "created_at": str(b.created_at)} for b in biens]

@router.put("/biens/{bien_id}/verify")
def verify_bien(bien_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    bien = db.query(Bien).filter(Bien.id == bien_id).first()
    if not bien:
        return {"error": "Bien non trouvé"}
    bien.verified = not bien.verified
    db.commit()
    return {"ok": True, "verified": bien.verified}