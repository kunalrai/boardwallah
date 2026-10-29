import { createApp } from "./app";

const port = Number(process.env.PORT ?? 8787);
const { app } = createApp();

const server = Bun.serve({
  port,
  fetch: (request) => app.fetch(request),
  idleTimeout: 30,
});

console.log(`Home Tuition Provider API listening on http://localhost:${server.port}`);
