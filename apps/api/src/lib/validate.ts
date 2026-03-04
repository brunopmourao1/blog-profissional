import { type Request, type Response, type NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";
import { ValidationError } from "./errors.js";

// =============================================================
// Zod Validation Wrapper
// =============================================================

export function validateBody<T>(schema: ZodSchema<T>) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors: Record<string, string[]> = {};
                for (const issue of error.issues) {
                    const path = issue.path.join(".") || "body";
                    if (!errors[path]) errors[path] = [];
                    errors[path]!.push(issue.message);
                }
                next(new ValidationError(errors));
            } else {
                next(error);
            }
        }
    };
}

export function validateParams<T>(schema: ZodSchema<T>) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            req.params = schema.parse(req.params) as Record<string, string>;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors: Record<string, string[]> = {};
                for (const issue of error.issues) {
                    const path = issue.path.join(".") || "params";
                    if (!errors[path]) errors[path] = [];
                    errors[path]!.push(issue.message);
                }
                next(new ValidationError(errors));
            } else {
                next(error);
            }
        }
    };
}
