import os
import json
from anthropic import Anthropic

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
    Calls the Claude API to reframe the raw analysis into a styling profile.
    Enforces post-generation banned-word filtering.
    """
    # Load system prompt from file
    try:
        with open(prompt_path, "r") as f:
            system_prompt = f.read()
    except Exception as e:
        print(f"Error loading prompt: {e}")
        return FALLBACK_PROFILE

    client = Anthropic(api_key=api_key)
    
    user_input = json.dumps({
        "extracted_hex_palette": hex_palette,
        "structural_notes": raw_analysis_labels
    })

    def _call_claude():
        response = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=1000,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_input}
            ]
        )
        return response.content[0].text

    try:
        # First attempt
        response_text = _call_claude()
        
        if contains_banned_words(response_text):
            print("First generation contained banned words. Retrying...")
            # Second attempt
            response_text = _call_claude()
            
            if contains_banned_words(response_text):
                print("Second generation also contained banned words. Falling back.")
                return FALLBACK_PROFILE
                
        # Parse JSON
        return json.loads(response_text)
        
    except Exception as e:
        print(f"Error calling Claude: {e}")
        return FALLBACK_PROFILE
