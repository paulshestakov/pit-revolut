import type { Logger } from "./logger";

type Config = {
  logger: Logger;
};

type Disposable = (() => Promise<void>) | (() => void);

export const makeShutdown = ({ logger }: Config) => {
  const disposables: Disposable[] = [];

  const makeCallback = (signal: string, code: number) => async (error: Error) => {
    const level = code === 0 ? "info" : "error";
    logger.log(level, `Application exit by reason ${error}`);

    await Promise.all(disposables.map((dispose) => dispose()));
  };

  process.on("SIGTERM", makeCallback("SIGTERM", 0));
  process.on("SIGINT", makeCallback("SIGINT", 0));
  process.on("uncaughtException", makeCallback("uncaughtException", 1));
  process.on("unhandledRejection", makeCallback("unhandledRejection", 1));

  return {
    addDisposable: (disposable: Disposable) => {
      disposables.push(disposable);
    },
  };
};
