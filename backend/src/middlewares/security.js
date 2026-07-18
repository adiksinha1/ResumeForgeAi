import mongoSanitize from 'express-mongo-sanitize';

// Simple XSS cleaner helper to scrub <script> tags and HTML elements recursively
const cleanString = (val) => {
  if (typeof val !== 'string') return val;
  return val
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Strip script blocks
    .replace(/on\w+="[^"]*"/gi, '')                     // Strip handlers (e.g. onload)
    .replace(/javascript:[^"']*/gi, '')                 // Strip javascript: protocol links
    .trim();
};

const sanitizeInput = (obj) => {
  if (!obj) return obj;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'object') {
        sanitizeInput(obj[key]);
      } else if (typeof obj[key] === 'string') {
        obj[key] = cleanString(obj[key]);
      }
    }
  }
};

export const xssClean = (req, res, next) => {
  if (req.body) sanitizeInput(req.body);
  if (req.query) sanitizeInput(req.query);
  if (req.params) sanitizeInput(req.params);
  next();
};

export const mongoSanitizeMiddleware = () => mongoSanitize();
