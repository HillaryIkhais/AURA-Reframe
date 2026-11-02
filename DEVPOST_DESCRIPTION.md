# AURA — Wear the colour. Not the diagnosis.

## Project Summary

Aura is an inclusive fashion shopping assistant that helps people with visible skin differences discover clothing colours that feel right on them, then see those outfits before buying. The user is not coming to find out what's wrong with their skin—they're coming to find something they want to wear.

## The Problem

Most fashion technology treats visible skin differences as defects to correct. Diagnostic scores, severity labels, and "conceal" messaging make shopping feel like a medical consultation rather than a creative experience. For shoppers with visible skin differences, this is a routine barrier: beauty and fashion tech consistently defaults to treating their appearance as something in need of correction.

## The Solution

Aura turns a beauty-analysis experience into a fashion-discovery experience without making someone's skin the problem. The product footage proves it.

## Technical Architecture

### Backend (FastAPI)

- **`/analyze`** — Calls YouCam skin analysis, extracts mask data and structural labels, explicitly drops all diagnostic scores
- **`/style`** — Extracts 3 dominant hex colours via OpenCV k-means on skin masks; passes palette + style direction to Gemini, which ranks eligible catalogue items and returns 3 stable `garment_id` references
- **`/tryon`** — If `selected_garment_id` is provided, returns the garment's catalogue `vto_asset` with `prototype: false` flag. If absent, returns 3 style-direction-based mock renders with `prototype: true` flag. The prototype/disclosure distinction is visible in the UI.
- **Catalogue** — 16 garments (4 categories: tops, dresses, jackets, accessories), each with stable ID, name, colour hex, category, compatible style directions, and VTO asset reference. At least 2–3 garments fit multiple directions. All 16 are selectable; recommendations narrow the catalogue rather than hide everything else.

### Frontend (Next.js)

- **`/scan`** — Camera capture, then routes to `/style-direction`
- **`/style-direction`** — User selects one of six intentions: Bold, Understated, Warm, Cool, Formal, Everyday
- **`/catalogue`** — Browse the 16-garment catalogue, filter by direction, select a garment
- **`/try-on`** — VTO result screen with prototype disclosure banner, garment details, and "Save This Look" CTA
- **`/saved-looks`** — LocalStorage-persisted saved looks (garment ID, direction, palette, timestamp)
- **`StylingResults`** — Displays palette description, styling rationale, recommended garments from backend, and the Reframe banner: "Your colour story. A palette for exploring personal style, not evaluating skin."

### Philosophy — The Reframe Banner

Visible in the interface: "Your colour story. A palette for exploring personal style, not evaluating skin."

This is not a hidden API flag or a backend boolean — it's a UI component that sits in the styling flow, reinforcing the product's core proposition every time the user interacts with it.

## What's Verified (Tested via DEMO_MODE=True)

- ✅ Palette generation from uploaded image (OpenCV + Gemini)
- ✅ All six style directions flow through one recommendation pipeline
- ✅ Every recommended `garment_id` exists in the 16-garment catalogue and matches eligible items
- ✅ `/tryon` with `selected_garment_id` returns real garment asset, `prototype: false`
- ✅ `/tryon` without `selected_garment_id` returns prototype-preview assets, `prototype: true`
- ✅ No diagnostic scores (health scores, severity) leak into the styling interface
- ✅ Saved looks persist via localStorage
- ✅ Privacy: structural labels are retained; diagnostic outputs are discarded
- ✅ Reframe banner visibly in StylingResults and try-on pages

## What's Disclosed (Not Simulated)

- ⚠️ The `/tryon` prototype flag discloses whether the result is a garment-specific preview (from catalogue) or a style-direction mock. This is a deliberate transparency measure, not a feature to overclaim.
- ⚠️ In DEMO_MODE=False with a YouCam key containing Apparel VTO permissions, the `/tryon` endpoint would call the real VTO API. The current implementation returns catalogue assets with explicit prototype flags. Submission describes the current verified state.
- ⚠️ Analysis in demo mode uses stored fixture data, not a live YouCam scan. The film opens with this disclosed: the palette is generated from the uploaded image via the app's colour-extraction pipeline.

## Demonstration Video

- **Duration**: 90–100 seconds
- **Format**: MP4, 1920×1080, ~30fps
- **Content**: Screen capture of the actual working application flow (style-direction → analysis → palette → catalogue → try-on → saved looks), with voiceover, on-screen captions, and cinematic transitions
- **Honesty protocol**: No claim that catalogue garment images are live YouCam Apparel VTO renders. The prototype/prototype-disclosure distinction is clearly shown on screen.

## Submission Deadline

November 2, 2026, 5:45 p.m. Eastern.

The entry will be submitted to the main competition prize pool. The project can win one prize only.

## Quick Technical Verification (for reviewers)

```python
import os
os.environ["DEMO_MODE"] = "True"
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# 1. Style endpoint returns valid recommendations
req = {"source_image_b64": "…", "mask_b64s": ["…"], "structural_labels": ["test"], "selected_style": "bold"}
resp = client.post("/style", json=req)
assert resp.status_code == 200
assert "recommended_garment_ids" in resp.json()
assert all(gid in ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16"] 
         for gid in resp.json()["recommended_garment_ids"])

# 2. Try-on with garment_id returns prototype: false
req = {"source_image_b64": "…", "selected_style": "bold", "selected_garment_id": "01", 
       "vto_parameters": {"color_direction":"complementary", "recommended_colors":["#FFD700"], "fabric_notes":"cotton"}}
resp = client.post("/tryon", json=req)
data = resp.json()
assert data["prototype"] == False
assert data["garment_id"] == "01"

# 3. Try-on without garment_id returns prototype: true
req = {"source_image_b64": "…", "selected_style": "bold", "vto_parameters": {"color_direction":"complementary", "recommended_colors":["#FFD700"], "fabric_notes":"cotton"}}
resp = client.post("/tryon", json=req)
data = resp.json()
assert data["prototype"] == True
```