import { RequestHandler } from "express";
import createHttpError from "http-errors";
import Check from "../model/Check";
import logger from "../util/logger";

export const getAllChecks: RequestHandler = async (req, res) => {
  logger.info(`request ${req.requestId} inside getAllChecks controller`);
  const checks = await Check.find({}).lean().exec();
  logger.info(`request ${req.requestId} fetching check executed successfully`);

  logger.info(`request ${req.requestId} sending response`);
  res.status(200).json({ checks });
};

export const createCheck: RequestHandler = async (req, res) => {
  logger.info(`request ${req.requestId} inside createCheck controller`);
  const check = await Check.create(req.body);
  logger.info(`request ${req.requestId} check created successfully`);

  logger.info(`request ${req.requestId} sending response`);
  res.status(200).json({ check });
};

export const getCheckById: RequestHandler = async (req, res) => {
  logger.info(`request ${req.requestId} inside getCheckById controller`);

  const check = await Check.findById(req.params.id).lean().exec();

  if (!check) {
    logger.info(`request ${req.requestId} check doesn't exist`);

    const { status, message } = new createHttpError.NotFound(
      `check is not found`
    );

    return res.status(status).send({ message });
  }

  logger.info(`request ${req.requestId} returning check by ${req.body.id}`);

  res.status(200).json({ check });
};
