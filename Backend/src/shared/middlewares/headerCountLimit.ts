import { NextFunction, Request, Response } from "express";

export const headerCountLimit = (req: Request, res: Response, next: NextFunction) => {
  const headerCount = Object.keys(req.headers).length;

  if (headerCount > 50) {
    return res.status(400).send("Bad Request");
  }

  next();
};
