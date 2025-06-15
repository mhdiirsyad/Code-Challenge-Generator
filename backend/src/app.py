from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from .route import challenge, webhooks
app = FastAPI()
origin = [
    "https://code-challenge-generator.vercel.app",
    "http://localhost:5173"
]
app.add_middleware(CORSMiddleware, 
                   allow_origins=origin, 
                   allow_credentials=True, 
                   allow_methods=["*"], 
                   allow_headers=["*"]
                )

app.include_router(challenge.router, prefix="/api")
app.include_router(webhooks.router, prefix="/webhooks")

