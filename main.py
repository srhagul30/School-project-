import uvicorn
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    print(f"Starting NoticeBridge Python server at http://127.0.0.1:{port}")
    uvicorn.run("api.index:app", host="127.0.0.1", port=port, reload=True)
