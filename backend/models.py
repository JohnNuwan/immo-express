"""Database models"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # user, pro, admin
    company = Column(String(255), default="")
    phone = Column(String(20), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Bien(Base):
    __tablename__ = "biens"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, index=True, nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    category = Column(String(20), nullable=False)  # vente, location
    property_type = Column(String(50), nullable=False)
    price = Column(Float, nullable=False)
    price_sub = Column(String(50), default="")
    surface = Column(Float, nullable=False)
    land_surface = Column(Float, default=0)
    pieces = Column(Integer, default=1)
    chambres = Column(Integer, default=0)
    sdb = Column(Integer, default=1)
    etage = Column(Integer, default=0)
    city = Column(String(100), nullable=False)
    zipcode = Column(String(10), default="")
    address = Column(String(255), default="")
    region = Column(String(100), default="")
    dpe = Column(String(5), default="")
    condition = Column(String(50), default="")
    chauffage = Column(String(50), default="")
    equipments = Column(JSON, default=list)
    publisher_type = Column(String(20), default="particulier")  # particulier, pro
    publisher_name = Column(String(100), default="")
    publisher_phone = Column(String(20), default="")
    publisher_email = Column(String(255), default="")
    photos = Column(JSON, default=list)
    trust_score = Column(Integer, default=0)
    verified = Column(Boolean, default=False)
    status = Column(String(20), default="active")  # active, draft, sold, archived
    views = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    bien_id = Column(Integer, index=True, nullable=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), default="")
    message = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())