import Form from '../models/form';
import { baseResponse } from './common/baseResponse';
import { handleError } from './common/errorhandle';

export const searchForm = async (req, res, next) => {
  const { option } = req.params;

  try {
    if (option !== '') {
      const response = await Form.find({ option: option });

      if (!response) {
        return baseResponse(
          res,
          false,
          '질문지 조회에 실패했습니다.',
          response
        );
      }

      return baseResponse(res, true, '질문지 조회를 성공했습니다.', response);
    }
  } catch (e) {
    return handleError(res, e);
  }
};
