import { RequestHandler } from "express";
import Check from "../model/Check";
import logger from "../util/logger";

export const getAllChecks: RequestHandler = async (req, res) => {
  logger.info(`request ${req.requestId} inside getAllChecks controller`);
  const checks = await Check.find({}).lean().exec();
  logger.info(`request ${req.requestId} fetching check executed successfully`);

  logger.info(`request ${req.requestId} sending response`);
  res.status(200).json({ checks });
};
