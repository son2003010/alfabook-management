import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const AdminPromotion = () => {
  const [promotions, setPromotions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    PromotionName: '',
    Description: '',
    Discount: '',
    StartDate: '',
    EndDate: '',
  });

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch('/api/get-promotions');
        if (!response.ok) {
          throw new Error('Lỗi khi lấy dữ liệu');
        }
        const data = await response.json();
        setPromotions(data);
      } catch (error) {
        console.error('Lỗi fetch:', error);
      }
    };

    fetchPromotions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingPromotion ? 'PUT' : 'POST';
    const url = editingPromotion
      ? `/api/update-promotion/${editingPromotion.PromotionID}`
      : '/api/add-promotion';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const data = await response.json();
      if (editingPromotion) {
        setPromotions(promotions.map(pro =>
          pro.PromotionID === editingPromotion.PromotionID ? { ...pro, ...formData } : pro
        ));
      } else {
        setPromotions([...promotions, { ...formData, PromotionID: data.PromotionID }]);
      }
      setIsOpen(false);
      setEditingPromotion(null);
      setFormData({ PromotionName: '', Description: '', Discount: '', StartDate: '', EndDate: '' });
    } else {
      const errorData = await response.json();
      alert(errorData.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      await fetch(`/api/delete-promotion/${id}`, { method: 'DELETE' });
      setPromotions(promotions.filter(p => p.PromotionID !== id));
    }
  };

  const formatDate = (date) => date ? date.split("/").reverse().join("-") : null;
  formData.StartDate = formatDate(formData.StartDate);
  formData.EndDate = formatDate(formData.EndDate);

  return (
    <div className="p-6">
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-bold">Quản lý Khuyến Mãi</h2>
        <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm Khuyến Mãi
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Tên</th>
              <th className="px-4 py-2">Giảm giá (%)</th>
              <th className="px-4 py-2">Ngày bắt đầu</th>
              <th className="px-4 py-2">Ngày kết thúc</th>
              <th className="px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {promotions.map((promotion) => (
              <tr key={promotion.PromotionID} className="hover:bg-gray-50">
                <td className="px-4 py-2">{promotion.PromotionID}</td>
                <td className="px-4 py-2">{promotion.PromotionName}</td>
                <td className="px-4 py-2">{promotion.Discount}%</td>
                <td className="px-4 py-2">{promotion.StartDate}</td>
                <td className="px-4 py-2">{promotion.EndDate}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => { setEditingPromotion(promotion); setFormData(promotion); setIsOpen(true); }} className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(promotion.PromotionID)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="text-lg font-semibold">{editingPromotion ? 'Chỉnh sửa Khuyến Mãi' : 'Thêm Khuyến Mãi'}</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800">
              <X />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Tên khuyến mãi" value={formData.PromotionName} onChange={(e) => setFormData({ ...formData, PromotionName: e.target.value })} required />
            <input type="number" min="0" max="100" className="w-full px-4 py-2 border rounded-lg" placeholder="Giảm giá (%)" value={formData.Discount} onChange={(e) => setFormData({ ...formData, Discount: e.target.value })} required />
            <input type="date" className="w-full px-4 py-2 border rounded-lg" value={formData.StartDate} onChange={(e) => setFormData({ ...formData, StartDate: e.target.value })} required />
            <input type="date" className="w-full px-4 py-2 border rounded-lg" value={formData.EndDate} onChange={(e) => setFormData({ ...formData, EndDate: e.target.value })} required />
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 text-gray-500 bg-gray-200 rounded-lg hover:bg-gray-300" onClick={() => setIsOpen(false)}>Hủy</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
  );
};

export default AdminPromotion;