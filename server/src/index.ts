import logger from "./util/logger";

import { startServer } from "./app";

async function bootstrap(): Promise<void> {
  const PORT = 3000;
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
