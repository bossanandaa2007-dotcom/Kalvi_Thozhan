import { createServer } from "./src/server.js";
import { env } from "./src/config/env.js";

const app = createServer();

app.listen(env.port, () => {
  console.log(`KalviThozhan API running on port ${env.port}`);
});
