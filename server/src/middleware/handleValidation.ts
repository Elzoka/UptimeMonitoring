import { RequestHandler } from "express";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";
import logger from "../util/logger";

interface IError {
  [key: string]: string;
}

const handleValidation: RequestHandler = (req, res, next) => {
  logger.info(`request ${req.requestId} in handle validation middleware`);
  const result = validationResult(req);

  if (result.isEmpty()) {
    logger.info(`request ${req.requestId} has no validation errors`);

    logger.info(`request ${req.requestId} cleaning up the request payload`);
    req.query = matchedData(req, { locations: ["query"] });
    req.body = matchedData(req, { locations: ["body"] });
    req.params = matchedData(req, { locations: ["params"] });
    req.cookies = matchedData(req, { locations: ["cookies"] });
    req.headers = matchedData(req, { locations: ["headers"] });

    next();
  } else {
    logger.info(
      `request ${req.requestId} mapping validation errors to error messages`
    );

    const errors = result.array();

    const errorKeys = new Set();
    const errorMessages: IError[] = [];

    errors.forEach((err) => {
      if (!errorKeys.has(err.param)) {
        errorKeys.add(err.param);
        errorMessages.push({ [err.param]: err.msg });
      }
    });

    logger.info(
      `request ${req.requestId} has ${errorMessages.length} validation errors`
    );

    logger.info(`request ${req.requestId} returning bad request`);

    const { message, status } = new createHttpError.BadRequest();
    return res.status(status).json({
      errors: errorMessages,
      message,
    });
  }
};

export default handleValidation;
