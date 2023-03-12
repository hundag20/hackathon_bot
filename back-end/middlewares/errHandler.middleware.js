const logger = require("../utils/logger.js");

const errHandler = (errData, req, res, next) => {
  const { currentTask, err } = errData;
  let status = 500;
  const badErrorTypes = [
    "BadUserRequestException",
    "InvalidRequestException",
    "NullValueException",
  ];
  if (err.status && err.msg) {
    logger("error", `smth went wrong @task: ${currentTask} \n${err.msg}`);
    return res.status(err.status).send(err.msg);
  }
  const error = err?.response?.data?.message
    ? err?.response?.data?.message
    : typeof err?.response?.data === "string"
    ? err?.response?.data
    : err;

  if (
    err?.response?.data?.type &&
    badErrorTypes.includes(err?.response?.data.type)
  )
    status = 400;
  logger("error", `smth went wrong @task: ${currentTask} \n${error}`);
  return res.status(status).send(error);
};
module.exports = errHandler;
