import { RequestHandler } from "express";
import { param } from "express-validator";

import handleValidation from "../middleware/handleValidation";
import logger from "../util/logger";

interface UtilsValidation {
  checkId: (clearInvalidatedData: boolean) => RequestHandler[];
}

const errorMessages = {
  id: {
    required: "id is not provided",
    isMongoID: "please provide a valid mongodb id",
  },
};

const utilsValidation: UtilsValidation = {
  checkId: (clearInvalidatedData: boolean) => {
    const validators: RequestHandler[] = [
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
    ];

    if (clearInvalidatedData) {
      validators.push(handleValidation);
    }

    return validators;
  },
};

export const validate = (
  route: keyof UtilsValidation,
  clearInvalidatedData: boolean = false
) => utilsValidation[route](clearInvalidatedData);
