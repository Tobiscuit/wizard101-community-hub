import json
import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin
try:
    if not firebase_admin._apps:
        service_account_key = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
        
        if service_account_key:
            # Check if it's a file path
            if os.path.exists(service_account_key):
                cred = credentials.Certificate(service_account_key)
                print(f"Loaded credentials from file: {service_account_key}")
            else:
                # Assume it's a JSON string
                try:
                    cred = credentials.Certificate(json.loads(service_account_key))
                    print("Loaded credentials from JSON string.")
                except json.JSONDecodeError:
                    print("Error: FIREBASE_SERVICE_ACCOUNT_KEY is neither a valid file path nor a valid JSON string.")
                    exit(1)
                    
            firebase_admin.initialize_app(cred)
        else:
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred, {
                'projectId': os.getenv('FIREBASE_PROJECT_ID'),
            })
            print("Firebase Admin initialized with ADC.")
    
    db = firestore.client()
except Exception as e:
    print(f"Firebase initialization failed: {e}")
    exit(1)

def seed_pets():
    try:
        with open('pets.json', 'r') as f:
            pets = json.load(f)
            
        print(f"Found {len(pets)} pets to seed.")
        
        batch = db.batch()
        count = 0
        total = 0
        
        for pet in pets:
            doc_ref = db.collection('scraped_pets').document(pet['petType'])
            batch.set(doc_ref, {
                'petType': pet['petType'],
                'petSchool': pet['petSchool'],
                'scrapedAt': firestore.SERVER_TIMESTAMP
            })
            count += 1
            total += 1
            
            if count >= 400: # Batch limit is 500
                batch.commit()
                print(f"Committed {count} pets...")
                batch = db.batch()
                count = 0
                
        if count > 0:
            batch.commit()
            print(f"Committed final {count} pets.")
            
        print(f"Successfully seeded {total} pets to Firestore!")
        
    except Exception as e:
        print(f"Seeding failed: {e}")

if __name__ == "__main__":
    seed_pets()
