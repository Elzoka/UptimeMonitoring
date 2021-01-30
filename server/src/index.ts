import { startServer } from "./app";
import logger from "./util/logger";
import config from "./config";
import { setupMongoose } from "./util/db";

async function bootstrap(): Promise<void> {
  const PORT = config.PORT || 3000;

  try {
    const cleanupMongoose = await setupMongoose(config.MONGO_URI);
    logger.info(`mongodb is connected successfully on uri ${config.MONGO_URI}`);

    const server = await startServer({
      port: PORT,
    });

    logger.info(`app started on port ${PORT}`);

    server.on("close", cleanupMongoose);
  } catch (error) {
    logger.error(`server crashed on startup with error ${error.message}`);
    process.exit(1);
  }
}

bootstrap();
