import os
import time
import json
from curl_cffi import requests
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin
try:
    if not firebase_admin._apps:
        service_account_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
        if service_account_json:
            cred = credentials.Certificate(json.loads(service_account_json))
            firebase_admin.initialize_app(cred)
            print("Firebase Admin initialized with service account from env.")
        else:
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred, {
                'projectId': os.getenv('FIREBASE_PROJECT_ID'),
            })
            print("Firebase Admin initialized with Application Default Credentials.")
    
    db = firestore.client()
except Exception as e:
    print(f"Firebase initialization failed: {e}")
    print("Running in DRY RUN mode (no database writes).")
    db = None

WIKI_BASE_URL = "https://www.wizard101central.com/wiki"

def scrape_all_pet_names():
    # List of school categories to scrape
    # These are the standard category names on W101 Central
    schools = ["Fire", "Ice", "Storm", "Life", "Myth", "Death", "Balance"]
    
    total_count = 0
    
    for school in schools:
        category_url = f"{WIKI_BASE_URL}/Category:{school}_Pets"
        print(f"\nFetching {school} Pets from {category_url}...")
        
        try:
            response = requests.get(
                category_url,
                impersonate="chrome120",
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                timeout=30
            )
            
            if response.status_code != 200:
                print(f"Error fetching {school}: Status {response.status_code}")
                continue

            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Selector for pet links in the category list
            pet_links = soup.select("#mw-pages li a")
            print(f"Found {len(pet_links)} {school} pets.")
            
            for link in pet_links:
                pet_name = link.text.replace('Pet:', '').strip()
                
                # Skip non-pet entries (categories, templates, etc.)
                if "Category:" in pet_name or "Template:" in pet_name or "Images" in pet_name:
                    continue
                
                # print(f"  - {pet_name}") # Verbose logging
                
                if db:
                    doc_ref = db.collection('scraped_pets').document(pet_name)
                    doc_ref.set({
                        "petType": pet_name,
                        "petSchool": school, # Now we know the school!
                        "scrapedAt": firestore.SERVER_TIMESTAMP
                    }, merge=True) # Merge to avoid overwriting if exists
                    
                total_count += 1
                
            # Be nice to the server
            time.sleep(2)

        except Exception as e:
            print(f"Failed to scrape {school}: {e}")

    print(f"\nTotal pets scraped: {total_count}")

if __name__ == "__main__":
    # scrape_pet_page("Scaly Frillasaur") # Old single test
    scrape_all_pet_names() # New batch crawl
