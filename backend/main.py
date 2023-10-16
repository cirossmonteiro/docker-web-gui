from typing import Any
from urllib.parse import parse_qs

from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import docker

origins = [
    "http://localhost",
    "http://localhost:3000",
]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Container(BaseModel):
    image: str
    env: Any

@app.get("/containers")
async def list_containers():
    client = docker.APIClient(base_url='unix://var/run/docker.sock')
    return [client.inspect_container(container["Id"]) for container in client.containers()]

@app.get("/containers/{id}")
async def get_container(id: str):
    client = docker.APIClient(base_url='unix://var/run/docker.sock')
    return client.inspect_container(id)

@app.post("/containers/")
async def run_container(data: Container):
    client = docker.from_env()
    print(42, data)
    container = client.containers.run(data.image, detach=True, environment=data.env)
    return container.id

@app.post("/containers/{id}")
async def remove_container(id: str):
    client = docker.from_env()
    for container in client.containers.list():
        if container.id == id:
            container.kill()
            return True
    return False