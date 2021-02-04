import { RequestHandler } from "express";
import { body } from "express-validator";
import handleValidation from "../middleware/handleValidation";
import logger from "../util/logger";

interface RoutesValidation {
  createCheck: RequestHandler[];
}

const errorMessages = {
  protocol: {
    required: "protocol is not provided",
    enum: "protocol must be either http or https",
  },
  url: {
    required: "url is not provided",
    isUrl: "url is not valid",
  },
  timeoutSeconds: {
    required: "timeoutSeconds in not provided",
    isInt: "timeoutSeconds must be integer",
  },
  method: {
    required: "method in not provided",
    enum: "method must be one of the following POST, GET, UPDATE, DELETE",
  },
  successCodes: {
    required: "successCodes is not provided",
    isArray:
      "successCodes must be an array of that includes at least one numeric status code",
  },
};

const routesValidation: RoutesValidation = {
  createCheck: [
    (req, _res, next) => {
      logger.info(`request ${req.requestId} started createCheck validation`);
      console.log(req.body);
      next();
    },
    body("protocol")
      .exists()
      .withMessage(errorMessages.protocol.required)
      .isString()
      .trim()
      .toLowerCase()
      .isIn(["http", "https"])
      .withMessage(errorMessages.protocol.enum),
    body("url")
      .exists()
      .withMessage(errorMessages.url.required)
      .isString()
      .trim()
      .toLowerCase()
      .isURL()
      .withMessage(errorMessages.url.isUrl),
    body("timeoutSeconds")
      .exists()
      .withMessage(errorMessages.timeoutSeconds.required)
      .isInt()
      .toInt()
      .withMessage(errorMessages.timeoutSeconds.isInt),
    body("method")
      .exists()
      .withMessage(errorMessages.method.required)
      .isString()
      .trim()
      .toUpperCase()
      .isIn(["POST", "GET", "UPDATE", "DELETE"])
      .withMessage(errorMessages.method.enum),
    body("successCodes", errorMessages.successCodes.isArray)
      .exists()
      .withMessage(errorMessages.method.required)
      .isArray({ min: 1 })
      .custom((value) => {
        if (value.every(Number.isInteger)) {
          return true;
        }
        throw new Error("Array does not contain Integers");
      }),
    handleValidation,
  ],
};

export const validate = (route: keyof RoutesValidation) =>
  routesValidation[route];
