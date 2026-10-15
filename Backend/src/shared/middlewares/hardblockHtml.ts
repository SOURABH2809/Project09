import { NextFunction, Request, Response } from "express";

export const hardBlockHTML = (req: Request, res: Response, next: NextFunction) => {
  const hasHTML = (value: any): boolean => {
    if (typeof value === "string") {
      return /<[^>]*>/.test(value);
    }

    if (Array.isArray(value)) {
      return value.some(hasHTML);
    }

    if (typeof value === "object" && value !== null) {
      return Object.values(value).some(hasHTML);
    }

    return false;
  };

  if (hasHTML(req.body) || hasHTML(req.query) || hasHTML(req.params)) {
    return res.status(400).json({ error: "HTML not allowed" });
  }

  next();
};
