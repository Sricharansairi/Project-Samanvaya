import os
import sys

# Add the parent directory to the path so app can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

# Vercel looks for a variable named `app` in this file
