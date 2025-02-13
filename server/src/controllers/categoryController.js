import CategoryModel from '../models/categoryModel.js';

export const getCategory = async (req, res) => {  
  try {
    const { categoryId } = req.params;

    const categorys = await CategoryModel.getCategory(categoryId);
    res.status(200).json(categorys);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving books', error: err });
  }
};
export const getCategoryNoId = async (req, res) => {  
  try {
    const categorys = await CategoryModel.getCategory();
    res.status(200).json(categorys);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving books', error: err });
  }
};
