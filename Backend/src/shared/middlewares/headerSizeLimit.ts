import { NextFunction, Request, Response } from "express";

export const headerSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  for (const [key, value] of Object.entries(req.headers)) {
    if (value && value.length > 3072) {
      return res.status(400).send("Header too large");
    }
  }
  next();
};
