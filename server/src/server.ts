import app from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

async function start() {
  await connectDatabase();
  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

start();
