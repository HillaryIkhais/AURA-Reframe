import os
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-pro")

file1 = genai.upload_file("/Users/ikhaisoshuare/.gemini/antigravity/brain/f8d4e089-1e69-482b-96c5-f5cea6f2c778/.user_uploaded/media_1786798690487.jpg")
file2 = genai.upload_file("/Users/ikhaisoshuare/.gemini/antigravity/brain/f8d4e089-1e69-482b-96c5-f5cea6f2c778/.user_uploaded/media_1786798696579.jpg")

prompt = "These are UI inspiration images provided by the user for a project called Aura Reframe. Describe the EXACT visual design, color palette, typography, layout, and overall vibe. Be extremely detailed about the CSS, layout structure, fonts (serif vs sans), and background colors. I need to replicate this UI exactly."

response = model.generate_content([prompt, file1, file2])
print(response.text)
