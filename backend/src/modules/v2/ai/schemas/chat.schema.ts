import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateAiChatRequest = [
  body('message')
    .exists({ checkFalsy: true })
    .withMessage('Message is required.')
    .isString()
    .withMessage('Message must be a string.')
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('Message must be between 1 and 4000 characters.'),
];

export const handleAiChatValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request payload.',
      errors: errors.array().map((error) => ({
        field: error.type === 'field' ? error.path : 'request',
        message: error.msg,
      })),
    });
  }

  return next();
};
