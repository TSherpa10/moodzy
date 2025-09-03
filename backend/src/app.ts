import express from 'express';
import cors from 'cors';
// optional: npm i zod
import { z } from 'zod';
import { UserObject } from "../../frontend/src/generated/src/proto/users_pb"
const app = express();
const port = 3000;

// Middlewares
app.use(cors());               // allow frontend on another origin (e.g., Vite 5173)
app.use(express.json());       // parse application/json

const createUserSchema = z.object({
  name: z.string().min(1),
  mood: z.string().min(1),
  isReal: z.boolean().optional().default(true),
});

// In-memory “DB”
const users = new Map<string, Uint8Array>();
const idIndex = new Set<string>();

function makeId(): string {
  const id = crypto.randomUUID()
  return id;
}
function makeUniqueId(): string {
  let id = makeId();
  while (idIndex.has(id)) id = makeId();
  idIndex.add(id);
  return id;
}

function binaryToJSON(u : UserObject) {
    return {
        id: u.getId(),
        name: u.getName(),
        mood: u.getMood(),
        isReal: u.getIsreal()
    }
}

// Routes

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

/** List all users */
app.get('/users', (_req, res) => {
  try {
    const usersJSON = Array.from(users.values()).map(u => UserObject.deserializeBinary(u)).map(binaryToJSON);
    res.json(usersJSON);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({message: `Failed to list users`});
  }
});

/** Create a user */
app.post('/users', (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid body', issues: parsed.error.issues });
  }
  const { name, mood, isReal } = parsed.data;
  // here, we need to first encode the user to a new UserObject instance, then call member func serializeBinary, then store this into the users map.
  const user = new UserObject();
  const uid : string = makeUniqueId();
  user.setId(uid);  
  user.setName(name.trim());
  user.setMood(mood.trim());
  user.setIsreal(isReal);
  user.setTimecreated(Date.now())
  user.setTimeupdated(Date.now())
  const serializedUser = user.serializeBinary();
  users.set(uid, serializedUser);
  // const user: User = { id: makeUniqueId(), name: name.trim(), mood: mood.trim(), isReal: isReal ?? true };
  // users.unshift(user);
  return res.status(201).json(binaryToJSON(user));
});

/** Update a user by id */
app.patch('/users/:id', (req, res) => {
  const uid = req.params.id;
  if (!(users.has(uid))) {
    return res.status(404).json({message: `queried user id is not in the list of users!`});
  }
  // now from here, we want to get the user associated with id, then deserialize it, update the necessary fields, then reserialize it.
  let user = users.get(uid);
  const bin = user instanceof Uint8Array ? user : new Uint8Array(user as any); // needed because user type ambiguous, either UInt8Array or undef
  const message = UserObject.deserializeBinary(bin);

  // now extract from req.body and change the fields with UserObject setters.
  const { name, mood } = req.body;
  if (typeof name == "string" && name.trim().length) message.setName(name)
  if (typeof mood == "string" && mood.trim().length) message.setMood(mood)
  message.setTimeupdated(Date.now())

  const serializedUser = message.serializeBinary();
  users.set(uid, serializedUser);

  return res.status(200).json(binaryToJSON(message));
});

/** Delete a user by id */
app.delete('/users/:id', (req, res) => {
  const uid = req.params.id;
  // goal: try to find id in users, delete that entry, return.
  if (!(users.has(uid))) {
    return res.status(404).json({message: `queried user id is not in the list of users!`});
  }
  users.delete(uid);
  return res.sendStatus(204);
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
