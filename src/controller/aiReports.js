import { handleError, validate } from './common/errorhandle';
import { baseResponse } from './common/baseResponse';
import mongoose from 'mongoose';
import Joi from 'joi';
import User from '../models/user';

export const saveAiReport = async (req, res, next) => {
  const schema = Joi.object({
    userNum: Joi.string().required(),
    selectOption: Joi.string().required(),
    formData: Joi.array().items(Joi.string()).required(),
    answerData: Joi.array().items(Joi.string()).required(),
    reportValue: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return baseResponse(res, false, 'Request Body ERROR');
  }
  const { userNum, selectOption, formData, answerData, reportValue } = value;

  try {
    const user = await User.findOne({ userNum: userNum });

    if (!user) {
      return baseResponse(res, false, '유저를 찾을 수 없습니다.');
    }

    // 새로운 AI Report 데이터 추가
    const newAiReport = {
      data: {
        selectOption,
        formData,
        answerData,
        reportValue,
      },
    };

    // 사용자의 aiReport 배열에 추가
    user.aiReport.push(newAiReport);

    // 변경 사항 저장
    await user.save();

    return baseResponse(res, true, '레포트가 정상적으로 등록되었습니다.');
  } catch (e) {
    console.error('Error saving AI report:', e);
    return handleError(res, e);
  }
};

export const getAiReports = async (req, res, next) => {
  const { userNum } = req.params;

  try {
    const user = await User.findOne({ userNum: userNum });

    if (!user) {
      return baseResponse(res, false, '유저를 찾을 수 없습니다.');
    }

    const aiReports = user.aiReport;

    return baseResponse(res, true, 'AI 레포트 조회를 성공했습니다.', {
      aiReports,
    });
  } catch (e) {
    console.error(e);
    return handleError(res, e);
  }
};

export const getAiReportById = async (req, res, next) => {
  const { aiReportId, userNum } = req.params;

  // ID 유효성 검사
  if (!mongoose.Types.ObjectId.isValid(aiReportId)) {
    return baseResponse(res, false, '유효하지 않는 레포트 ID입니다.');
  }

  try {
    // 유저를 찾기
    const user = await User.findOne({ userNum: userNum });

    if (!user) {
      return baseResponse(res, false, '유저를 찾을 수 없습니다.');
    }

    // 유저의 aiReport 배열에서 특정 ID를 가진 레포트를 찾기
    const aiReport = user.aiReport.find(
      (report) => report._id.toString() === aiReportId
    );

    if (!aiReport) {
      return baseResponse(res, false, '해당 레포트를 찾을 수 없습니다.');
    }

    return baseResponse(res, true, 'AI 레포트 조회를 성공했습니다.', {
      aiReport,
    });
  } catch (e) {
    console.error('Error retrieving AI report:', e);
    return handleError(res, e);
  }
};
