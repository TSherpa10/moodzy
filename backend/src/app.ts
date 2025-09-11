// src/app.ts (adjust path if your file lives elsewhere)

import express, { Request, Response } from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { json, z } from "zod";
import { users as Users } from "./generated/proto/users";

const { UserObject } = Users.v1;

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Validation
const createUserSchema = z.object({
  name: z.string().min(1),
  mood: z.string().min(1),
  isReal: z.boolean().optional().default(true),
});

// In-memory “DB”
const userStore = new Map<string, Uint8Array>();
const idIndex = new Set<string>();

function makeId(): string {
  return randomUUID();
}
function makeUniqueId(): string {
  let id = makeId();
  while (idIndex.has(id)) id = makeId();
  idIndex.add(id);
  return id;
}

function binaryToJSON(u: Users.v1.UserObject) {
  return {
    id: u.id,
    name: u.name,
    mood: u.mood,
    isReal: u.isReal,
    timeCreated: u.timeCreated,
    timeUpdated: u.timeUpdated,
  };
}

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

/** List all users */
app.get("/users", (_req: Request, res: Response) => {
  try {
    const usersJSON = Array.from(userStore.values())
      .map((u) => UserObject.deserializeBinary(u))
      .map(binaryToJSON)
      .reverse(); 
    res.json(usersJSON);
    console.log(`GET REQUEST: users:`)
    usersJSON.forEach(u => console.log(u.id, u.name, u.mood, u.isReal, u.timeCreated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to list users` });
  }
});

/** Delete all users */
app.delete("/users", (_req: Request, res: Response) => {
  try {
    userStore.clear();
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to delete all users` });
  }
});

/** Create a user */
app.post("/users", (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid body", issues: parsed.error.issues });
  }
  const { name, mood, isReal } = parsed.data;

  const user = new UserObject();
  const uid: string = makeUniqueId();
  user.id = uid;
  user.name = name.trim();
  user.mood = mood.trim();
  user.isReal = isReal;
  user.timeCreated = Date.now();
  user.timeUpdated = Date.now();

  const serializedUser = user.serializeBinary();
  userStore.set(uid, serializedUser);

  const jsonUser = binaryToJSON(user);
  console.log(`POST REQUEST: user: id=${jsonUser.id} name=${jsonUser.name} mood=${jsonUser.mood} isReal=${jsonUser.isReal} created=${jsonUser.timeCreated}`);

  return res.status(201).json(jsonUser);
});

/** Update a user by id */
app.patch("/users/:id", (req: Request, res: Response) => {
  const uid = req.params.id;
  if (!userStore.has(uid)) {
    return res
      .status(404)
      .json({ message: `queried user id is not in the list of users!` });
  }

  const buf = userStore.get(uid)!;
  const message = UserObject.deserializeBinary(
    buf instanceof Uint8Array ? buf : new Uint8Array(buf as any)
  );

  const { name, mood } = req.body as Partial<{
    name: string;
    mood: string;
  }>;

  if (typeof name === "string" && name.trim().length) message.name = name.trim();
  if (typeof mood === "string" && mood.trim().length) message.mood = mood.trim();
  message.timeUpdated = Date.now();

  const serializedUser = message.serializeBinary();
  userStore.set(uid, serializedUser);
  const jsonUser = binaryToJSON(message)

  console.log(`PATCH REQUEST: updated user: id=${jsonUser.id} name=${jsonUser.name} mood=${jsonUser.mood} isReal=${jsonUser.isReal} created=${jsonUser.timeCreated} updated=${jsonUser.timeUpdated}`);

  return res.status(200).json(jsonUser);
});

/** Delete a user by id */
app.delete("/users/:id", (req: Request, res: Response) => {
  const uid = req.params.id;
  if (!userStore.has(uid)) {
    return res
      .status(404)
      .json({ message: `queried user id is not in the list of users!` });
  }
  userStore.delete(uid);
  return res.sendStatus(204);
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
