<p align="center">
  <img src="https://github.com/TSherpa10/moodzy/blob/main/moodzy-logo.png" width=50% height=50% />
</p>

Moodzy is a simple webapp designed to survey your name and mood! Join a community of people!

Note: This is a tutorial webapp designed for the purpose of learning Vue, Google protocol buffers and zeromq publisher/subscriber model, and system design.
Note x2: Zmq publisher is intentionally omitted, use your own service and publish to ports 9000 and/or 9001!

### System Design:

<p align="center">
  <img src="https://github.com/TSherpa10/moodzy/blob/main/moodzy-diagram.png" width=80% height=80% />
</p>

### Usage Guide:

STEP 1: in one terminal (T1), navigate to the frontend folder, run the following:

- `npm i`
- `npm proto-generate`
- `npm run dev`

STEP 2: in another terminal window (T2), navigate to the backend folder, run the following:

- `npm i`
- `npm proto-generate`
- `npx tsc -p .` (from backend root dir)
- `npm run postbuild`
- `npm run dev` 

STEP 3: in your last terminal window (T3, optional if you have an external message publisher service), navigate to the backend folder, run the following:
(assuming you completed step 2)
- `node dist/subscriber.js`

STEP 4: open localhost:5173 (if not auto-opened) and enjoy the demo!
