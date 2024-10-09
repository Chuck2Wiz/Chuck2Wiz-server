import Form from '../models/Form';
import { handleError } from './common/errorhandle';

export const searchForm = async (req, res, next) => {
  const { option } = req.params;

  try {
    if (option !== '') {
      const response = await Form.find({ option: option });

      if (!response || response.length === 0) {
        return res.status(400).json({
          success: false,
          message: '질문지 조회에 실패했습니다.',
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: '질문지 조회를 성공했습니다.',
        data: response,
      });
    }

    return res.status(400).json({
      success: false,
      message: '옵션이 비어 있습니다.',
      data: null,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      data: null,
    });
  }
};
