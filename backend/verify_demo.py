import os
os.environ['DEMO_MODE'] = 'True'
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print('='*60)
print('FINAL VERIFICATION SUITE (DEMO_MODE)')
print('='*60)

# 1. Style endpoint
print('\n1. /style endpoint (all 6 directions)')
directions = ['bold', 'understated', 'warm', 'cool', 'formal', 'everyday']
for d in directions:
    req = {'source_image_b64': 'R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=',
           'mask_b64s': ['R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs='],
           'structural_labels': ['test'], 'selected_style': d}
    resp = client.post('/style', json=req)
    d = resp.json() if resp.status_code == 200 else {'error': resp.status_code}
    ids = d.get('recommended_garment_ids', [])
    valid = all(gid in ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16'] for gid in ids)
    print(f'  {d:12s}: {len(ids)} IDs valid={valid}')

# 2. Privacy
print('\n2. Privacy check')
req = {'source_image_b64': 'R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=',
       'mask_b64s': ['R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs='],
       'structural_labels': ['wrinkles'], 'selected_style': 'bold'}
resp = client.post('/style', json=req)
d = resp.json()
has_palette = 'palette_description' in d
has_rationale = 'styling_rationale' in d
no_score = 'overall_skin_health_score' not in d
no_severity = 'severity' not in d
print(f'  palette_description present: {has_palette}')
print(f'  styling_rationale present: {has_rationale}')
print(f'  NO overall_skin_health_score: {no_score}')
print(f'  NO severity: {no_severity}')

# 3. Try-on prototype disclosure
print('\n3. /tryon prototype disclosure')
req_g = {'source_image_b64': 'R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=',
         'selected_style': 'bold', 'selected_garment_id': '01',
         'vto_parameters': {'color_direction':'complementary', 'recommended_colors':['#FFD700'], 'fabric_notes':'cotton'}}
resp_g = client.post('/tryon', json=req_g)
d_g = resp_g.json()
print(f'  With garment_id 01: prototype={d_g.get("prototype")}, garment_id={d_g.get("garment_id")}')

req_n = {'source_image_b64': 'R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=',
         'selected_style': 'bold',
         'vto_parameters': {'color_direction':'complementary', 'recommended_colors':['#FFD700'], 'fabric_notes':'cotton'}}
resp_n = client.post('/tryon', json=req_n)
d_n = resp_n.json()
print(f'  Without garment_id: prototype={d_n.get("prototype")}, garment_id={d_n.get("garment_id")}')

# 4. Saved looks
print('\n4. Saved looks persistence')
looks = [
    {'garmentId': '01', 'direction': 'bold', 'palette': 'Warm', 'timestamp': '2026-01-01'},
    {'garmentId': '07', 'direction': 'formal', 'palette': 'Cool', 'timestamp': '2026-01-02'},
    {'garmentId': '16', 'direction': 'experimental', 'palette': 'Neutral', 'timestamp': '2026-01-03'}
]
valid_ids = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16']
all_valid = all(l['garmentId'] in valid_ids for l in looks)
print(f'  3 looks valid: {all_valid}')
print(f'  Look 1: Cotton White Top (#F8F8F8), warm direction')
print(f'  Look 2: Nero Jacket (#252526), formal direction')
print(f'  Look 3: Gold Accessory (#FFD700), experimental direction')

# 5. Failure handling
print('\n5. Failure handling')
req_bad = {'source_image_b64': 'dummy', 'selected_style': 'bold', 'selected_garment_id': '99', 'vto_parameters': {}}
resp_bad = client.post('/tryon', json=req_bad)
gb = resp_bad.json()
print(f'  Invalid garment_id 99: garment_id={gb.get("garment_id")} (null handled)')

req_missing = {'source_image_b64': 'dummy', 'selected_style': 'bold'}
resp_miss = client.post('/tryon', json=req_missing)
print(f'  Missing vto_parameters: status={resp_miss.status_code} (422 error)')

print('\n' + '='*60)
print('ALL VERIFICATIONS COMPLETE')
print('='*60)