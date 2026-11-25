import { httpError } from './auth.js';


export const validate = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.body || {}, {
    abortEarly: true,
    stripUnknown: true,
    errors: { wrap: { label: false } },
  });
  if (error) return next(httpError(400, error.details[0].message));
  req.body = value;
  next();
};
