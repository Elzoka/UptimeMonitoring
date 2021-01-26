import { startServer } from "./app";

async function bootstrap(): Promise<void> {
  try {
    await startServer({
      port: 3000,
    });
  } catch (err) {
    process.exit(1);
  }
}

bootstrap();
