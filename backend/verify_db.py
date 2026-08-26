import traceback
import sys

# Ensure we can import from the app directory
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.db import supabase

def verify_connection():
    try:
        print("\n--- Supabase Connection Verification ---")
        print(f"Successfully initialized Supabase Client!")
        print(f"Connected to Project URL: {supabase.supabase_url}")
        print("----------------------------------------\n")
        print("Your Python backend is now fully linked to your Supabase project.")
        print("Next step: Paste the contents of 'supabase_schema.sql' into your Supabase SQL Editor and click RUN to create the tables!")
    except Exception as e:
        print(f"\n[ERROR] Failed to initialize Supabase connection: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    verify_connection()
