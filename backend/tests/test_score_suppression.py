import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Use dummy data that won't require live APIs for a simple schema check
dummy_style_request = {
    "source_image_b64": "R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",
    "mask_b64s": ["R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="],
    "structural_labels": ["wrinkles"]
}

dummy_tryon_request = {
    "source_image_b64": "R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",
    "vto_parameters": {
        "color_direction": "complementary",
        "recommended_colors": ["#4A5D23"],
        "fabric_notes": "soft cottons"
    }
}

def test_style_response_schema():
    # Force DEMO_MODE for test
    import os
    os.environ["DEMO_MODE"] = "True"
    
    response = client.post("/style", json=dummy_style_request)
    if response.status_code == 200:
        data = response.json()
        assert "overall_skin_health_score" not in data, "Score leak detected!"
        assert "severity" not in data, "Severity leak detected!"
        
        # Verify the structure doesn't leak scores implicitly
        assert "palette_description" in data
        assert "styling_rationale" in data
        assert "vto_parameters" in data
        
def test_tryon_response_schema():
    import os
    os.environ["DEMO_MODE"] = "True"
    
    response = client.post("/tryon", json=dummy_tryon_request)
    if response.status_code == 200:
        data = response.json()
        assert "overall_skin_health_score" not in data, "Score leak detected!"
        assert "severity" not in data, "Severity leak detected!"
        assert "render_urls" in data
