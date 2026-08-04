"""Scoring routes"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/scoring", tags=["scoring"])

class ScoringRequest(BaseModel):
    city: str
    property_type: str
    category: str
    price: float
    surface: float
    pieces: int = 1
    condition: str = "bon"
    dpe: str = ""
    etage: int = 0
    equipments: str = "moyen"
    transports: str = "bon"

@router.post("")
def analyze_score(req: ScoringRequest):
    """Analyze property and return multi-criteria score"""
    # Price score (compare with pseudo market data)
    market_prices = {
        "paris": 10500, "lyon": 5200, "bordeaux": 4800,
        "marseille": 3400, "toulouse": 3600, "lille": 3100,
        "montpellier": 3400, "nantes": 3800, "strasbourg": 4000,
        "nice": 5500, "rennes": 3500, "grenoble": 2800,
    }
    city_key = req.city.lower().split(" ")[0]
    market_price_m2 = market_prices.get(city_key, 3000)
    current_price_m2 = req.price / max(req.surface, 1)
    price_ratio = current_price_m2 / market_price_m2

    if price_ratio < 0.8:
        price_score = 90
    elif price_ratio < 0.95:
        price_score = 75
    elif price_ratio < 1.05:
        price_score = 60
    elif price_ratio < 1.2:
        price_score = 40
    else:
        price_score = 20

    # Surface score
    type_surface = {"appartement": 50, "maison": 80, "studio": 25, "villa": 100, "local": 100}
    surf_score = min(100, (req.surface / type_surface.get(req.property_type, 50)) * 100)

    # Condition score
    cond_scores = {"neuf": 95, "bon": 75, "travaux": 45, "renover": 20}
    cond_score = cond_scores.get(req.condition, 50)

    # DPE score
    dpe_scores = {"A": 100, "B": 85, "C": 70, "D": 55, "E": 35, "F": 20, "G": 5}
    dpe_score = dpe_scores.get(req.dpe.upper(), 40)

    # Transport score
    trans_scores = {"excellent": 90, "bon": 70, "moyen": 45, "faible": 20}
    trans_score = trans_scores.get(req.transports, 50)

    # Equipment score
    equip_scores = {"luxe": 95, "haut": 80, "moyen": 60, "basique": 35, "aucun": 10}
    equip_score = equip_scores.get(req.equipments, 50)

    # Weighted total
    total = round(
        price_score * 0.25 +
        surf_score * 0.10 +
        cond_score * 0.15 +
        dpe_score * 0.15 +
        trans_score * 0.15 +
        equip_score * 0.10 +
        75 * 0.10  # location bonus
    )
    total = max(0, min(100, total))

    return {
        "total": total,
        "verdict": "Excellent" if total >= 80 else "Bon" if total >= 60 else "Moyen" if total >= 40 else "Faible",
        "details": {
            "prix": {"score": price_score, "label": "Justesse du prix", "detail": f"{current_price_m2:.0f} €/m² vs {market_price_m2} €/m² (marché)"},
            "surface": {"score": surf_score, "label": "Surface", "detail": f"{req.surface} m²"},
            "etat": {"score": cond_score, "label": "État du bien", "detail": req.condition},
            "dpe": {"score": dpe_score, "label": "Diagnostic énergétique", "detail": f"DPE {req.dpe}" if req.dpe else "Non renseigné"},
            "transports": {"score": trans_score, "label": "Transports", "detail": req.transports},
            "equipements": {"score": equip_score, "label": "Équipements", "detail": req.equipments},
        },
        "market_avg": round(market_price_m2 * req.surface),
        "price_per_m2": round(current_price_m2),
        "price_diff_pct": round((price_ratio - 1) * 100)
    }