"""Biens CRUD routes"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
from models import Bien, User
from auth import get_current_user, require_user

router = APIRouter(prefix="/api/biens", tags=["biens"])

class BienCreate(BaseModel):
    title: str
    description: str = ""
    category: str
    property_type: str
    price: float
    surface: float
    pieces: int = 1
    chambres: int = 0
    sdb: int = 1
    etage: int = 0
    city: str
    zipcode: str = ""
    address: str = ""
    dpe: str = ""
    condition: str = ""
    equipments: list = []
    publisher_type: str = "particulier"
    publisher_name: str = ""
    publisher_phone: str = ""
    publisher_email: str = ""
    photos: list = []

class BienUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = None
    # all fields optional for partial update

@router.get("")
def list_biens(
    category: Optional[str] = None,
    property_type: Optional[str] = None,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_surface: Optional[float] = None,
    sort: str = "recent",
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Bien).filter(Bien.status == "active")

    if category:
        query = query.filter(Bien.category == category)
    if property_type:
        query = query.filter(Bien.property_type == property_type)
    if city:
        query = query.filter(Bien.city.ilike(f"%{city}%"))
    if min_price is not None:
        query = query.filter(Bien.price >= min_price)
    if max_price is not None:
        query = query.filter(Bien.price <= max_price)
    if min_surface is not None:
        query = query.filter(Bien.surface >= min_surface)

    if sort == "price_asc":
        query = query.order_by(Bien.price)
    elif sort == "price_desc":
        query = query.order_by(desc(Bien.price))
    else:
        query = query.order_by(desc(Bien.created_at))

    total = query.count()
    biens = query.offset(skip).limit(limit).all()

    return {"total": total, "items": [bien_to_dict(b) for b in biens]}

@router.get("/{bien_id}")
def get_bien(bien_id: int, db: Session = Depends(get_db)):
    bien = db.query(Bien).filter(Bien.id == bien_id).first()
    if not bien:
        raise HTTPException(status_code=404, detail="Bien non trouvé")
    bien.views += 1
    db.commit()
    return bien_to_dict(bien)

@router.post("")
def create_bien(
    data: BienCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bien = Bien(
        owner_id=current_user.id if current_user else None,
        title=data.title,
        description=data.description,
        category=data.category,
        property_type=data.property_type,
        price=data.price,
        surface=data.surface,
        pieces=data.pieces,
        chambres=data.chambres,
        sdb=data.sdb,
        etage=data.etage,
        city=data.city,
        zipcode=data.zipcode,
        address=data.address,
        dpe=data.dpe,
        condition=data.condition,
        equipments=data.equipments,
        publisher_type=data.publisher_type,
        publisher_name=data.publisher_name,
        publisher_phone=data.publisher_phone,
        publisher_email=data.publisher_email,
        photos=data.photos,
        trust_score=compute_trust_score(data),
        verified=current_user.role == "pro" if current_user else False
    )
    db.add(bien)
    db.commit()
    db.refresh(bien)
    return bien_to_dict(bien)

@router.put("/{bien_id}")
def update_bien(bien_id: int, data: BienUpdate, db: Session = Depends(get_db)):
    bien = db.query(Bien).filter(Bien.id == bien_id).first()
    if not bien:
        raise HTTPException(status_code=404, detail="Bien non trouvé")
    for key, val in data.dict(exclude_unset=True).items():
        setattr(bien, key, val)
    db.commit()
    db.refresh(bien)
    return bien_to_dict(bien)

@router.delete("/{bien_id}")
def delete_bien(bien_id: int, db: Session = Depends(get_db)):
    bien = db.query(Bien).filter(Bien.id == bien_id).first()
    if not bien:
        raise HTTPException(status_code=404, detail="Bien non trouvé")
    db.delete(bien)
    db.commit()
    return {"ok": True}

def bien_to_dict(b: Bien) -> dict:
    return {
        "id": b.id,
        "owner_id": b.owner_id,
        "title": b.title,
        "description": b.description,
        "category": b.category,
        "property_type": b.property_type,
        "price": b.price,
        "price_sub": b.price_sub or "",
        "surface": b.surface,
        "land_surface": b.land_surface,
        "pieces": b.pieces,
        "chambres": b.chambres,
        "sdb": b.sdb,
        "etage": b.etage,
        "city": b.city,
        "zipcode": b.zipcode or "",
        "address": b.address or "",
        "region": b.region or "",
        "dpe": b.dpe or "",
        "condition": b.condition or "",
        "equipments": b.equipments or [],
        "publisher_type": b.publisher_type or "particulier",
        "publisher_name": b.publisher_name or "",
        "publisher_phone": b.publisher_phone or "",
        "publisher_email": b.publisher_email or "",
        "photos": b.photos or [],
        "trust_score": b.trust_score or 0,
        "verified": b.verified or False,
        "status": b.status or "active",
        "views": b.views or 0,
        "created_at": str(b.created_at) if b.created_at else "",
        "updated_at": str(b.updated_at) if b.updated_at else "",
    }

def compute_trust_score(data: BienCreate) -> int:
    """Simple trust score based on completeness"""
    score = 50
    if data.title and len(data.title) > 10:
        score += 10
    if data.description and len(data.description) > 50:
        score += 10
    if data.photos and len(data.photos) > 0:
        score += 10
    if data.dpe:
        score += 5
    if data.publisher_type == "pro":
        score += 10
    if data.equipments and len(data.equipments) > 2:
        score += 5
    return min(score, 100)