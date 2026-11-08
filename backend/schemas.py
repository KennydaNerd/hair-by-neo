"""Pydantic request/response models with input validation."""
import re
from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

StockStatus = Literal["in_stock", "low_stock", "out_of_stock", "enquire"]
AppointmentStatus = Literal["pending", "approved", "rejected", "cancelled"]
PHONE_RE = re.compile(r"^\+?[0-9 ()-]{9,18}$")


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---- Services ----
class ServiceBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(default="", max_length=1000)
    price: Optional[float] = Field(default=None, ge=0, le=1_000_000)
    duration_minutes: Optional[int] = Field(default=None, ge=5, le=1440)
    image_url: Optional[str] = Field(default=None, max_length=500)
    bookable: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: Optional[float] = Field(default=None, ge=0, le=1_000_000)
    duration_minutes: Optional[int] = Field(default=None, ge=5, le=1440)
    image_url: Optional[str] = Field(default=None, max_length=500)
    bookable: Optional[bool] = None


class ServiceOut(ServiceBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_demo: bool = False


# ---- Products ----
class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=60)
    texture: Optional[str] = Field(default=None, max_length=60)
    length_inches: Optional[int] = Field(default=None, ge=4, le=60)
    description: str = Field(default="", max_length=1500)
    price: Optional[float] = Field(default=None, ge=0, le=1_000_000)
    stock_status: StockStatus = "enquire"
    image_url: Optional[str] = Field(default=None, max_length=500)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    category: Optional[str] = Field(default=None, min_length=2, max_length=60)
    texture: Optional[str] = Field(default=None, max_length=60)
    length_inches: Optional[int] = Field(default=None, ge=4, le=60)
    description: Optional[str] = Field(default=None, max_length=1500)
    price: Optional[float] = Field(default=None, ge=0, le=1_000_000)
    stock_status: Optional[StockStatus] = None
    image_url: Optional[str] = Field(default=None, max_length=500)


class ProductOut(ProductBase):
    id: int
    is_demo: bool = False


# ---- Appointments ----
class AppointmentCreate(BaseModel):
    service_id: int
    customer_name: str = Field(min_length=2, max_length=100)
    phone: str
    preferred_date: date
    preferred_time: str
    notes: str = Field(default="", max_length=1000)

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid phone number")
        return v

    @field_validator("preferred_time")
    @classmethod
    def check_time(cls, v: str) -> str:
        try:
            datetime.strptime(v, "%H:%M")
        except ValueError:
            raise ValueError("Time must be in HH:MM format")
        return v

    @field_validator("preferred_date")
    @classmethod
    def check_date(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("Preferred date cannot be in the past")
        return v


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus


class AppointmentOut(BaseModel):
    id: int
    service_id: int
    service_name: Optional[str] = None
    customer_name: str
    phone: str
    preferred_date: date
    preferred_time: str
    notes: str
    status: AppointmentStatus
    created_at: str


class AppointmentReceipt(BaseModel):
    id: int
    status: AppointmentStatus
    message: str


# ---- Enquiries ----
class EnquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str
    email: Optional[str] = Field(default=None, max_length=120)
    message: str = Field(min_length=5, max_length=2000)
    product_id: Optional[int] = None

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid phone number")
        return v

    @field_validator("email")
    @classmethod
    def check_email(cls, v):
        if v in (None, ""):
            return None
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
            raise ValueError("Enter a valid email address")
        return v


class EnquiryOut(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str]
    message: str
    product_id: Optional[int]
    product_name: Optional[str] = None
    handled: bool
    created_at: str


class EnquiryHandledUpdate(BaseModel):
    handled: bool


# ---- Gallery ----
class GalleryCreate(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=60)
    image_url: str = Field(min_length=1, max_length=500)


class GalleryOut(GalleryCreate):
    id: int
    is_demo: bool = False


class DashboardOut(BaseModel):
    pending_appointments: int
    approved_appointments: int
    total_appointments: int
    unhandled_enquiries: int
    products: int
    out_of_stock: int
    services: int
