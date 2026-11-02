# AURA Production Brief — 100-Second Cinematic Pitch

## Objective
Produce a 90–100 second DemoTape-standard video that sells one idea: *Aura turns a beauty-analysis experience into a fashion-discovery experience without making someone's skin the problem.* The product footage proves it. The cinematic opening gives it feeling. The ending makes the proposition memorable.

## Restrictions (STRICT)
- No Canva, no manual editing workflow, no invented product capabilities
- Every garment name, colour hex, and recommendation must be exactly as returned by the running application
- No fabricated interactions (saved shows = actual localStorage collection, not side-by-side comparison)
- No description of analysis spinner as live YouCam analysis (demo mode uses fixture data — disclosed on screen)
- No claiming catalogue garment images are live YouCam VTO renders
- prototype: false/true disclosed as user-visible labels, not backend booleans
- Film must be producible from actual running application footage

## Footage Requirements

### Scenes & Shot List (100 seconds total)

| Scene | Duration | Action | On-Screen Text / Captions |
|-------|----------|--------| ------------------------- |
| 1 | 0:00–0:10 | Fashion campaign opening (AI-generated atmosphere) | "Beauty and fashion should feel like freedom, not correction." (voiceover, fade in 5s) |
| 2 | 0:10–0:25 | Aura's philosophy & visual identity | "We reject the idea that visible skin differences are defects to fix. Fashion should celebrate, not correct." (hold captions) |
| 3 | 0:25–0:45 | **Real analysis & palette generation** (screen capture) | 0:32: Palette hex codes appear: "#C49A6C, #C58640, #228B22" (typewriter effect, 3s)<br>0:40: "Your colour story. A palette for exploring personal style, not evaluating skin." (banner slide in) |
| 4 | 0:45–0:55 | Style-direction selection | Direction cards fan in: Bold, Understated, Warm, Cool, Formal, Everyday<br>0:50: User selects "Bold" |
| 5 | 0:55–1:05 | **Three garment recommendations** (screen capture) | "Warm Camel Dress #C49A6C" / "Ochre Top #C58640" / "Forest Green Jacket #228B22" (slide up, one at a time) |
| 6 | 1:05–1:15 | Garment selection & try-on | User taps "Warm Camel Dress" → checkmark<br>1:10: "Try This On" pressed<br>1:15: VTO result screen — "Prototype Preview — Garment selected from curated catalogue" (banner) |
| 7 | 1:15–1:25 | Save look & collection | "Save This Look" tapped → checkmark<br>1:20: Saved looks panel opens (list format)<br>1:25: Look 1: "Warm Camel Dress, warm direction"<br>1:30: Look 2: "Gold Accessory, experimental direction" |
| 8 | 1:25–1:35 | Brand reveal & closing | "Aura — fashion discovery without diagnostic judgement."<br>1:30: Aura logo, URL, Devpost submit prompt<br>1:35: Final voiceover |

### Voiceover Script (approx. 90 words)
> 0:00–0:10: "Beauty and fashion should feel like freedom, not correction."
> 0:10–0:25: "We reject the idea that visible skin differences are defects to fix. Fashion should celebrate, not correct."
> 0:25–0:45: "[screen capture sounds] We analyze structural tones, not flaws. Below is your bespoke high-fashion palette—generated from your skin's unique colour story."
> 0:45–0:55: "Bold. Understated. Warm. Cool. Formal. Everyday."
> 0:55–1:05: "Warm Camel Dress. Ochre Top. Forest Green Jacket. Three colours that complement your palette."
> 1:05–1:15: "Try this on. Save the look. No diagnosis. Just fashion."
> 1:15–1:25: "Your saved looks. Different directions. Same beautiful skin—untreated, unjudged."
> 1:25–1:35: "Aura. Fashion discovery without diagnostic judgement. Submit now on Devpost."

### Music & Transitions
- **Music bed**: Royalty-free cinematic underscore (slow tempo, atmospheric, no lyrics). Mood: empowering, not medical.
- **Transitions**: Crossfades between app sections. AI-generated fashion footage for atmosphere wipes and stings.
- **Caption/overlay timing** (exact, derived from actual app UI):
  - 0:32: Palette hex codes appear: "#C49A6C, #C58640, #228B22" (typewriter effect, 3s)
  - 0:40: "Your colour story. A palette for exploring personal style, not evaluating skin." (banner slide in)
  - 0:50: Three garment recommendations appear (slide up, one at a time)
  - 1:00: "Prototype Preview — Garment selected from curated catalogue" (banner, hold 5s)
  - 1:15: "Saved looks" panel opens (slide down)
  - 1:25: Look 1: "Warm Camel Dress, warm direction" (list item appear)
  - 1:30: Look 2: "Gold Accessory, experimental direction" (list item appear)

### Honesty Guarantees (what the film will NEVER do)
- Claim catalogue garment images are live YouCam Apparel VTO renders
- Describe the analysis spinner as live YouCam analysis in demo mode
- Fabricate a side-by-side saved-looks comparison UI
- Show `prototype: false/true` as a backend boolean (always as user-visible labels)
- Invent garment names, colours, or recommendations

### What the film WILL show
- Actual Aura app screen capture at each interaction point
- Real garment names and colours from the 16-garment catalogue
- Disclose the prototype/demo nature of try-on results honestly
- Prove the core proposition: Aura turns beauty-analysis into fashion-discovery without making skin the problem
- End with a memorable proposition and clear call-to-action (Devpost submission)

## Delivery Format
- 100-second MP4 (.mp4, 1920×1080, ~30fps)
- Production brief document (this file)
- Source footage (untrimmed screen recording)
- Overlay/caption script (exact on-screen text timing)

## OpenCode Execution Notes
This brief is designed for DemoTape or equivalent screen-capture + post-production pipeline. All overlay text is derived from actual app UI state. No feature is claimed that the code does not deliver. The film is grounded in the verified codebase.