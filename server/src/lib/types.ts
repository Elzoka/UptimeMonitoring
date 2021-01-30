import { ObjectId } from "mongoose";

export enum HTTPMethods {
  "POST" = "POST",
  "GET" = "GET",
  "UPDATE" = "UPDATE",
  "DELETE" = "DELETE",
}

export enum HTTPProtocols {
  HTTP = "http",
  HTTPs = "https",
}

export interface Check {
  protocol: HTTPProtocols;
  url: string;
  timeoutSeconds: number;
  method: HTTPMethods;
  successCodes: [number];
}
