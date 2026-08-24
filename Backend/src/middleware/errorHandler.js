export default function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  if (statusCode === 500) console.error(error);

  res.status(statusCode).json({ success: false, message });
}