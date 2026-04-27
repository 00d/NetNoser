import asyncio
import websockets

async def test_stream():
    uri = "ws://localhost:8000/ws/telemetry"
    async with websockets.connect(uri) as websocket:
        print("Connected! Waiting for data...")
        
        for _ in range(3):
            response = await websocket.recv()
            print(f"Received {len(response)} bytes of telemetry data.")
            print(f"Sample: {response[:100]}...\n")

asyncio.run(test_stream())
