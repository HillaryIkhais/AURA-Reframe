# AURA — Wear the colour. Not the diagnosis.

![AURA Banner](https://img.shields.io/badge/AURA-Reframe-white)

## Product Vision

**AURA** is an inclusive fashion shopping assistant that helps people with visible skin differences discover clothing colours that feel right on them, then see those outfits before buying. The user is not coming to find out what's wrong with their skin—they're coming to find something they want to wear.

Most fashion technology treats visible skin differences as defects to correct. Diagnostic scores, severity labels, and "conceal" messaging make shopping feel like a medical consultation rather than a creative experience. Aura changes this by putting colour and style choices first, and diagnostic information nowhere.

## Core Workflow

| Step | Action | Verified |
|------|--------|----------|
| 1 | Upload face image → YouCam skin analysis | ✅ OpenCV extracts 3 dominant hex colours from skin masks |
| 2 | Select styling direction | ✅ 6 directions (Bold, Understated, Warm, Cool, Formal, Everyday) through one recommendation pipeline |
| 3 | View colour palette | ✅ Generated from uploaded image, no diagnostic scores |
| 4 | Browse 16 curated garments | ✅ Filtered by direction, all selectable |
| 5 | Select garment → try-on | ✅ Garment-specific preview with prototype disclosure |
| 6 | Save look | ✅ LocalStorage persistence, 3 looks verifiable |

## Technical Architecture

### Backend (FastAPI)

- **`/analyze`** — Calls YouCam skin analysis, extracts mask data and structural labels, explicitly drops all diagnostic scores
- **`/style`** — Extracts 3 dominant hex colours via OpenCV k-means on skin masks; passes palette + style direction to Gemini, which ranks eligible catalogue items and returns 3 stable `garment_id` references
- **`/tryon`** — If `selected_garment_id` is provided, returns the garment's catalogue `vto_asset` with `prototype: false` flag. If absent, returns 3 style-direction-based mock renders with `prototype: true` flag. The prototype/disclosure distinction is visible in the UI.
- **Catalogue** — 16 garments (4 categories: tops, dresses, jackets, accessories), each with stable ID, name, colour hex, category, compatible style directions, and VTO asset reference. At least 2–3 garments fit multiple directions. All 16 are selectable; recommendations narrow the catalogue rather than hide everything else.

### Frontend (Next.js 14)

- **`/style-direction`** — User selects one of six styling intentions
- **`/catalogue`** — Browse the 16-garment catalogue, filter by direction, select a garment
- **`/try-on`** — VTO result screen with prototype disclosure banner, garment details, and "Save This Look" CTA
- **`/saved-looks`** — LocalStorage-persisted saved looks (garment ID, direction, palette, timestamp)
- **`StylingResults`** — Displays palette description, styling rationale, recommended garments from backend, and the Reframe banner: "Your colour story. A palette for exploring personal style, not evaluating skin."

### Philosophy — The Reframe Banner

Visible in the interface: "Your colour story. A palette for exploring personal style, not evaluating skin."

This is not a hidden API flag or a backend boolean — it's a UI component that sits in the styling flow, reinforcing the product's core proposition every time the user interacts with it.

## Verified Functionality (DEMO_MODE=True)

- ✅ Palette generation from uploaded image (OpenCV + Gemini)
- ✅ All 6 style directions flow through one recommendation pipeline
- ✅ Every recommended `garment_id` exists in the 16-garment catalogue and matches eligible items
- ✅ `/tryon` with `selected_garment_id` returns real garment asset, `prototype: false`
- ✅ `/tryon` without `selected_garment_id` returns prototype-preview assets, `prototype: true`
- ✅ No diagnostic scores (health scores, severity) leak into the styling interface
- ✅ Saved looks persist via localStorage
- ✅ Privacy: structural labels are retained; diagnostic outputs are discarded
- ✅ Reframe banner visibly in StylingResults and try-on pages

## Demo Data

```python
import os
os.environ["DEMO_MODE"] = "True"
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# 1. Style endpoint returns valid recommendations for all 6 directions
directions = ['bold', 'understated', 'warm', 'cool', 'formal', 'everyday']
for d in directions:
    req = {"source_image_b64": "…", "mask_b64s": ["…"], "structural_labels": ["test"], "selected_style": d}
    resp = client.post("/style", json=req)
    assert resp.status_code == 200
    assert "recommended_garment_ids" in resp.json()
    assert all(gid in ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16"] 
           for gid in resp.json()["recommended_garment_ids"])

# 2. Try-on with garment_id returns prototype: false + real asset
req = {"source_image_b64": "…", "selected_style": "bold", "selected_garment_id": "01",
       "vto_parameters": {"color_direction":"complementary", "recommended_colors":["#FFD700"], "fabric_notes":"cotton"}}
resp = client.post("/tryon", json=req)
data = resp.json()
assert data["prototype"] == False
assert data["garment_id"] == "01"
assert data["render_urls"][0] == "/vto_white_top.jpg"

# 3. Try-on without garment_id returns prototype: true + mock preview
req = {"source_image_b64": "…", "selected_style": "bold",
       "vto_parameters": {"color_direction":"complementary", "recommended_colors":["#FFD700"], "fabric_notes":"cotton"}}
resp = client.post("/tryon", json=req)
data = resp.json()
assert data["prototype"] == True
assert data["garment_id"] is None
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- YouCam API key (Skin Analysis)
- Google API key (Gemini 1.5 Flash)
- Demo mode: `DEMO_MODE=True` uses fixture data for fastest setup

### Quick Start

```bash
# 1. Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# .env already contains keys for demo mode
uvicorn main:app --reload --port 8085

# 2. Frontend
cd frontend
npm install
npm run dev
# App runs at http://localhost:3000
```

### Directory Structure

```
AURA/
├── backend/          # FastAPI orchestration
│   ├── main.py       # Core endpoints & catalogue
│   ├── core/         # colour extraction & LLM framing
│   ├── fixtures/     # Demo mode data
│   └── verify_demo.py # 5 test suites
├── frontend/         # Next.js client
│   ├── app/          # /style-direction, /catalogue, /try-on
│   ├── components/   # StylingResults, Reframe banner
│   └── package.json
├── DEVPOST_DESCRIPTION.md  # Submission description
├── PRODUCTION_BRIEF.md     # 100s pitch blueprint
└── README.md              # This file
```

## Honesty Guidelines (Mandatory for Submission)

The following disclosures appear in the demo video and Devpost description:

- **Demo mode**: DEMO_MODE=True uses stored fixture data, not a live YouCam scan. The palette is generated from the uploaded image via the app's colour-extraction pipeline.
- **Prototype disclosure**: `/tryon` returns `prototype: false` when a `selected_garment_id` is provided (garment-specific catalogue preview). It returns `prototype: true` when no garment is selected (style-direction-based mock preview). This flag is a user-visible label, not a backend boolean.
- **No live VTO**: The current implementation returns catalogue assets, not live YouCam Apparel VTO renders. This is transparently disclosed.
- **No fabricated comparisons**: Saved shows appear as a localStorage collection (list format), not a fabricated side-by-side comparison UI.
- **No medical claims**: Diagnostic scores are never displayed or transmitted. The product reframes beauty analysis as fashion discovery.

## License

MIT License. See `LICENSE` for more information.

## Quick API Verification

```python
import os
os.environ["DEMO_MODE"] = "True"
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# 1. /style with any direction returns 3 valid garment IDs
req = {"source_image_b64": "R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",
       "mask_b64s": ["R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="],
       "structural_labels": ["test"], "selected_style": "bold"}
resp = client.post("/style", json=req)
assert resp.status_code == 200
assert "recommended_garment_ids" in resp.json()
assert all(gid in ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16"] 
       for gid in resp.json()["recommended_garment_ids"])

# 2. /tryon with garment_id returns prototype: false
req = {"source_image_b64": "R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",
       "selected_style": "bold", "selected_garment_id": "01",
       "vto_parameters": {"color_direction":"complementary", "recommended_colors":["#FFD700"], "fabric_notes":"cotton"}}
resp = client.post("/tryon", json=req)
data = resp.json()
assert data["prototype"] == False
assert data["garment_id"] == "01"

# 3. /tryon without garment_id returns prototype: true
req = {"source_image_b64": "R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",
       "selected_style": "bold",
       "vto_parameters": {"color_direction":"complementary", "recommended_colors":["#FFD700"], "fabric_notes":"cotton"}}
resp = client.post("/tryon", json=req)
data = resp.json()
assert data["prototype"] == True
```