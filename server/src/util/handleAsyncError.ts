import { RequestHandler } from "express";

export default (fn: RequestHandler): RequestHandler => (
  req,
  res,
  next
): Promise<void> => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};
