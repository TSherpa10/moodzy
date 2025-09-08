// backend/src/subscriber.ts
import { Subscriber } from "zeromq";
import { users as Users } from "./generated/proto/users"; // TS module from protoc-gen-ts
const { UserObject } = Users.v1;

async function run(): Promise<void> {
  const socket = new Subscriber();
  socket.connect("tcp://127.0.0.1:9000");
  socket.connect("tcp://127.0.0.1:9001");
  socket.subscribe();
  console.log("Subscriber connected to 9000 & 9001");

  for await (const msg of socket) {
    const parts = (Array.isArray(msg) ? msg : [msg]) as Buffer[];
    const bytes = new Uint8Array(parts[parts.length - 1]);

    const m = UserObject.deserializeBinary(bytes);
    const name = (m.name ?? "").trim();
    const mood = (m.mood ?? "").trim();
    const isReal = Boolean(m.isReal);

    const res = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mood, isReal }),
    });

    if (!res.ok) {
      console.error("POST /users failed:", res.status, await res.text().catch(() => ""));
    }
  }
}

run().catch((e) => {
  console.error("subscriber crashed:", e);
  process.exit(1);
});
