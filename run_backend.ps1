# Run from project root: .\run_backend.ps1
$env:PYTHONPATH = "$PSScriptRoot\backend"
& "$PSScriptRoot\.venv\Scripts\python.exe" -m uvicorn backend.api:app --reload --host 0.0.0.0 --port 8000
