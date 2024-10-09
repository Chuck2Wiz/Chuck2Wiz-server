export const baseResponse = (res, success, message, data = null) => {
  return res.status(success ? 200 : 400).json({
    success: success,
    message: message,
    data: data !== null ? data : {},
  });
};
