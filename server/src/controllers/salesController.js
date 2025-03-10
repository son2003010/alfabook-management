import SalesModel from '../models/salesModel.js';

export const getSalesChart = async (req, res, next) => {
  try {
    const salesByMonth = await SalesModel.getSalesByMonth();
    res.status(200).json({ salesByMonth });
  } catch (err) {
    next(err);
  }
};
export const getNewUsers = async (req, res, next) => {
  try {
    const data = await SalesModel.getNewUsers();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
export const getNewOrders = async (req, res, next) => {
  try {
    const data = await SalesModel.getNewOrders();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
export const getRevenuePayment = async (req, res, next) => {
  try {
    const data = await SalesModel.getRevenuePayment();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
