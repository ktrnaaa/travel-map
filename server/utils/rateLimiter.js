import rateLimit from 'express-rate-limit';

export const supportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Ви досягли ліміту звернень. Спробуйте через годину.',
    });
  },
});
