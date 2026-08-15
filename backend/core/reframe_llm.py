import os
import json
import google.generativeai as genai

BANNED_WORDS = [
    "flaw", "problem", "severe", "correct", "hide", "conceal", "normal", 
    "healthy", "fix", "improve", "suffer", "victim", "abnormal", "defect", 
    "blemish", "imperfection", "treatment", "condition"
]

FALLBACK_PROFILE = {
    "palette_description": "A beautiful interplay of warm and cool undertones forming a highly unique, structural palette.",
    "styling_rationale": "We recommend balancing these rich tones with soft, breathable fabrics in deep earth shades. This approach harmonizes with your natural contrasts rather than competing with them.",
    "vto_parameters": {
        "color_direction": "complementary",
        "recommended_colors": ["#4A5D23", "#8B4513", "#E6E6FA"], # Olive, SaddleBrown, Lavender
        "fabric_notes": "soft cottons and natural linens"
    }
}

def contains_banned_words(text: str) -> bool:
    text_lower = text.lower()
    for word in BANNED_WORDS:
        if word in text_lower:
            return True
    return False

def generate_styling_profile(api_key: str, hex_palette: list[str], raw_analysis_labels: list[str], prompt_path: str = "prompts/reframe_system_prompt.txt") -> dict:
    """
    Calls the Gemini API to reframe the raw analysis into a styling profile.
    Enforces post-generation banned-word filtering.
    """
    try:
        with open(prompt_path, "r") as f:
            system_prompt = f.read()
    except Exception as e:
        print(f"Error loading prompt: {e}")
        return FALLBACK_PROFILE

    genai.configure(api_key=api_key)
    
    # Use Gemini 1.5 Pro
    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro",
        system_instruction=system_prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    user_input = json.dumps({
        "extracted_hex_palette": hex_palette,
        "structural_notes": raw_analysis_labels
    })

    def _call_gemini():
        response = model.generate_content(user_input)
        return response.text

    try:
        # First attempt
        response_text = _call_gemini()
        
        if contains_banned_words(response_text):
            print("First generation contained banned words. Retrying...")
            # Second attempt
            response_text = _call_gemini()
            
            if contains_banned_words(response_text):
                print("Second generation also contained banned words. Falling back.")
                return FALLBACK_PROFILE
                
        # Parse JSON
        return json.loads(response_text)
        
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return FALLBACK_PROFILE
