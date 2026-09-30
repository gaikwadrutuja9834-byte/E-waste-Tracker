import os
import sys
from pathlib import Path
import uvicorn

# Ensure the backend directory is in sys.path so "app" is always importable
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Load .env file if available
try:
    from dotenv import load_dotenv
    env_file = BASE_DIR / ".env"
    if env_file.exists():
        load_dotenv(dotenv_path=env_file)
except ImportError:
    pass

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print("=" * 60)
    print(f" EcoTrace AI Backend Server")
    print(f" Local URL:   http://localhost:{port}")
    print(f" API Docs:    http://localhost:{port}/docs")
    print("=" * 60)
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,
        reload_dirs=[str(BASE_DIR / "app")]
    )


