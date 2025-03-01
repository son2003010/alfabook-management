import PromotionModel from '../models/promotionModel.js';

export const getPromotion = async (req, res) => {
  try {
    const promotions = await PromotionModel.getPromotions();
    res.status(200).json(promotions);
  } catch (err) {
    next(err);
  }
};

export const addPromotion = async (req, res) => {
  try {
    const {
      PromotionName,
      Description,
      StartDate,
      EndDate,
      Discount,
      IsActive,
    } = req.body;

    if (!PromotionName || !StartDate || !EndDate || Discount == null) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc!' });
    }

    // Chuyển đổi ngày nếu StartDate, EndDate là chuỗi hoặc timestamp
    const startDateFormatted = new Date(StartDate);
    const endDateFormatted = new Date(EndDate);

    if (isNaN(startDateFormatted) || isNaN(endDateFormatted)) {
      return res
        .status(400)
        .json({ error: 'StartDate hoặc EndDate không hợp lệ!' });
    }

    const newPromotionId = await PromotionModel.addPromotion(
      PromotionName,
      Description,
      startDateFormatted,
      endDateFormatted,
      Discount,
      IsActive,
    );
    res.status(200).json({message: 'Thêm khuyến mãi thành công!', PromotionID: newPromotionId});
  } catch (err) {
    next(err);
  }
};

export const updatePromotion = async (req, res) => {
  try {
    const PromotionID = Number(req.params.promotionId); // Chuyển đổi sang số

    if (!PromotionID) {
      return res
        .status(400)
        .json({ error: 'PromotionID không được để trống!' });
    }

    // Lấy dữ liệu hiện tại của Promotion từ database
    const promotions = await PromotionModel.getPromotions();
    const existingPromotion = promotions.find(
      (promo) => promo.PromotionID === PromotionID,
    );

    if (!existingPromotion) {
      return res.status(404).json({ error: 'Promotion không tồn tại!' });
    }

    // Chỉ cập nhật những trường có giá trị mới, giữ nguyên dữ liệu cũ nếu không gửi lên
    const updatedPromotion = {
      PromotionName: req.body.PromotionName ?? existingPromotion.PromotionName,
      Description: req.body.Description ?? existingPromotion.Description,
      StartDate: req.body.StartDate
        ? new Date(req.body.StartDate)
        : existingPromotion.StartDate,
      EndDate: req.body.EndDate
        ? new Date(req.body.EndDate)
        : existingPromotion.EndDate,
      Discount: req.body.Discount ?? existingPromotion.Discount,
      IsActive: req.body.IsActive ?? existingPromotion.IsActive,
    };

    // Gọi model để cập nhật dữ liệu
    await PromotionModel.updatePromotion(
      PromotionID,
      updatedPromotion.PromotionName,
      updatedPromotion.Description,
      updatedPromotion.StartDate,
      updatedPromotion.EndDate,
      updatedPromotion.Discount,
      updatedPromotion.IsActive,
    );

    res.status(200).json({message: 'Cập nhật khuyến mãi thành công!', updatedData: updatedPromotion});
  } catch (err) {
    next(err);
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const { promotionId } = req.params;

    await PromotionModel.deletePromotion(promotionId);
    res.status(200).json({ message: 'Xóa khuyến mãi thành công!' });
  } catch (err) {
    next(err);
  }
};
