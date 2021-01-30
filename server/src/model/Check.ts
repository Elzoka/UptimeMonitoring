import { Schema, model, Document } from "mongoose";
import { Check } from "../lib/types";

const CheckSchema = new Schema(
  {
    protocol: { type: String, required: true, enum: ["http", "https"] },
    url: {
      type: String,
      required: true,
      minlength: 1,
    },
    timeoutSeconds: {
      type: Number,
      min: 1,
      max: 5,
    },
    method: {
      type: String,
      required: true,
      enum: ["POST", "GET", "UPDATE", "DELETE"],
    },
    successCodes: {
      type: [Number],
      required: true,
      minlength: 1,
    },
  },
  { timestamps: true }
);

interface CheckDocument extends Check, Document {}

export default model<CheckDocument>("checks", CheckSchema);
