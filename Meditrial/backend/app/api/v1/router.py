import base64
import hashlib
import hmac
import re
import secrets
import time
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.patient import PatientProfile, PatientSession, RelationCredential
from app.db.session import get_db

api_router = APIRouter()
bearer = HTTPBearer(auto_error=False)
PBKDF2_ROUNDS = 310_000


class RegisterBody(BaseModel):
    profile: dict[str, Any]
    password: str = Field(min_length=8, max_length=128)


class LoginBody(BaseModel):
    identifier: str = Field(min_length=1, max_length=320)
    password: str = Field(min_length=1, max_length=128)


class ProfileBody(BaseModel):
    profile: dict[str, Any]


class RelationPasswordBody(BaseModel):
    relation_id: str = Field(min_length=1, max_length=100)
    username: str = Field(min_length=3, max_length=80)
    password: str = Field(min_length=8, max_length=128)
    current_password: str | None = Field(default=None, min_length=1, max_length=128)


class ChangePasswordBody(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class DoctorSearchBody(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    password: str = Field(min_length=1, max_length=128)


def _token_digest(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ROUNDS)
    return "pbkdf2_sha256${}${}${}".format(
        PBKDF2_ROUNDS,
        base64.urlsafe_b64encode(salt).decode(),
        base64.urlsafe_b64encode(digest).decode(),
    )


def _password_matches(password: str, encoded: str | None) -> bool:
    if not encoded:
        return False
    try:
        scheme, rounds, salt, expected = encoded.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), base64.urlsafe_b64decode(salt), int(rounds)
        )
        return hmac.compare_digest(digest, base64.urlsafe_b64decode(expected))
    except (ValueError, TypeError):
        return False


def _validate_profile(profile: dict[str, Any], previous: dict[str, Any] | None = None) -> dict[str, Any]:
    cleaned = dict(profile)
    for key in ("username", "email", "name", "age", "bloodGroup", "gender"):
        if not str(cleaned.get(key, "")).strip():
            raise HTTPException(status_code=422, detail=f"{key} is required")
    cleaned["username"] = str(cleaned["username"]).strip()
    cleaned["email"] = str(cleaned["email"]).strip().lower()
    if len(cleaned["username"]) < 3:
        raise HTTPException(status_code=422, detail="username must be at least 3 characters")
    phone = str(cleaned.get("phone", "")).strip()
    if phone and not re.fullmatch(r"\d{10}", phone):
        raise HTTPException(status_code=422, detail="Phone number must contain exactly 10 digits")
    _validate_profile_dates(cleaned)
    _validate_appointment_dates(cleaned, previous)
    for relation in cleaned.get("relations", []):
        if isinstance(relation, dict):
            nested = relation.get("profile")
            if isinstance(nested, dict):
                relation_phone = str(nested.get("phone", "")).strip()
                if relation_phone and not re.fullmatch(r"\d{10}", relation_phone):
                    raise HTTPException(status_code=422, detail="Relation phone number must contain exactly 10 digits")
                _validate_profile_dates(nested)
    return cleaned


def _appointments_by_owner(profile: dict[str, Any] | None) -> dict[tuple[str, str], str]:
    if not profile:
        return {}
    people = [(str(profile.get("username", "")).lower(), profile)]
    people.extend(
        (str(item.get("profile", {}).get("username", "")).lower(), item.get("profile", {}))
        for item in profile.get("relations", []) if isinstance(item, dict) and isinstance(item.get("profile"), dict)
    )
    return {
        (username, str(item.get("id", ""))): str(item.get("date", ""))
        for username, person in people
        for item in person.get("appointments", []) if isinstance(item, dict)
    }


