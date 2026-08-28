import urllib.request
import urllib.parse
import json

def get_nearby_hospitals(postal_code: str) -> list:
    """
    Uses the OpenStreetMap Nominatim API to find nearby hospitals or clinics based on a postal code.
    This does not require an API key but must have a descriptive User-Agent.
    """
    url = f"https://nominatim.openstreetmap.org/search?postalcode={urllib.parse.quote(postal_code)}&amenity=hospital&format=json&limit=5&countrycodes=in"
    
    headers = {
        'User-Agent': 'ProjectSamanvaya/1.0 (Contact: demo@example.com)'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
        results = []
        for place in data:
            results.append({
                "name": place.get("name", "Unknown Hospital"),
                "address": place.get("display_name", ""),
                "lat": place.get("lat"),
                "lon": place.get("lon")
            })
            
        return results
    except Exception as e:
        print(f"Error querying OpenStreetMap: {e}")
        return []
