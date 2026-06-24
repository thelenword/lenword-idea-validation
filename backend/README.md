# LENWORD Validate Backend API

FastAPI backend providing stateless startup-idea validation reports with xAI Grok (primary) and Google Gemini (fallback) API orchestration. It also generates and exports report summaries to professional PDFs using ReportLab.

## Setup Instructions

1. **Prerequisites**
   - Python 3.11+ installed

2. **Setup Environment**
   - Navigate to the `backend/` directory:
     ```bash
     cd backend
     ```
   - Create a virtual environment (already completed for workspace):
     ```bash
     python -m venv venv
     ```
   - Activate the virtual environment:
     - On Windows Powershell:
       ```powershell
       .\venv\Scripts\Activate.ps1
       ```
     - On Linux/macOS:
       ```bash
       source venv/bin/activate
       ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit the newly created `.env` file and insert your API keys:
     - `XAI_API_KEY`: xAI API Key from [console.x.ai](https://console.x.ai/)
     - `GEMINI_API_KEY`: Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

4. **Run Server**
   - Start the FastAPI development server:
     ```bash
     uvicorn app.main:app --reload --port 8000
     ```

## API Endpoints

- `GET /api/health` — Trivial liveness check (`{"status": "ok"}`).
- `POST /api/validate-idea` — Validates startup name + 8 answers. Returns the structured validation report.
- `POST /api/export-pdf` — Generates a downloadable PDF report matching the frontend's layout.
