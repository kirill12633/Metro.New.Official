import rateLimit from 'express-rate-limit';

export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Слишком много попыток регистрации. Попробуйте позже.' },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.ip
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Слишком много попыток входа. Попробуйте позже.' },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.ip
});

export const usernameCheckLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Слишком много запросов. Подождите.' },
  keyGenerator: (req) => req.ip
});

export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Слишком много писем. Попробуйте через час.' },
  keyGenerator: (req) => req.ip
});
