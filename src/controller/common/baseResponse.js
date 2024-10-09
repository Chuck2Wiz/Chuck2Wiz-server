export const baseResponse = (res, success, message, data = null) => {
  console.log('baseResponse called:', { success, message, data });
  return res.status(success ? 200 : 400).json({ success, message, data });
};
