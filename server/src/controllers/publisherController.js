import PublisherModel from '../models/publisherModel.js';

export const getPublisher = async (req, res) => {
  try {
    const publishers = await PublisherModel.getPublishers();
    res.status(200).json(publishers);
  } catch (err) {
    next(err);
  }
};

export const addPublisher = async (req, res) => {
  const { PublisherName, Address, Phone } = req.body;

  // Kiểm tra thiếu thông tin
  if (!PublisherName || !Address || !Phone) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
  }

  const phoneRegex = /^(0[1-9][0-9]{8}|(\+84)[1-9][0-9]{8})$/;
  if (!phoneRegex.test(Phone)) {
    return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
  }

  try {
    const insertedID = await PublisherModel.addPublisher(
      PublisherName,
      Address,
      Phone,
    );
    res.status(200).json({id: insertedID, PublisherName, Address, Phone});
  } catch (err) {
    next(err);
  }
};

export const updatePublisher = async (req, res) => {
  const { id } = req.params;
  const { PublisherName, Address, Phone } = req.body;
  try {
    await PublisherModel.updatePublisher(id, PublisherName, Address, Phone);
    res.status(200).json({ message: 'Cập nhật nhà xuất bản thành công' });
  } catch (err) {
    next(err);
  }
};

export const deletePublisher = async (req, res) => {
  const { id } = req.params;
  try {
    await PublisherModel.deletePublisher(id);
    res.status(200).json({ message: 'Xóa nhà xuất bản thành công' });
  } catch (err) {
    next(err);
  }
};
