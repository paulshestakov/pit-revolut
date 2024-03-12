const winston = require("winston");

export const makeLogger = () => {
  return winston.createLogger({
    level: "debug",
    format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.prettyPrint()),
    transports: [new winston.transports.Console({ format: winston.format.simple() })],
  });
};

export type Logger = ReturnType<typeof makeLogger>;
