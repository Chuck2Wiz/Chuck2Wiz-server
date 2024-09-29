export const handleError = (
  res,
  error,
  message = '[서버오류] 관리자에게 문의하세요.'
) => {
  console.error(error);
  return baseResponse(res, false, { message });
};

export const validate = (schema, data) => {
  const { error } = schema.validate(data);
  if (error) {
    return { message: error.details[0].message };
  }
  return { message: null };
};
