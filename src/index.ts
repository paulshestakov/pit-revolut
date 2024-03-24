import { args } from "./args";
import { initDependencies } from "./init-dependencies";
import { makeServer } from "./server";
import { makeShutdown } from "./shutdown";
import { stringify } from "./utils/stringify";

const { logger, revolut, profitsDividends, profitsStocks } = initDependencies();
const shutdown = makeShutdown({ logger });

const { server } = makeServer({ port: args.port, logger, revolut, profitsDividends, profitsStocks });
shutdown.addDisposable(() => server.stop());
