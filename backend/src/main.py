from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import episodes, characters, mythos, graph, search

app = FastAPI(
    title="Blod Wiki API",
    description="API for Blod svett tårar Dark Adaptation Wiki",
    version="0.1.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(episodes.router)
app.include_router(characters.router)
app.include_router(mythos.router)
app.include_router(graph.router)
app.include_router(search.router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/")
async def root():
    return {"message": "Blod Wiki API", "version": "0.1.0"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
