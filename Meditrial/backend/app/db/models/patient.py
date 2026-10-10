from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.db.models.base import Base


class PatientProfile(Base):
    __tablename__ = "api_patient_profiles"

    email: Mapped[str] = mapped_column(String(320), primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(160))
    password_hash: Mapped[str | None] = mapped_column(String(160), nullable=True)
    profile: Mapped[dict] = mapped_column(MutableDict.as_mutable(JSON().with_variant(JSONB, "postgresql")))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PatientSession(Base):
    __tablename__ = "api_patient_sessions"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    email: Mapped[str] = mapped_column(ForeignKey("api_patient_profiles.email", ondelete="CASCADE"), index=True)
    expires_at: Mapped[int] = mapped_column(Integer)


class RelationCredential(Base):
    __tablename__ = "api_relation_credentials"

    username: Mapped[str] = mapped_column(String(80), primary_key=True)
    owner_email: Mapped[str] = mapped_column(ForeignKey("api_patient_profiles.email", ondelete="CASCADE"), index=True)
    relation_id: Mapped[str] = mapped_column(String(100))
    password_hash: Mapped[str] = mapped_column(String(160))
