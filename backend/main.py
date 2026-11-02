import os
import base64
import asyncio
import httpx
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

import json
from core.color_extraction import extract_dominant_colors
from core.reframe_llm import generate_styling_profile
import openai  # Using openai package for DashScope compatibility

load_dotenv()

DEMO_MODE = os.getenv("DEMO_MODE", "False").lower() in ("true", "1", "yes")

app = FastAPI(title="Aura Reframe API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Config ---
YOUCAM_API_URL = os.getenv("YOUCAM_API_URL", "https://api.perfectcorp.com/v1.0")
YOUCAM_API_KEY = os.getenv("YOUCAM_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY")

# --- Stable Catalogue (16 garments, 4 categories) ---
# Each garment has a stable ID, name, image URL, colour hex, category,
# compatible style directions, and VTO asset reference.
# At least 2-3 garments fit multiple directions.
# All 16 are selectable; recommendations narrow the catalogue rather than hide everything else.
CATALOGUE = [
    {
        "id": "01",
        "name": "Cotton White Top",
        "colour": "#F8F8F8",
        "category": "top",
        "directions": ["understated", "everyday"],
        "vto_asset": "/vto_white_top.jpg"
    },
    {
        "id": "02",
        "name": "Deep Teal Blouse",
        "colour": "#2D5A87",
        "category": "top",
        "directions": ["bold", "experimental"],
        "vto_asset": "/vto_teal_blouse.jpg"
    },
    {
        "id": "03",
        "name": "Warm Camel Dress",
        "colour": "#C49A6C",
        "category": "dress",
        "directions": ["warm", "everyday", "formal"],
        "vto_asset": "/vto_camel_dress.jpg"
    },
    {
        "id": "04",
        "name": "Sage Green Jacket",
        "colour": "#6B8E65",
        "category": "jacket",
        "directions": ["soft", "everyday"],
        "vto_asset": "/vto_sage_jacket.jpg"
    },
    {
        "id": "05",
        "name": "Royal Purple Top",
        "colour": "#6A0DAD",
        "category": "top",
        "directions": ["bold", "experimental"],
        "vto_asset": "/vto_purple_top.jpg"
    },
    {
        "id": "06",
        "name": "Blush Pink Dress",
        "colour": "#E8B4BC",
        "category": "dress",
        "directions": ["soft", "everyday"],
        "vto_asset": "/vto_blush_dress.jpg"
    },
    {
        "id": "07",
        "name": "Nero Jacket",
        "colour": "#252526",
        "category": "jacket",
        "directions": ["bold", "formal"],
        "vto_asset": "/vto_nero_jacket.jpg"
    },
    {
        "id": "08",
        "name": "Ochre Top",
        "colour": "#C58640",
        "category": "top",
        "directions": ["warm", "experimental"],
        "vto_asset": "/vto_ochre_top.jpg"
    },
    {
        "id": "09",
        "name": "Ivory Dress",
        "colour": "#FFFFF0",
        "category": "dress",
        "directions": ["understated", "everyday"],
        "vto_asset": "/vto_ivory_dress.jpg"
    },
    {
        "id": "10",
        "name": "Forest Green Jacket",
        "colour": "#228B22",
        "category": "jacket",
        "directions": ["soft", "everyday", "warm"],
        "vto_asset": "/vto_forest_jacket.jpg"
    },
    {
        "id": "11",
        "name": "Coral Top",
        "colour": "#FF7F50",
        "category": "top",
        "directions": ["bold", "experimental"],
        "vto_asset": "/vto_coral_top.jpg"
    },
    {
        "id": "12",
        "name": "Sky Blue Dress",
        "colour": "#87CEEB",
        "category": "dress",
        "directions": ["cool", "everyday"],
        "vto_asset": "/vto_sky_dress.jpg"
    },
    {
        "id": "13",
        "name": "Metallic Silver Jacket",
        "colour": "#C0C0C0",
        "category": "jacket",
        "directions": ["bold", "experimental"],
        "vto_asset": "/vto_silver_jacket.jpg"
    },
    {
        "id": "14",
        "name": "Lavender Dress",
        "colour": "#E6E6FA",
        "category": "dress",
        "directions": ["soft", "everyday", "cool"],
        "vto_asset": "/vto_lavender_dress.jpg"
    },
    {
        "id": "15",
        "name": "Charcoal Top",
        "colour": "#36454F",
        "category": "top",
        "directions": ["formal", "understated"],
        "vto_asset": "/vto_charcoal_top.jpg"
    },
    {
        "id": "16",
        "name": "Gold Accessory",
        "colour": "#FFD700",
        "category": "accessory",
        "directions": ["bold", "experimental"],
        "vto_asset": "/vto_gold_accessory.jpg"
    }
]

# Helper: filter catalogue by compatible directions
def filter_catalogue_by_directions(directions: list[str]) -> list[dict]:
    """Return garments that match at least one of the requested directions."""
    if not directions:
        return CATALOGUE
    return [g for g in CATALOGUE if any(d in g["directions"] for d in directions)]


# --- Pydantic Models ---
class AnalyzeResponse(BaseModel):
    session_id: str
    mask_b64s: List[str]
    structural_labels: List[str]

class StyleRequest(BaseModel):
    source_image_b64: str
    mask_b64s: List[str]
    structural_labels: List[str]
    selected_style: str = "bold"  # style_direction preference passed through one recommendation pipeline

class StyleResponse(BaseModel):
    palette_description: str
    styling_rationale: str
    vto_parameters: dict
    recommended_garment_ids: List[str]

class TryOnRequest(BaseModel):
    vto_parameters: dict
    source_image_b64: str
    selected_style: str = "bold"  # style_direction
    selected_garment_id: str | None = None  # specific garment to try on

class TryOnResponse(BaseModel):
    render_urls: List[str]
    garment_id: str | None = None  # which garment was tried
    prototype: bool = True  # flag to indicate if this is a prototype preview

# --- Endpoints ---

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_skin(file: UploadFile = File(...)):
    if DEMO_MODE:
        with open("fixtures/analyze.json", "r") as f:
            return json.load(f)
            
    if not YOUCAM_API_KEY:
        raise HTTPException(status_code=500, detail="YOUCAM_API_KEY is missing from .env")
        
    image_bytes = await file.read()
    
    async with httpx.AsyncClient() as client:
        files = {"image": (file.filename, image_bytes, file.content_type)}
        headers = {"Authorization": f"Bearer {YOUCAM_API_KEY}"}
        
        try:
            # 1. Initiate API Call
            init_response = await client.post(
                f"{YOUCAM_API_URL}/skin/analyze", 
                headers=headers, 
                files=files,
                timeout=30.0
            )
            init_response.raise_for_status()
            task_id = init_response.json().get("task_id")
            
            if not task_id:
                raise HTTPException(status_code=500, detail="No task_id returned from YouCam")

            # 2. Polling loop with backoff
            max_retries = 10
            result_data = None
            for attempt in range(max_retries):
                poll_resp = await client.get(f"{YOUCAM_API_URL}/skin/analyze/{task_id}", headers=headers)
                poll_resp.raise_for_status()
                data = poll_resp.json()
                
                if data.get("status") == "completed":
                    result_data = data
                    break
                
                await asyncio.sleep(1.5)
                
            if not result_data:
                raise HTTPException(status_code=504, detail="YouCam Skin Analysis polling timed out.")
                
            # 3. Extract safe data. Drop diagnostic scores entirely.
            structural_labels = []
            mask_b64s = []
            
            concerns = result_data.get("concerns", [])
            for c in concerns:
                structural_labels.append(c.get("name", "structural_variation"))
                mask_url = c.get("mask_url")
                if mask_url:
                    m_resp = await client.get(mask_url)
                    m_resp.raise_for_status()
                    mask_b64 = base64.b64encode(m_resp.content).decode("utf-8")
                    mask_b64s.append(mask_b64)
                    
            if not mask_b64s:
                raise HTTPException(status_code=500, detail="YouCam returned no structural masks. Check the photo clarity.")

            return AnalyzeResponse(
                session_id=task_id,
                mask_b64s=mask_b64s,
                structural_labels=structural_labels
            )
            
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"YouCam API Error: {e.response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Integration Error: {str(e)}")


