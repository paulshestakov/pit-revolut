const winston = require("winston");

type Config = {
  level: string;
};

export const makeLogger = ({ level }: Config) => {
  return winston.createLogger({
    level,
    format: winston.format.combine(winston.format.colorize(), winston.format.prettyPrint()),
    transports: [new winston.transports.Console({ format: winston.format.simple() })],
  });
};

export type Logger = ReturnType<typeof makeLogger>;
