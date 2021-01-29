import express, { ErrorRequestHandler } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import createError from "http-errors";
import dotenv from "dotenv";
import { Server } from "http";
import logger from "./util/logger";
import handleRequestId from "./middleware/handleRequestId";
dotenv.config();

const app = express();

// middleware
app.use(bodyParser.json());
app.use(morgan("short"));
app.use(handleRequestId);

// routes
app.get("/ping", (req, res, next) => {
  res.status(200).send("pong");
});

// handle 404 routes
app.use((req, res) => {
  const { status, message } = new createError.NotFound();

  logger.info(
    `requestId ${req.requestId} has returned with ${status} status and message ${message}`
  );

  res.status(status).json({ message });
});

const ErrorHandler: ErrorRequestHandler = (error, req, res) => {
  const { status, message } = new createError.InternalServerError();

  logger.error(
    `requestId ${req.requestId} has returned with ${status} status and message ${message}`
  );
  res.status(status).json({ message: error.message || message });
};

// handle Errors
app.use(ErrorHandler);

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
