import { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject, ZodIssue } from "zod";
import { errorResponse } from "../utils/request-handling/response.utils.js";

export const validateResource =
  (schema: ZodObject<any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body ?? {},
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Checking environment
        const isDevelopment = process.env.NODE_ENV === "development";

        if (isDevelopment) {
          // Development: Show detailed errors
          const errors = error.issues.map((err: ZodIssue) => ({
            field: err.path.join("."),
            message: err.message,
          }));

          //  Using errorResponse method
          return res.status(400).json(errorResponse(errors[0].message, errors));
        }

        // Production: Generic message
        return res.status(400).json(errorResponse("Payload is incorrect or missing fields."));
      }
      console.log("Validation Error: ", error);
      return res.status(500).json(errorResponse("Internal server error"));
    }
  };
