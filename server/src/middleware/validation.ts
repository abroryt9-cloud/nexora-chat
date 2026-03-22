import { Request, Response, NextFunction } from 'express';
import { AnySchema } from 'yup';

export const validate = (schema: AnySchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err: any) {
    res.status(400).json({ errors: err.errors });
  }
};
