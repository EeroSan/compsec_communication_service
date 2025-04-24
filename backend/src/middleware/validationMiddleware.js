// middleware/validationMiddleware.js
import { body, validationResult } from "express-validator";

// Middleware to check validation result
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};





export const validatePassword = body("password")
  .isString()
  .withMessage("Password must be a string")
  .isLength({ min: 12, max: 65 })
  .withMessage("Password must be 12-65 characters long")
  .trim();

export const validateEmail = body("email")
  .isEmail().withMessage("Must be a valid email")
  .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) // standard structure
  .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) // stricter: avoid special chars
  .withMessage("Email contains invalid characters")
  .normalizeEmail();


export const whitelistFields = (allowedFields) => (req, res, next) => {
    const extraFields = Object.keys(req.body).filter(f => !allowedFields.includes(f));
    if (extraFields.length > 0) {
      return res.status(400).json({
        error: `Unexpected fields: ${extraFields.join(", ")}`,
      });
    }
    next();
  };

  export const validateLoginCredentials = [
    validateEmail,
    validatePassword,
    validateRequest,
  ];