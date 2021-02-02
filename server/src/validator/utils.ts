import { RequestHandler } from "express";
import { param } from "express-validator";

import handleValidation from "../middleware/handleValidation";
import logger from "../util/logger";

interface UtilsValidation {
  checkId: RequestHandler[];
}

const errorMessages = {
  id: {
    required: "id is not provided",
    isMongoID: "please provide a valid mongodb id",
  },
};

const utilsValidation: UtilsValidation = {
  checkId: [
    (req, _res, next) => {
      logger.info(`request ${req.requestId} started checking params id`);
      next();
    },
    param("id")
      .exists()
      .withMessage(errorMessages.id.required)
      .toLowerCase()
      .trim()
      .isMongoId()
      .withMessage(errorMessages.id.isMongoID),
    handleValidation,
  ],
};

export const validate = (route: keyof UtilsValidation) =>
  utilsValidation[route];
