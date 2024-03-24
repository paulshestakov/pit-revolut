import type { Logger } from "./logger";
import type { ProfitsDividends } from "./profits-dividends";
import type { ProfitsStocks } from "./profits-stocks";
import type { Revolut } from "./revolut";

type Config = {
  port: number;
  logger: Logger;
  revolut: Revolut;
  profitsDividends: ProfitsDividends;
  profitsStocks: ProfitsStocks;
};

export const makeServer = ({ port, logger, revolut, profitsDividends, profitsStocks }: Config) => {
  const server = Bun.serve({
    port,
    async fetch(request) {
      const url = new URL(request.url);
      logger.info(`[api request] ${request.method} ${request.url}`);

      if (request.method === "GET" && url.pathname === "/health") {
        return new Response("OK");
      }

      if (request.method === "POST" && url.pathname === "/action") {
        const formdata = await request.formData();
        const file = formdata.get("file") as unknown as Blob;

        const buffer = Buffer.from(await file.arrayBuffer());

        const transactions = revolut.getTransactions(buffer);

        const dividends = await profitsDividends.getProfits(transactions);
        const stocks = await profitsStocks.getProfits(transactions);

        const response = {
          dividends,
          stocks,
        };

        return Response.json(response);
      }

      return new Response("Not found", { status: 404 });
    },
    error(error) {
      return new Response(`<pre>${error}\n${error.stack}</pre>`, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    },
  });

  console.log(`Listening on localhost:${server.port}`);

  return {
    server,
  };
};
