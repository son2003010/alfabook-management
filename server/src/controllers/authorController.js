import AuthorModel from '../models/authorModel.js';

export const getAuthor = async (req, res) => {
  try {
    const authors = await AuthorModel.getAuthors();
    res.json(authors);
  } catch (error) {
    console.error('Lỗi lấy tác giả:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const addAuthor = async (req, res) => {
  const { AuthorID, AuthorName, Description } = req.body;
  try {
      // Kiểm tra nếu AuthorID đã tồn tại
      const exists = await AuthorModel.isAuthorIdExists(AuthorID);
      if (exists) {
          return res.status(400).json({ message: 'AuthorID đã tồn tại, không thể thêm mới' });
      }

      // Nếu chưa tồn tại, thêm mới
      const insertedID = await AuthorModel.addAuthor(AuthorID, AuthorName, Description);
      res.status(201).json({
          id: insertedID,
          AuthorID,
          AuthorName,
          Description
      });
  } catch (error) {
      console.error('Lỗi thêm tác giả:', error);
      res.status(500).json({ message: 'Lỗi server' });
  }
};

  

export const updateAuthor = async (req, res) => {
  const { id } = req.params;
  const { AuthorName, Description } = req.body;
  try {
    await AuthorModel.updateAuthor(id, AuthorName, Description);
    res.json({ message: 'Cập nhật tác giả thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật tác giả:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deleteAuthor = async (req, res) => {
  const { id } = req.params;
  try {
    await AuthorModel.deleteAuthor(id);
    res.json({ message: 'Xóa tác giả thành công' });
  } catch (error) {
    console.error('Lỗi xóa tác giả:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
