import { Router } from "express";
import controller from "../../controller";
import handleAsyncError from "../../util/handleAsyncError";

const check = Router();

check.route("/").get(handleAsyncError(controller.check.getAllChecks));

// checks.use("/:id");

export default check;
