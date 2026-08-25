/**
 * @file notFound.js
 * @description 404 Not Found middleware.
 * Register this AFTER all routes but BEFORE errorHandler in app.js.
 * Catches any unmatched route and passes a structured 404 error forward.
 */

const notFound = (req, res, next) => {
    const err = new Error(`Not Found — ${req.method} ${req.originalUrl}`);
    err.statusCode = 404;
    next(err);
};

module.exports = notFound;
