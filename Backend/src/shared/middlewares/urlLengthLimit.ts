import { NextFunction, Request, Response } from "express";

export const urlLengthLimit = (req: Request, res: Response, next: NextFunction) => {
  if (req.url.length > 2048) {
    return res.status(414).send("URI Too Long");
  }
  next();
};
