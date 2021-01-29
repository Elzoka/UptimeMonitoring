import { v4 } from "uuid";

import { RequestHandler } from "express";

const handleRequestId: RequestHandler = (req, res, next) => {
  req.requestId = v4();
  console.log(req.requestId);
  next();
};

export default handleRequestId;
