import React, { useState,useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

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
        const fetchAuthors = async () => {
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

        fetchAuthors();
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
          body: JSON.stringify(formData)
        });
    
        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data);  // Debug response từ API

          if (editingPromotion) {
            // Cập nhật state khi sửa
            setPromotions(promotions.map(pro => 
              pro.PromotionID === editingPromotion.PromotionID ? { ...pro, ...formData } : pro
            ));
          } else {
            // Thêm mới vào danh sách với ID từ backend
            setPromotions([...promotions, { ...formData, PromotionID: data.PromotionID }]);
          }
          setIsOpen(false);
          setEditingPromotion(null);
          setFormData({ PromotionName: '', Description: '', Discount: '', StartDate: '', EndDate: '' });
        } else {
          const errorData = await response.json();
          alert(errorData.message); // Hiển thị lỗi nếu AuthorID đã tồn tại
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
          <h2 className="text-xl font-semibold">Quản lý Khuyến Mãi</h2>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Thêm Khuyến Mãi
          </button>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Tên chương trình</th>
                  <th className="px-4 py-2 text-left">Mô tả</th>
                  <th className="px-4 py-2 text-left">Giảm giá (%)</th>
                  <th className="px-4 py-2 text-left">Ngày bắt đầu</th>
                  <th className="px-4 py-2 text-left">Ngày kết thúc</th>
                  <th className="px-4 py-2 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promotion) => (
                  <tr key={promotion.id} className="border-t">
                    <td className="px-4 py-2">{promotion.PromotionID}</td>
                    <td className="px-4 py-2">{promotion.PromotionName}</td>
                    <td className="px-4 py-2">{promotion.Description}</td>
                    <td className="px-4 py-2">{promotion.Discount}%</td>
                    <td className="px-4 py-2">{promotion.StartDate}</td>
                    <td className="px-4 py-2">{promotion.EndDate}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => {
                            setEditingPromotion(promotion);
                            setFormData({
                              PromotionName: promotion.PromotionName,
                              Description: promotion.Description,
                              Discount: promotion.Discount,
                              StartDate: promotion.StartDate,
                              EndDate: promotion.EndDate,
                            });
                            setIsOpen(true);
                          }}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promotion.PromotionID)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingPromotion ? 'Chỉnh sửa Khuyến Mãi' : 'Thêm Khuyến Mãi Mới'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên chương trình</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.PromotionName}
                    onChange={(e) => setFormData({...formData, PromotionName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.Description}
                    onChange={(e) => setFormData({...formData, Description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phần trăm giảm giá</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.Discount}
                    onChange={(e) => setFormData({...formData, Discount: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.StartDate}
                    onChange={(e) => setFormData({...formData, StartDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.EndDate}
                    onChange={(e) => setFormData({...formData, EndDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setEditingPromotion(null);
                    setFormData({ PromotionName: '', Description: '', Discount: '', StartDate: '', EndDate: '' });
                  }}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingPromotion ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotion;