from fastapi.testclient import TestClient
import json

from main import app, StyleResponse, TryOnResponse

client = TestClient(app)

def test_no_numeric_severity_fields_in_style_response():
    """
    Asserts that the /style response payload contains no numeric severity fields.
    This enforces the hard prohibition against exposing raw scores to the frontend.
    """
    response = client.post("/style", json={
        "source_image_b64": "ZHVtbXliNjQ=", # dummyb64
        "mask_b64s": ["ZHVtbXliNjQ="],
        "structural_labels": ["uneven_tone"]
    })
    
    assert response.status_code == 200
    data = response.json()
    
    # Assert fields in StyleResponse schema
    assert "palette_description" in data
    assert "styling_rationale" in data
    assert "vto_parameters" in data
    
    # Assert NO numeric severity fields exist
    forbidden_keys = ["score", "severity", "level", "overall_skin_health_score"]
    
    # Traverse response recursively to check for forbidden keys or numeric types that shouldn't be there
    def check_dict_for_scores(d):
        for k, v in d.items():
            k_lower = k.lower()
            for forbidden in forbidden_keys:
                assert forbidden not in k_lower, f"Forbidden key '{k}' found in response"
            
            # If we find numbers, ensure they are just hex codes or something else, not severity scores.
            # In our defined schema, there shouldn't be standalone numeric metrics at all.
            assert not isinstance(v, (int, float)), f"Numeric value found at '{k}', potential severity score leaked"
                
            if isinstance(v, dict):
                check_dict_for_scores(v)

    check_dict_for_scores(data)

def test_no_numeric_severity_fields_in_tryon_response():
    """
    Asserts that the /tryon response payload contains no numeric severity fields.
    """
    response = client.post("/tryon", json={
        "vto_parameters": {
            "color_direction": "complementary",
            "recommended_colors": ["#000000"],
            "fabric_notes": "cotton"
        }
    })
    
    assert response.status_code == 200
    data = response.json()
    
    assert "render_urls" in data
    
    # Assert NO numeric severity fields exist
    forbidden_keys = ["score", "severity", "level", "overall_skin_health_score"]
    
    for k, v in data.items():
        k_lower = k.lower()
        for forbidden in forbidden_keys:
            assert forbidden not in k_lower, f"Forbidden key '{k}' found in response"
        assert not isinstance(v, (int, float)), f"Numeric value found at '{k}'"
