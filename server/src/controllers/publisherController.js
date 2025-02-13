import PublisherModel from '../models/publisherModel.js';

export const getPublisher = async (req, res) => {
  try {
    const publishers = await PublisherModel.getPublishers();
    res.json(publishers);
  } catch (error) {
    console.error('Lỗi lấy nhà xuất bản:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const addPublisher = async (req, res) => {
    const { PublisherName, Address, Phone } = req.body;
    try {
      const insertedID = await PublisherModel.addPublisher(PublisherName, Address, Phone);
      res.status(201).json({
        id: insertedID, 
        PublisherName, 
        Address, 
        Phone
      });
    } catch (error) {
      console.error('Lỗi thêm nhà xuất bản:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  };
  

export const updatePublisher = async (req, res) => {
  const { id } = req.params;
  const { PublisherName, Address, Phone } = req.body;
  try {
    await PublisherModel.updatePublisher(id, PublisherName, Address, Phone);
    res.json({ message: 'Cập nhật nhà xuất bản thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật nhà xuất bản:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deletePublisher = async (req, res) => {
  const { id } = req.params;
  try {
    await PublisherModel.deletePublisher(id);
    res.json({ message: 'Xóa nhà xuất bản thành công' });
  } catch (error) {
    console.error('Lỗi xóa nhà xuất bản:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
