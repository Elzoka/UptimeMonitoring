import { startServer } from "./app";
import logger from "./util/logger";
import config from "./config";

async function bootstrap(): Promise<void> {
  const PORT = config.PORT || 3000;

  try {
    await startServer({
      port: PORT,
    });

    logger.info(`app started on port ${PORT}`);
  } catch (err) {
    logger.error("server crashed on startup");
    process.exit(1);
  }
}

bootstrap();
