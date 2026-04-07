# Brat Generator

Brat Generator is a simple web app for creating custom cover images inspired by the iconic Brat-style aesthetic. Type your own text, adjust the background and blur, then export the result as a high-quality image in seconds.

This project is built for people who want a fast, lightweight editor without opening design software. It is especially useful for making memes, social posts, mock covers, or personal artwork with the familiar minimalist look.

## What It Does

- Lets you type any title or phrase and preview it instantly
- Adjusts background color, text size, and blur level
- Exports the final design as `PNG` or `JPG`
- Includes a one-click copy action for supported browsers
- Works in the browser with a responsive interface for desktop and mobile

## Why This Project Exists

The goal of this app is to make the Brat-inspired cover style quick and accessible. Instead of recreating the look manually in a design tool, users can generate a clean result right in the browser and download it immediately.

## Built With

- React 19
- TypeScript
- Vite
- Framer Motion
- Tailwind CSS
- `html-to-image`

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Run Locally

```bash
npm install
npm run dev
```

Open the local URL from Vite, usually `http://localhost:5173`.

## Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```text
brat/
|- public/
|- src/
|  |- assets/
|  |- App.tsx
|  |- main.tsx
|- index.html
|- package.json
```

## Notes

- The generated design is inspired by a recognizable album-cover style and is intended as a creative fan-made tool.
- Clipboard copy depends on browser support. If copy is unavailable, downloading still works normally.

## License

This project is currently shared without an explicit license. Add one if you plan to distribute or accept contributions publicly.
