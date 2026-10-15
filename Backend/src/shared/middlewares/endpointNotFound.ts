import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/request-handling/response.utils.js";

export const endpointNotFound = (req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json(errorResponse("Endpoint not found"));
};
