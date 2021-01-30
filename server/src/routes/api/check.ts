import { Router } from "express";
import controller from "../../controller";
import { createCheck } from "../../controller/check";
import handleAsyncError from "../../util/handleAsyncError";

const check = Router();

check
  .route("/")
  .get(handleAsyncError(controller.check.getAllChecks))
  .post(handleAsyncError(createCheck));

// checks.use("/:id");

export default check;
