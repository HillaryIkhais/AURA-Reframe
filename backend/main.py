import os
import base64
import asyncio
import httpx
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

from core.color_extraction import extract_dominant_colors
from core.reframe_llm import generate_styling_profile

load_dotenv()

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

# --- Pydantic Models ---
class AnalyzeResponse(BaseModel):
    session_id: str
    mask_b64s: List[str]
    structural_labels: List[str]

class StyleRequest(BaseModel):
    source_image_b64: str
    mask_b64s: List[str]
    structural_labels: List[str]

class StyleResponse(BaseModel):
    palette_description: str
    styling_rationale: str
    vto_parameters: dict

class TryOnRequest(BaseModel):
    vto_parameters: dict
    source_image_b64: str

class TryOnResponse(BaseModel):
    render_urls: List[str]

# --- Endpoints ---

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_skin(file: UploadFile = File(...)):
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
        
    # 2. Real Gemini Reframe Layer
    styling_profile = generate_styling_profile(
        api_key=GEMINI_API_KEY,
        hex_palette=hex_palette,
        raw_analysis_labels=request.structural_labels
    )
    
    return StyleResponse(**styling_profile)


@app.post("/tryon", response_model=TryOnResponse)
async def tryon_garments(request: TryOnRequest):
    if not YOUCAM_API_KEY:
        raise HTTPException(status_code=500, detail="YOUCAM_API_KEY is missing from .env")
        
    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {YOUCAM_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # We assume Apparel VTO takes the base64 source image and styling instructions
        payload = {
            "image_b64": request.source_image_b64,
            "style_instructions": request.vto_parameters.get("fabric_notes", ""),
            "color_palette": request.vto_parameters.get("recommended_colors", [])
        }
        
        try:
            resp = await client.post(
                f"{YOUCAM_API_URL}/apparel/vto",
                headers=headers,
                json=payload,
                timeout=45.0
            )
            resp.raise_for_status()
            data = resp.json()
            
            render_urls = data.get("rendered_images", [])
            if not render_urls:
                raise HTTPException(status_code=500, detail="YouCam VTO failed to return rendered images.")
                
            return TryOnResponse(render_urls=render_urls)
            
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"YouCam VTO Error: {e.response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"VTO Integration Error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
