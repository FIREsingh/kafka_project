import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.ts";

type RequestPart = "body" | "params" | "query";

export const validate =
  (schema: ZodType, part: RequestPart = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return next(new AppError(message, 400));
    }

    req[part] = result.data;
    next();
  };
