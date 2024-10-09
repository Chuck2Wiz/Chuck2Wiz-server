export const baseResponse = (res, success, message, data = null) => {
  return res.status(success ? 200 : 400).json({
    status: success ? 200 : 400,
    success: success,
    message: message,
    data: data !== null ? data : {},
  });
};
