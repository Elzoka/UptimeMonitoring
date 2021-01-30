import { Router } from "express";
import controller from "../../controller";
import handleAsyncError from "../../util/handleAsyncError";
import validator from "../../validator";

const check = Router();

check
  .route("/")
  .get(handleAsyncError(controller.check.getAllChecks))
  .post(
    validator.check.validate("createCheck"),
    handleAsyncError(controller.check.createCheck)
  );

// checks.use("/:id");

export default check;
