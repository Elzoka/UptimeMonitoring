import express from "express";
import bodyParser from "body-parser";
import { Server } from "http";

const app = express();

// middleware
app.use(bodyParser.json());

// routes
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

interface StartServerOptions {
  port?: string | number;
}

export async function startServer({
  port,
}: StartServerOptions = {}): Promise<Server> {
  port = port && Number(port);

  if (!port) {
    // exit
    process.exit(1);
  }

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
}

export default app;
