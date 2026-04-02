import os
import shutil
import tempfile
import json
import time
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from git import Repo
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Configure Groq
groq_key = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=groq_key) if groq_key else None

app = FastAPI(title="Vajra API", description="Autonomous DevSecOps AI Backend")

# Allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    repo_url: str

class FixRequest(BaseModel):
    session_id: str
    file_path: str
    issue_text: str
    code_context: str
    line_number: int

@app.post("/api/scan")
async def scan_repository(request: ScanRequest):
    temp_dir = tempfile.mkdtemp(prefix="vajra_scan_")
    session_id = os.path.basename(temp_dir)
    try:
        # 1. Normalize URL if user typed 'appsecco/dvna'
        url = request.repo_url.strip()
        if not url.startswith("http") and not url.startswith("git@"):
            url = f"https://github.com/{url}"

        # 2. Clone Repo
        print(f"Cloning {url} into {temp_dir}...")
        Repo.clone_from(url, temp_dir, depth=1)
        
        # 3. Run Semgrep directly via subprocess
        print(f"Running semgrep on {temp_dir}...")
        # Use p/javascript or p/default to catch nodejs vulns (like dvna)
        cmd = ["semgrep", "scan", "--config", "p/javascript", "--json", temp_dir]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        try:
            output = json.loads(result.stdout)
        except json.JSONDecodeError:
            print("Failed to parse Semgrep output. STDOUT:", result.stdout, "STDERR:", result.stderr)
            raise HTTPException(status_code=500, detail="Scanner failed to execute correctly.")

        results = output.get("results", [])
        
        formatted_results = []
        for r in results:
            relative_path = r["path"].replace(temp_dir + os.sep, "").replace(temp_dir + "/", "")
            message = r["extra"]["message"]
            code = r["extra"].get("lines", "")
            if not code:
                code = "(No code snippet available)"
            
            # Extract line if available
            line_num = 1
            if "start" in r and "line" in r["start"]:
                line_num = r["start"]["line"]

            formatted_results.append({
                "id": str(hash(relative_path + str(line_num) + message)),
                "file": relative_path,
                "line": line_num,
                "severity": r["extra"].get("severity", "HIGH"),
                "confidence": "HIGH",
                "issue_text": message[:200] + "..." if len(message) > 200 else message,
                "code": code
            })
            
        # Limit to first 15 so UI doesn't lag out on huge vulnerable repos
        return {"status": "success", "session_id": session_id, "results": formatted_results[:15]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    # NOTE: Intentionally removed the finally block that deletes the directory 
    # so we can apply fixes to the copied files in this session later.

@app.post("/api/fix")
async def generate_fix(request: FixRequest):
    if not api_key and not groq_client:
        raise HTTPException(status_code=500, detail="No AI provider (Gemini/Groq) configured in .env")

    system_prompt = """
    You are Vajra, an autonomous AI security engineer. Your job is to fix security vulnerabilities in code.
    You must always respond in strict JSON format matching exactly this structure:
    {"fixed_code": "the exact drop-in replacement code here", "explanation": "a brief 2 sentence explanation of what the problem was and how you fixed it"}
    Do not wrap the JSON in Markdown blocks, output raw JSON only.
    """
    
    prompt = f"""
    File: {request.file_path}
    Line: {request.line_number}
    Vulnerability: {request.issue_text}
    
    Vulnerable Code:
    {request.code_context}
    """
    
    try:
        # Use Groq if client is available (Extremely fast & reliable for hackathons)
        if groq_client:
            print("Using Groq (Llama-3-70b) for remediation...")
            completion = groq_client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=2048,
                response_format={"type": "json_object"}
            )
            raw_output = completion.choices[0].message.content.strip()
        elif api_key:
            print("Using Gemini (1.5-flash) for remediation...")
            model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_prompt)
            max_retries = 3
            retry_delay = 5 
            for attempt in range(max_retries):
                try:
                    response = model.generate_content(prompt)
                    break 
                except Exception as e:
                    if "429" in str(e) and attempt < max_retries - 1:
                        time.sleep(retry_delay)
                        continue
                    raise e
            raw_output = response.text.strip()
        else:
            raise HTTPException(status_code=500, detail="No AI provider (Gemini/Groq) configured in .env")

        raw_output = response.text.strip()
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3].strip()
        elif raw_output.startswith("```"):
            raw_output = raw_output[3:-3].strip()
            
        response_data = json.loads(raw_output)
        fixed_code = response_data.get("fixed_code", "")
        explanation = response_data.get("explanation", "")
        
        # Physically rewrite the repository file with the fix
        target_dir = os.path.join(tempfile.gettempdir(), request.session_id)
        target_file_path = os.path.join(target_dir, request.file_path)
        
        if os.path.exists(target_file_path):
            with open(target_file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Simple string replacement for the demo snippet
            # In a heavy production app, AST parsers or Git conflict markers are better
            if request.code_context in content:
                content = content.replace(request.code_context, fixed_code)
                with open(target_file_path, "w", encoding="utf-8") as f:
                    f.write(content)
            else:
                print(f"Warning: Exact code context not found in {target_file_path}")
        
        return {"status": "success", "fixed_code": fixed_code, "explanation": explanation}
        
    except Exception as e:
        print("Gemini API Error:", e)
        raise HTTPException(status_code=500, detail="Failed to generate AI fix. Error: " + str(e))

@app.get("/api/download/{session_id}")
async def download_patched_repo(session_id: str):
    target_dir = os.path.join(tempfile.gettempdir(), session_id)
    if not os.path.exists(target_dir):
        raise HTTPException(status_code=404, detail="Session expired or not found")
        
    zip_path = os.path.join(tempfile.gettempdir(), f"{session_id}.zip")
    shutil.make_archive(zip_path.replace('.zip', ''), 'zip', target_dir)
    
    return FileResponse(zip_path, media_type="application/zip", filename="Vajra_Secured_Repository.zip")

if __name__ == "__main__":
    import uvicorn
    # run with: uvicorn main:app --reload
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
