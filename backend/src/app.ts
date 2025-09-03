import express from 'express';
import cors from 'cors';
// optional: npm i zod
import { z } from 'zod';

const app = express();
const port = 3000;

// Middlewares
app.use(cors());               // allow frontend on another origin (e.g., Vite 5173)
app.use(express.json());       // parse application/json

// Types / schema
type User = {
  id: string;
  name: string;
  mood: string;
  isReal: boolean; // user-added = true, simulated = false
};

const createUserSchema = z.object({
  name: z.string().min(1),
  mood: z.string().min(1),
  isReal: z.boolean().optional().default(true),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  mood: z.string().min(1).optional(),
  isReal: z.boolean().optional(),
}).refine(obj => Object.keys(obj).length > 0, {
  message: 'At least one field must be provided',
});

// In-memory “DB”
const users: User[] = [];
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

// Routes

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

/** List all users */
app.get('/users', (_req, res) => {
  res.json(users);
});

/** Create a user */
app.post('/users', (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid body', issues: parsed.error.issues });
  }
  const { name, mood, isReal } = parsed.data;
  const user: User = { id: makeUniqueId(), name: name.trim(), mood: mood.trim(), isReal: isReal ?? true };
  users.unshift(user);
  return res.status(201).json(user);
});

/** Update a user by id */
app.patch('/users/:id', (req, res) => {
  const id = req.params.id;
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.sendStatus(404);

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid body', issues: parsed.error.issues });
  }

  users[idx] = { ...users[idx], ...parsed.data };
  return res.json(users[idx]);
});

/** Delete a user by id */
app.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  const lenBefore = users.length;
  const next = users.filter(u => u.id !== id);
  if (next.length === lenBefore) return res.sendStatus(404);

  // remove and update index
  users.length = 0; users.push(...next);
  idIndex.delete(id);
  return res.sendStatus(204);
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