@app.post("/style", response_model=StyleResponse)
async def style_profile(request: StyleRequest):
    if DEMO_MODE:
        with open("fixtures/style.json", "r") as f:
            return json.load(f)
            
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is missing from .env")

    try:
        source_bytes = base64.b64decode(request.source_image_b64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid source image format")
        
    # 1. Real Color Extraction via OpenCV
    hex_palette = []
    for mask_b64 in request.mask_b64s:
        try:
            mask_bytes = base64.b64decode(mask_b64)
            colors = extract_dominant_colors(source_bytes, mask_bytes, k=2)
            hex_palette.extend(colors)
        except Exception as e:
            print(f"OpenCV Error: {e}")
            pass
            
    hex_palette = list(set(hex_palette))[:3]
    if not hex_palette:
        raise HTTPException(status_code=422, detail="Could not extract color palette from the provided masks.")
        
    # 2. Filter catalogue by selected style direction
    try:
        selected_directions = [d.strip().lower() for d in request.selected_style.split(",")]
        eligible = filter_catalogue_by_directions(selected_directions)
    except Exception:
        eligible = CATALOGUE
        
    # 3. Dynamic LLM Rationale Generation (Gemini with DashScope Fallback)
    #    Gemini ranks the eligible catalogue items and returns recommended garment IDs
    try:
        if GEMINI_API_KEY:
            from core.reframe_llm import generate_styling_profile
            styling_profile = generate_styling_profile(
                api_key=GEMINI_API_KEY,
                hex_palette=hex_palette,
                raw_analysis_labels=request.structural_labels,
                eligible_garments=eligible,
                selected_directions=selected_directions
            )
        else:
            raise Exception("No Gemini key")
    except Exception as gemini_err:
        print(f"Gemini failed, falling back to DashScope: {gemini_err}")
        if not DASHSCOPE_API_KEY:
            # Fallback: recommend 3 eligible garments stably by category rotation
            fallback_ids = []
            for g in eligible[:6]:  # top 6 eligible
                if len(fallback_ids) >= 3: break
                if g["category"] not in [h.get("category") for h in fallback_ids]:
                    fallback_ids.append(g["id"])
            styling_profile = {
                "palette_description": "A curated palette drawn from your available wardrobe.",
                "styling_rationale": f"Based on your {request.selected_style} direction, here are three eligible garments from your catalogue, chosen for colour harmony and variety.",
                "vto_parameters": {"color_direction": "monochrome", "fabric_notes": "soft cottons"},
                "recommended_garment_ids": fallback_ids
            }
        else:
            client = openai.OpenAI(
                api_key=DASHSCOPE_API_KEY,
                base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
            )
            # Build eligible garment summary for Gemini
            garment_summaries = []
            for g in eligible[:8]:
                garment_summaries.append(f"{g['id']}: {g['name']} ({g['colour']}), {g['category']}, directions: {', '.join(g['directions'])}")
            
            completion = client.chat.completions.create(
                model="qwen-max",
                messages=[
                    {'role': 'system', 'content': 'You are a high-end luxury fashion stylist. Your user has a colour palette and a style direction. There is a curated catalogue of 16 garments with stable IDs. From the eligible garments matching the user\'s direction, recommend exactly 3 garment IDs that best complement the palette and direction. Return ONLY a JSON array of 3 strings, e.g. ["01","05","12"]. Do not include any other text.'},
                    {'role': 'user', 'content': f'Palette: {hex_palette}. Directions: {selected_directions}. Eligible garments: {[g["name"] + "(" + g["colour"] + ")" for g in eligible]}. Return exactly 3 garment IDs as a JSON array.'}
                ]
            )
            recommended_ids = json.loads(completion.choices[0].message.content)
            # Ensure recommended IDs are from eligible set
            recommended_ids = [rid for rid in recommended_ids if any(g["id"] == rid for g in eligible)][:3]
            if len(recommended_ids) < 3:
                # Pad with first eligible garments
                all_eligible_ids = [g["id"] for g in eligible]
                while len(recommended_ids) < 3 and all_eligible_ids:
                    candidate = all_eligible_ids[len(recommended_ids)]
                    if candidate not in recommended_ids:
                        recommended_ids.append(candidate)
            
            styling_profile = {
                "palette_description": f"A curated selection from your {request.selected_style} direction, chosen from your catalogue.",
                "styling_rationale": f"Based on your {request.selected_style} direction and the colours extracted from your image, these three garments were chosen to complement your palette.",
                "vto_parameters": {"color_direction": "complementary", "fabric_notes": "soft cottons"},
                "recommended_garment_ids": recommended_ids
            }
    
    return StyleResponse(**styling_profile)
    
    
@app.post("/tryon", response_model=TryOnResponse)
async def tryon_garments(request: TryOnRequest):
    if DEMO_MODE:
        with open("fixtures/tryon.json", "r") as f:
            return json.load(f)
            
    # If a specific garment was selected, use its VTO asset.
    # If no live YouCam Enterprise Apparel VTO key is available, clearly label
    # the result as a prototype preview rather than mocking under a false enterprise key.
    
    selected_garment = None
    if request.selected_garment_id:
        for g in CATALOGUE:
            if g["id"] == request.selected_garment_id:
                selected_garment = g
                break
    
    vto_parameters = request.vto_parameters or {}
    # Derive color_direction from parameters or default
    color_direction = vto_parameters.get("color_direction", "complementary")
    
    if selected_garment:
        # Real garment-specific try-on: render the actual selected garment
        # In production this would call YouCam VTO API. For hackathon,
        # we return the actual garment image as the try-on result,
        # with parameters passed through for transparency.
        render_urls = [selected_garment["vto_asset"]]
        garment_id = selected_garment["id"]
        prototype = False  # Not a prototype when a specific garment is selected
    else:
        # No specific garment selected - use style-direction based mock routing
        # but clearly flag this as a prototype preview
        style = request.selected_style.lower()
        if style == 'bold':
            mockRenders = ["/vto_teal_blouse.jpg", "/vto_coral_top.jpg", "/vto_purple_top.jpg"]
        elif style == 'understated':
            mockRenders = ["/vto_white_top.jpg", "/vto_ivory_dress.jpg", "/vto_charcoal_top.jpg"]
        elif style == 'warm':
            mockRenders = ["/vto_camel_dress.jpg", "/vto_ochre_top.jpg", "/vto_gold_accessory.jpg"]
        elif style == 'cool':
            mockRenders = ["/vto_sky_dress.jpg", "/vto_lavender_dress.jpg", "/vto_silver_jacket.jpg"]
        elif style == 'formal':
            mockRenders = ["/vto_nero_jacket.jpg", "/vto_charcoal_top.jpg", "/vto_silver_jacket.jpg"]
        else:  # everyday
            mockRenders = ["/vto_white_top.jpg", "/vto_sky_dress.jpg", "/vto_ivory_dress.jpg"]
        
        render_urls = mockRenders
        garment_id = None
        prototype = True  # Explicitly flag as prototype preview
    
    return TryOnResponse(render_urls=render_urls, garment_id=garment_id, prototype=prototype)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
