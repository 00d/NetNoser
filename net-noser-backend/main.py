import asyncio
import json
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

NUM_NODES = 50

def generate_initial_nodes():
    nodes = {}
    for i in range(NUM_NODES):
        nodes[f"node-{i}"] = {
            "id": f"node-{i}",
            "cpu": random.uniform(10.0, 40.0),
            "memory": random.uniform(20.0, 60.0),
            "latency": random.uniform(5.0, 20.0),
            "status": "healthy"
        }
    return nodes

cluster_state = generate_initial_nodes()

def update_metrics():
    for node_id, data in cluster_state.items():
        data["cpu"] = max(0.0, min(100.0, data["cpu"] + random.uniform(-5.0, 5.0)))
        data["memory"] = max(0.0, min(100.0, data["memory"] + random.uniform(-2.0, 2.0)))
        data["latency"] = max(0.0, data["latency"] + random.uniform(-2.0, 2.0))

        if random.random() < 0.02: 
            data["cpu"] = random.uniform(85.0, 100.0)
            data["status"] = "warning"
        elif data["cpu"] < 80.0:
            data["status"] = "healthy"

@app.websocket("/ws/telemetry")
async def telemetry_stream(websocket: WebSocket):
    await websocket.accept()
    print("Frontend client connected to telemetry stream.")
    
    try:
        while True:
            update_metrics()
            
            await websocket.send_text(json.dumps(list(cluster_state.values())))
            
            await asyncio.sleep(0.5)
            
    except WebSocketDisconnect:
        print("Frontend client disconnected.")
