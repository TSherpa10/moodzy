## Moodzy

Moodzy is a simple webapp designed to survey your name and mood! Join a community of people!

Note: This project was created to experiment with Vue, Node / Express, and GPBs. It's an intentionally small project with zmq subscriber functionality (but the original example is removed, up to intepretation, use your own!)

### System Design:

![Screenshot](https://github.com/TSherpa10/moodzy/blob/main/Screenshot%202025-09-04%20083941.png)

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
