"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// optional: npm i zod
const zod_1 = require("zod");
const app = (0, express_1.default)();
const port = 3000;
// Middlewares
app.use((0, cors_1.default)()); // allow frontend on another origin (e.g., Vite 5173)
app.use(express_1.default.json()); // parse application/json
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    mood: zod_1.z.string().min(1),
    isReal: zod_1.z.boolean().optional().default(true),
});
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    mood: zod_1.z.string().min(1).optional(),
    isReal: zod_1.z.boolean().optional(),
}).refine(obj => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
});
// In-memory “DB”
const users = [];
const idIndex = new Set();
function makeId() {
    var _a, _b, _c;
    // Node 18+: crypto.randomUUID()
    const id = (_c = (_b = (_a = global.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : require('node:crypto').randomUUID();
    return id;
}
function makeUniqueId() {
    let id = makeId();
    while (idIndex.has(id))
        id = makeId();
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
    const user = { id: makeUniqueId(), name: name.trim(), mood: mood.trim(), isReal: isReal !== null && isReal !== void 0 ? isReal : true };
    users.unshift(user);
    return res.status(201).json(user);
});
/** Update a user by id */
app.patch('/users/:id', (req, res) => {
    const id = req.params.id;
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1)
        return res.sendStatus(404);
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid body', issues: parsed.error.issues });
    }
    users[idx] = Object.assign(Object.assign({}, users[idx]), parsed.data);
    return res.json(users[idx]);
});
/** Delete a user by id */
app.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    const lenBefore = users.length;
    const next = users.filter(u => u.id !== id);
    if (next.length === lenBefore)
        return res.sendStatus(404);
    // remove and update index
    users.length = 0;
    users.push(...next);
    idIndex.delete(id);
    return res.sendStatus(204);
});
app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
});