def _validate_appointment_dates(profile: dict[str, Any], previous: dict[str, Any] | None) -> None:
    existing = _appointments_by_owner(previous)
    today = datetime.now().date()
    for username, person in [(str(profile.get("username", "")).lower(), profile), *[
        (str(item.get("profile", {}).get("username", "")).lower(), item.get("profile", {}))
        for item in profile.get("relations", []) if isinstance(item, dict) and isinstance(item.get("profile"), dict)
    ]]:
        for item in person.get("appointments", []):
            if not isinstance(item, dict) or not item.get("date"):
                continue
            value = str(item["date"])
            try:
                appointment_date = datetime.strptime(value, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(status_code=422, detail="Appointment dates must use YYYY-MM-DD format")
            prior_date = existing.get((username, str(item.get("id", ""))))
            if appointment_date < today and prior_date != value:
                raise HTTPException(status_code=422, detail="Appointments must be scheduled for today or a future date")


def _validate_profile_dates(profile: dict[str, Any]) -> None:
    """Enforce date limits at the API boundary as well as in browser controls."""
    today = datetime.now().date()
    for problem in profile.get("problems", []):
        if not isinstance(problem, dict):
            continue
        dates = []
        dates.extend(item.get("date") for item in problem.get("severityHistory", []) if isinstance(item, dict))
        for hospital in problem.get("hospitals", []):
            if isinstance(hospital, dict):
                dates.extend(item.get("date") for item in hospital.get("records", []) if isinstance(item, dict))
        for value in dates:
            if not value:
                continue
            try:
                date = datetime.strptime(str(value), "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(status_code=422, detail="Dates must use YYYY-MM-DD format")
            if date > today:
                raise HTTPException(status_code=422, detail="Future dates are not allowed")


async def _issue_session(db: AsyncSession, patient: PatientProfile) -> dict[str, Any]:
    token = secrets.token_urlsafe(32)
    db.add(PatientSession(token_hash=_token_digest(token), email=patient.email, expires_at=int(time.time()) + 60 * 60 * 24 * 30))
    await db.commit()
    return {"token": token, "profile": patient.profile}


async def current_patient(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> PatientProfile:
    if not credentials:
        raise HTTPException(status_code=401, detail="Sign in required")
    session = await db.get(PatientSession, _token_digest(credentials.credentials))
    if not session or session.expires_at < int(time.time()):
        raise HTTPException(status_code=401, detail="Session expired. Sign in again.")
    patient = await db.get(PatientProfile, session.email)
    if not patient:
        raise HTTPException(status_code=401, detail="Account no longer exists")
    return patient


@api_router.post("/auth/register", status_code=201)
async def register(body: RegisterBody, db: AsyncSession = Depends(get_db)):
    profile = _validate_profile(body.profile)
    existing = await db.scalar(select(PatientProfile).where(
        (func.lower(PatientProfile.email) == profile["email"])
        | (func.lower(PatientProfile.username) == profile["username"].lower())
    ))
    if existing:
        raise HTTPException(status_code=409, detail="That email or username is already registered")
    patient = PatientProfile(
        email=profile["email"], username=profile["username"], display_name=profile["name"],
        password_hash=_password_hash(body.password), profile=profile,
    )
    db.add(patient)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="That email or username is already registered") from None
    return await _issue_session(db, patient)


@api_router.post("/auth/login")
async def login(body: LoginBody, db: AsyncSession = Depends(get_db)):
    identifier = body.identifier.strip().lower()
    patient = await db.scalar(select(PatientProfile).where(
        (func.lower(PatientProfile.email) == identifier)
        | (func.lower(PatientProfile.username) == identifier)
    ))
    if patient and not patient.password_hash:
        # One-time password setup for accounts created before password protection was added.
        patient.password_hash = _password_hash(body.password)
        await db.commit()
    elif not patient or not _password_matches(body.password, patient.password_hash):
        raise HTTPException(status_code=401, detail="Email/username or password is incorrect")
    return await _issue_session(db, patient)


@api_router.post("/auth/logout", status_code=204)
async def logout(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: AsyncSession = Depends(get_db),
):
    if credentials:
        session = await db.get(PatientSession, _token_digest(credentials.credentials))
        if session:
            await db.delete(session)
            await db.commit()


@api_router.get("/patients/me")
async def get_my_profile(patient: PatientProfile = Depends(current_patient)):
    return {"profile": patient.profile}


@api_router.put("/patients/me")
async def update_my_profile(
    body: ProfileBody,
    patient: PatientProfile = Depends(current_patient),
    db: AsyncSession = Depends(get_db),
):
    profile = _validate_profile(body.profile, patient.profile)
    if profile["email"] != patient.email or profile["username"].lower() != patient.username.lower():
        raise HTTPException(status_code=422, detail="Email and username cannot be changed here")
    patient.profile = profile
    patient.display_name = profile["name"]
    patient.updated_at = datetime.now(timezone.utc)
    valid_relation_usernames = {
        str(item.get("id")): item.get("profile", {}).get("username", "").strip().lower()
        for item in profile.get("relations", [])
    }
    credentials = (await db.scalars(select(RelationCredential).where(RelationCredential.owner_email == patient.email))).all()
    for credential in credentials:
        if valid_relation_usernames.get(credential.relation_id) != credential.username:
            await db.delete(credential)
    await db.commit()
    return {"profile": profile}


@api_router.put("/patients/me/relations/password")
async def set_relation_password(
    body: RelationPasswordBody,
    patient: PatientProfile = Depends(current_patient),
    db: AsyncSession = Depends(get_db),
):
    relation = next((item for item in patient.profile.get("relations", [])
                     if str(item.get("id")) == body.relation_id
                     and item.get("profile", {}).get("username", "").lower() == body.username.strip().lower()), None)
    if relation is None:
        raise HTTPException(status_code=404, detail="Relation not found in this account")
    normalized_username = body.username.strip().lower()
    patient_with_name = await db.scalar(select(PatientProfile).where(func.lower(PatientProfile.username) == normalized_username))
    if patient_with_name:
        raise HTTPException(status_code=409, detail="This username is already used by a patient account")
    credential = await db.get(RelationCredential, normalized_username)
    if credential and (credential.owner_email != patient.email or credential.relation_id != body.relation_id):
        raise HTTPException(status_code=409, detail="This relation username is already in use")
    if credential:
        if not body.current_password or not _password_matches(body.current_password, credential.password_hash):
            raise HTTPException(status_code=401, detail="Current relation password is incorrect")
        if body.current_password == body.password:
            raise HTTPException(status_code=422, detail="Choose a new password different from the current password")
        credential.password_hash = _password_hash(body.password)
    else:
        db.add(RelationCredential(username=normalized_username, owner_email=patient.email,
                                  relation_id=body.relation_id, password_hash=_password_hash(body.password)))
    await db.commit()
    return {"success": True}


@api_router.put("/patients/me/password")
async def change_patient_password(
    body: ChangePasswordBody,
    patient: PatientProfile = Depends(current_patient),
    db: AsyncSession = Depends(get_db),
):
    if not _password_matches(body.current_password, patient.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    if body.current_password == body.new_password:
        raise HTTPException(status_code=422, detail="Choose a new password different from the current password")
    patient.password_hash = _password_hash(body.new_password)
    await db.commit()
    return {"success": True}


def _shared_view(profile: dict[str, Any]) -> dict[str, Any]:
    return {
        "username": profile["username"],
        "name": profile["name"],
        "age": profile.get("age", ""),
        "gender": profile["gender"],
        "bloodGroup": profile["bloodGroup"],
        "complications": profile.get("complications", []),
        "problems": [item for item in profile.get("problems", []) if item.get("sharing", True)],
    }


@api_router.post("/patients/search")
async def search_patient(body: DoctorSearchBody, db: AsyncSession = Depends(get_db)):
    username = body.username.strip().lower()
    patient = await db.scalar(select(PatientProfile).where(func.lower(PatientProfile.username) == username))
    if patient:
        if not _password_matches(body.password, patient.password_hash):
            raise HTTPException(status_code=401, detail="Username or password is incorrect")
        return {"profile": _shared_view(patient.profile)}

    credential = await db.scalar(select(RelationCredential).where(func.lower(RelationCredential.username) == username))
    if not credential or not _password_matches(body.password, credential.password_hash):
        raise HTTPException(status_code=401, detail="Username or password is incorrect")
    owner = await db.get(PatientProfile, credential.owner_email)
    relation = next((item for item in (owner.profile.get("relations", []) if owner else [])
                     if str(item.get("id")) == credential.relation_id), None)
    if not relation:
        raise HTTPException(status_code=404, detail="Relation not found")
    return {"profile": _shared_view(relation["profile"])}
