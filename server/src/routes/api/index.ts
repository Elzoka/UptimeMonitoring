import { Router } from "express";
import check from "./check";

const api = Router();

api.use("/check", check);

export default api;
