import os
from groq import Groq
from dotenv import load_dotenv

def test_groq():
    load_dotenv(override=True)
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        print("Error: GROQ_API_KEY not found in .env")
        return

    try:
        client = Groq(api_key=groq_key)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": "Hello! Are you working?"}
            ],
        )
        print(f"Success! Response: {completion.choices[0].message.content}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_groq()
