import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_gemini():
    load_dotenv(override=True)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in .env")
        return

    try:
        genai.configure(api_key=api_key)
        # Using gemini-2.0-flash as it is available in this environment
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content("Hello! Are you working?")
        print(f"Success! Response: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_gemini()
