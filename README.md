# Pricing Consequence Agent

## Requirements

- Python 3.12+
- Node.js and npm
- Groq and Hindsight API keys for proposal analysis and outcome recording

## Configure

Create `backend/.env` with the service credentials:

```dotenv
GROQ_API_KEY=your-groq-api-key
HINDSIGHT_API_KEY=your-hindsight-api-key
```

`HINDSIGHT_BASE_URL` and `HINDSIGHT_BANK_ID` are optional. The frontend uses
`http://localhost:8000` by default; set `VITE_API_URL` in `frontend/.env` only
when the API is hosted elsewhere.

## Run on Windows

From the project root, create and prepare the Python environment:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

Start the API in one terminal from the project root:

```powershell
python -m uvicorn backend.api:app --reload
```

In another terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.
The API health check is at `http://localhost:8000/health`.

## Tests

Run the offline unit suite from the project root:

```powershell
python -m pytest
```

Live Hindsight demos are separate scripts and are not run by pytest.
