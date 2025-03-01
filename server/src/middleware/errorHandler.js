export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Đã xảy ra lỗi, vui lòng thử lại sau.',
  });
};
