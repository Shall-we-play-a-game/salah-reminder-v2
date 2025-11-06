from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
import requests
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class Mosque(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    alternate_phone: Optional[str] = None
    address: str
    district: str
    city: str
    state: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    donation_qr_code: Optional[str] = None  # base64 encoded image
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MosqueCreate(BaseModel):
    name: str
    phone: str
    alternate_phone: Optional[str] = None
    address: str
    district: str
    city: str
    state: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    role: str  # 'user', 'admin', 'superadmin'
    mosque_id: Optional[str] = None
    id_proof: Optional[str] = None  # base64 encoded for admins
    favorite_mosques: List[str] = Field(default_factory=list)  # list of mosque IDs
    status: str = "pending"  # 'pending', 'approved', 'rejected'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str
    mosque_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: str
    mosque_id: Optional[str] = None
    status: str
    created_at: datetime

class PrayerTime(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mosque_id: str
    date: str  # YYYY-MM-DD
    fajr: str
    dhuhr: str
    asr: str
    maghrib: str
    isha: str
    is_manual: bool = False  # True if set by admin, False if from API
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PrayerTimeCreate(BaseModel):
    mosque_id: str
    date: str
    fajr: str
    dhuhr: str
    asr: str
    maghrib: str
    isha: str

class Post(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mosque_id: str
    admin_id: str
    title: str
    content: str
    status: str = "pending"  # 'pending', 'approved', 'rejected'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PostCreate(BaseModel):
    title: str
    content: str

class PostUpdate(BaseModel):
    status: str

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def get_user_by_email(email: str):
    return await db.users.find_one({"email": email}, {"_id": 0})

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Salah Reminder API"}

# ========== MOSQUE ROUTES ==========

@api_router.get("/mosques", response_model=List[Mosque])
async def get_mosques():
    mosques = await db.mosques.find({}, {"_id": 0}).to_list(1000)
    for mosque in mosques:
        if isinstance(mosque['created_at'], str):
            mosque['created_at'] = datetime.fromisoformat(mosque['created_at'])
    return mosques

@api_router.get("/mosques/{mosque_id}", response_model=Mosque)
async def get_mosque(mosque_id: str):
    mosque = await db.mosques.find_one({"id": mosque_id}, {"_id": 0})
    if not mosque:
        raise HTTPException(status_code=404, detail="Mosque not found")
    if isinstance(mosque['created_at'], str):
        mosque['created_at'] = datetime.fromisoformat(mosque['created_at'])
    return mosque

@api_router.post("/mosques", response_model=Mosque)
async def create_mosque(mosque: MosqueCreate):
    mosque_obj = Mosque(**mosque.model_dump())
    doc = mosque_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.mosques.insert_one(doc)
    return mosque_obj

@api_router.post("/mosques/{mosque_id}/donation-qr")
async def upload_donation_qr(mosque_id: str, file: UploadFile = File(...)):
    contents = await file.read()
    base64_encoded = base64.b64encode(contents).decode('utf-8')
    
    result = await db.mosques.update_one(
        {"id": mosque_id},
        {"$set": {"donation_qr_code": base64_encoded}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Mosque not found")
    
    return {"message": "QR code uploaded successfully"}

# ========== USER/AUTH ROUTES ==========

@api_router.post("/auth/register")
async def register_user(email: EmailStr = Form(...), password: str = Form(...), 
                        role: str = Form(...), mosque_id: Optional[str] = Form(None),
                        id_proof: Optional[UploadFile] = File(None)):
    # Check if user exists
    existing_user = await get_user_by_email(email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = hash_password(password)
    
    # Handle ID proof for admins
    id_proof_base64 = None
    if role == "admin" and id_proof:
        contents = await id_proof.read()
        id_proof_base64 = base64.b64encode(contents).decode('utf-8')
    
    # Create user
    user_obj = User(
        email=email,
        password_hash=password_hash,
        role=role,
        mosque_id=mosque_id,
        id_proof=id_proof_base64,
        status="pending" if role == "admin" else "approved"
    )
    
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    return UserResponse(
        id=user_obj.id,
        email=user_obj.email,
        role=user_obj.role,
        mosque_id=user_obj.mosque_id,
        status=user_obj.status,
        created_at=user_obj.created_at
    )

@api_router.post("/auth/login")
async def login_user(credentials: UserLogin):
    user = await get_user_by_email(credentials.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user['role'] == 'admin' and user['status'] != 'approved':
        raise HTTPException(status_code=403, detail="Admin account pending approval")
    
    return UserResponse(
        id=user['id'],
        email=user['email'],
        role=user['role'],
        mosque_id=user.get('mosque_id'),
        status=user['status'],
        created_at=datetime.fromisoformat(user['created_at']) if isinstance(user['created_at'], str) else user['created_at']
    )

@api_router.get("/users/pending", response_model=List[UserResponse])
async def get_pending_admins():
    users = await db.users.find({"role": "admin", "status": "pending"}, {"_id": 0}).to_list(1000)
    result = []
    for user in users:
        result.append(UserResponse(
            id=user['id'],
            email=user['email'],
            role=user['role'],
            mosque_id=user.get('mosque_id'),
            status=user['status'],
            created_at=datetime.fromisoformat(user['created_at']) if isinstance(user['created_at'], str) else user['created_at']
        ))
    return result

@api_router.get("/users/{user_id}/id-proof")
async def get_user_id_proof(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id_proof": user.get('id_proof')}

@api_router.patch("/users/{user_id}/status")
async def update_user_status(user_id: str, status: str):
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Status updated successfully"}

# ========== PRAYER TIMES ROUTES ==========

@api_router.get("/prayer-times/{mosque_id}")
async def get_prayer_times(mosque_id: str, date: str):
    # First check if manual times exist
    manual_times = await db.prayer_times.find_one(
        {"mosque_id": mosque_id, "date": date, "is_manual": True},
        {"_id": 0}
    )
    
    if manual_times:
        if isinstance(manual_times.get('created_at'), str):
            manual_times['created_at'] = datetime.fromisoformat(manual_times['created_at'])
        return manual_times
    
    # Try to get from database (API cache)
    cached_times = await db.prayer_times.find_one(
        {"mosque_id": mosque_id, "date": date},
        {"_id": 0}
    )
    
    if cached_times:
        if isinstance(cached_times.get('created_at'), str):
            cached_times['created_at'] = datetime.fromisoformat(cached_times['created_at'])
        return cached_times
    
    # Fetch from Aladhan API
    mosque = await db.mosques.find_one({"id": mosque_id}, {"_id": 0})
    if not mosque:
        raise HTTPException(status_code=404, detail="Mosque not found")
    
    try:
        # Parse date
        date_parts = date.split('-')
        response = requests.get(
            f"http://api.aladhan.com/v1/timings/{date}",
            params={
                "latitude": mosque.get('latitude', 0),
                "longitude": mosque.get('longitude', 0),
                "method": 2  # ISNA method
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        timings = data['data']['timings']
        prayer_time_obj = PrayerTime(
            mosque_id=mosque_id,
            date=date,
            fajr=timings['Fajr'],
            dhuhr=timings['Dhuhr'],
            asr=timings['Asr'],
            maghrib=timings['Maghrib'],
            isha=timings['Isha'],
            is_manual=False
        )
        
        # Cache in database
        doc = prayer_time_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.prayer_times.insert_one(doc)
        
        return prayer_time_obj
    except Exception as e:
        logger.error(f"Error fetching prayer times: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch prayer times")

@api_router.post("/prayer-times", response_model=PrayerTime)
async def set_manual_prayer_times(prayer_time: PrayerTimeCreate):
    # Delete existing entry for this date
    await db.prayer_times.delete_many(
        {"mosque_id": prayer_time.mosque_id, "date": prayer_time.date}
    )
    
    prayer_time_obj = PrayerTime(**prayer_time.model_dump(), is_manual=True)
    doc = prayer_time_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.prayer_times.insert_one(doc)
    
    return prayer_time_obj

# ========== POSTS/FEED ROUTES ==========

@api_router.post("/posts", response_model=Post)
async def create_post(post: PostCreate, admin_id: str, mosque_id: str):
    post_obj = Post(
        mosque_id=mosque_id,
        admin_id=admin_id,
        title=post.title,
        content=post.content
    )
    
    doc = post_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.posts.insert_one(doc)
    
    return post_obj

@api_router.get("/posts", response_model=List[Post])
async def get_posts(mosque_id: Optional[str] = None, status: Optional[str] = None):
    query = {}
    if mosque_id:
        query['mosque_id'] = mosque_id
    if status:
        query['status'] = status
    
    posts = await db.posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for post in posts:
        if isinstance(post['created_at'], str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
    return posts

@api_router.get("/posts/pending", response_model=List[Post])
async def get_pending_posts():
    posts = await db.posts.find({"status": "pending"}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for post in posts:
        if isinstance(post['created_at'], str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
    return posts

@api_router.patch("/posts/{post_id}/status")
async def update_post_status(post_id: str, update: PostUpdate):
    if update.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.posts.update_one(
        {"id": post_id},
        {"$set": {"status": update.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return {"message": "Post status updated successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()