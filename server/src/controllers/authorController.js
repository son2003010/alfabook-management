import AuthorModel from '../models/authorModel.js';

export const getAuthor = async (req, res, next) => {
  try {
    const authors = await AuthorModel.getAuthors();
    res.status(200).json(authors);
  } catch (err) {
    next(err);
  }
};

export const addAuthor = async (req, res, next) => {
  const { AuthorID, AuthorName, Description } = req.body;
  try {
    // Kiểm tra nếu AuthorID đã tồn tại
    const exists = await AuthorModel.isAuthorIdExists(AuthorID);
    if (exists) {
      return res
        .status(400)
        .json({ message: 'AuthorID đã tồn tại, không thể thêm mới' });
    }

    // Nếu chưa tồn tại, thêm mới
    const insertedID = await AuthorModel.addAuthor(
      AuthorID,
      AuthorName,
      Description,
    );
    res.status(200).json({id: insertedID, AuthorID, AuthorName, Description,});
  } catch (err) {
    next(err);
  }
};

export const updateAuthor = async (req, res, next) => {
  const { id } = req.params;
  const { AuthorName, Description } = req.body;
  try {
    await AuthorModel.updateAuthor(id, AuthorName, Description);
    res.status(200).json({ message: 'Cập nhật tác giả thành công' });
  } catch (err) {
    next(err);
  }
};

export const deleteAuthor = async (req, res, next) => {
  const { id } = req.params;
  try {
    await AuthorModel.deleteAuthor(id);
    res.status(200).json({ message: 'Xóa tác giả thành công' });
  } catch (err) {
    next(err);
  }
};
