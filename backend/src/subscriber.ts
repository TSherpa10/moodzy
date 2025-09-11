// backend/src/subscriber.ts
import { Subscriber } from "zeromq";
import { WebSocket, WebSocketServer } from "ws";
import { moodToString } from './sim_user';
import { users as SimUsers } from "./generated/proto/simusers"

const { SimUserObject } = SimUsers.v1;

type WsMsg = { type : string, payload : {id : string, name : string, mood: string, isReal : boolean, timeCreated : Number, timeUpdated : Number } };

const wss = new WebSocketServer({port: 9006, path: "/sim/publish"})

wss.on("listening", () => {
    console.log("the websocket is listening at /users/publish:9006");
})

wss.on("connection", () => {
    console.log("client connected to websocket server");
})

function broadcast(msg : WsMsg) {
    const data = JSON.stringify(msg);
    console.log(data);
    wss.clients.forEach(client => {
        if (client.readyState == WebSocket.OPEN) client.send(data);
    });
}

async function run(): Promise<void> {
  const socket = new Subscriber();
  /* Subscribe to port 9000 and 9001, zmq makes this easy */
  socket.connect("tcp://127.0.0.1:9000");
  socket.connect("tcp://127.0.0.1:9001");
  socket.connect("tcp://127.0.0.1:9002");
  socket.connect("tcp://127.0.0.1:9003");
  socket.connect("tcp://127.0.0.1:9004");
  socket.connect("tcp://127.0.0.1:9005");
  socket.subscribe();
  console.log("Subscriber connected to 9000 through 9005");

  for await (const msg of socket) {
    /* extract message (type: bytes) from socket */
    const parts = (Array.isArray(msg) ? msg : [msg]) as Buffer[];
    const bytes = new Uint8Array(parts[parts.length - 1]);

    const m = SimUserObject.deserializeBinary(bytes);
    const id = m.id;
    const name = (m.name ?? "").trim();
    const mood = moodToString(m.mood);
    const isReal = Boolean(m.isReal);

    // /* now add the user! */
    // const res = await fetch("http://localhost:3000/users", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ name, mood, isReal }),
    // });

    // if (!res.ok) {
    //   console.error("POST /users failed:", res.status, await res.text().catch(() => ""));
    // }

    broadcast({type: "simuser", payload: {
        id: id,
        name: name,
        mood: mood,
        isReal: isReal,
        timeCreated: Date.now(),
        timeUpdated: Date.now(),
    }})
  }
}

run().catch((e) => {
  console.error("subscriber crashed:", e);
  process.exit(1);
});
