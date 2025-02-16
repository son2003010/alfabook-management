import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const AdminPublisher = () => {
  const [publishers, setPublishers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    PublisherName: '',
    Address: '',
    Phone: '',
  });

  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const response = await fetch('/api/get-publisher');
        if (!response.ok) throw new Error('Lỗi khi lấy dữ liệu');
        const data = await response.json();
        setPublishers(data);
      } catch (error) {
        console.error('Lỗi fetch:', error);
      }
    };

    fetchPublishers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingPublisher ? 'PUT' : 'POST';
    const url = editingPublisher
      ? `/api/update-publisher/${editingPublisher.PublisherID}`
      : '/api/add-publisher';

    try{
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json(); 

      if (!response.ok) {
        setErrorMessage(data.message || 'Lỗi không xác định');
        return;
      }

      setPublishers((prev) =>
          editingPublisher
            ? prev.map((p) => (p.PublisherID === editingPublisher.PublisherID ? { ...p, ...formData } : p))
            : [...prev, { ...formData, PublisherID: data.id }]
      );
      setIsOpen(false);
      setEditingPublisher(null);
      setFormData({ PublisherName: '', Address: '', Phone: '' });   
    } catch (error){
      setErrorMessage('Lỗi kết nối đến server');
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      await fetch(`/api/delete-publisher/${id}`, { method: 'DELETE' });
      setPublishers((prev) => prev.filter((p) => p.PublisherID !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Quản lý Nhà Xuất Bản</h2>
          <button onClick={() => { setIsOpen(true); setEditingPublisher(null); setErrorMessage(''); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Thêm Nhà Xuất Bản
          </button>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Tên</th>
                <th className="px-4 py-2">Địa chỉ</th>
                <th className="px-4 py-2">Số điện thoại</th>
                <th className="px-4 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {publishers.map((publisher) => (
                <tr key={publisher.PublisherID} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{publisher.PublisherID}</td>
                  <td className="px-4 py-2">{publisher.PublisherName}</td>
                  <td className="px-4 py-2">{publisher.Address}</td>
                  <td className="px-4 py-2">{publisher.Phone}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button onClick={() => { setEditingPublisher(publisher); setFormData(publisher); setIsOpen(true); }} className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(publisher.PublisherID)} className="p-1 text-red-500 hover:bg-red-50 rounded">
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
              <h3 className="text-lg font-semibold">{editingPublisher ? 'Chỉnh sửa Nhà Xuất Bản' : 'Thêm Nhà Xuất Bản'}</h3>
              <button onClick={() => { setIsOpen(false); setErrorMessage(''); }} className="text-gray-500 hover:text-gray-800">
                <X />
              </button>
            </div>
            {/* Hiển thị thông báo lỗi từ backend */}
            {errorMessage && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mt-4">{errorMessage}</div>
            )}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Tên nhà xuất bản" value={formData.PublisherName} onChange={(e) => setFormData({ ...formData, PublisherName: e.target.value })} required />
              <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Địa chỉ" value={formData.Address} onChange={(e) => setFormData({ ...formData, Address: e.target.value })} required />
              <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Số điện thoại" value={formData.Phone} onChange={(e) => setFormData({ ...formData, Phone: e.target.value })} required />
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

export default AdminPublisher;
