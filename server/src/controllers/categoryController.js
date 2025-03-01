import CategoryModel from '../models/categoryModel.js';

export const getCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const categorys = await CategoryModel.getCategory(categoryId);
    res.status(200).json(categorys);
  } catch (err) {
    next(err);
  }
};
export const getCategoryNoId = async (req, res) => {
  try {
    const categorys = await CategoryModel.getCategory();
    res.status(200).json(categorys);
  } catch (err) {
    next(err);
  }
};
export const addCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    
    if (!categoryName) {
      return res.status(400).json({ message: 'CategoryName là bắt buộc' });
    }
    
    const newCategory = await CategoryModel.addCategory(categoryName);
    res.status(200).json(newCategory);
  } catch (err) {
    next(err);
  }
};
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await CategoryModel.deleteCategory(id);
    res.status(200).json({ message: 'Xóa danh mục thành công' });
  } catch (err) {
    next(err);
  }
};