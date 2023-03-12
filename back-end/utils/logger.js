const winston = require("winston");

const Logger = winston.createLogger({
  level: "verbose",
  format: winston.format.json(),
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: "error.JSON", level: "error" }),
    new winston.transports.File({ filename: "info.JSON", level: "info" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  Logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
const logger = async (lvl, msg) => {
  const message = `${new Date()} ... ${msg}`;
  Logger.log({
    level: lvl,
    message: message,
  });
};
module.exports = logger;
