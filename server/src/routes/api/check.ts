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

check
  .route("/:id")
  .all(validator.utils.validate("checkId"))
  .get(handleAsyncError(controller.check.getCheckById))
  .delete(handleAsyncError(controller.check.deleteCheckById))
  .put(
    validator.check.validate("updateCheckById"),
    handleAsyncError(controller.check.updateCheckById)
  );

export default check;
