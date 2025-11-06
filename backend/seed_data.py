import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_database():
    # MongoDB connection
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'test_database')]
    
    print("Seeding database...")
    
    # Create super admin
    superadmin_email = "superadmin@salah.com"
    existing_superadmin = await db.users.find_one({"email": superadmin_email})
    if not existing_superadmin:
        superadmin = {
            "id": str(uuid.uuid4()),
            "email": superadmin_email,
            "password_hash": pwd_context.hash("superadmin123"),
            "role": "superadmin",
            "mosque_id": None,
            "id_proof": None,
            "status": "approved",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(superadmin)
        print(f"✓ Super admin created: {superadmin_email} / superadmin123")
    else:
        print(f"✓ Super admin already exists: {superadmin_email}")
    
    # Create sample mosques
    mosques_data = [
        {
            "id": str(uuid.uuid4()),
            "name": "Al-Noor Mosque",
            "address": "123 Main Street",
            "city": "New York",
            "country": "USA",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "donation_qr_code": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Masjid Al-Rahman",
            "address": "456 Oak Avenue",
            "city": "Los Angeles",
            "country": "USA",
            "latitude": 34.0522,
            "longitude": -118.2437,
            "donation_qr_code": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Islamic Center",
            "address": "789 Pine Road",
            "city": "Chicago",
            "country": "USA",
            "latitude": 41.8781,
            "longitude": -87.6298,
            "donation_qr_code": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for mosque_data in mosques_data:
        existing = await db.mosques.find_one({"name": mosque_data["name"]})
        if not existing:
            await db.mosques.insert_one(mosque_data)
            print(f"✓ Mosque created: {mosque_data['name']}")
        else:
            print(f"✓ Mosque already exists: {mosque_data['name']}")
    
    print("\n✅ Database seeded successfully!")
    print("\n📝 Credentials:")
    print("Super Admin: superadmin@salah.com / superadmin123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
