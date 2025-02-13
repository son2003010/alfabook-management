import React, { useState, useEffect  } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminPublisher = () => {
  const [publishers, setPublishers] = useState([])
  const [isOpen, setIsOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [formData, setFormData] = useState({
    PublisherName: '',
    Address: '',
    Phone: '',
  });
  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const response = await fetch('/api/get-publisher');
        if (!response.ok) {
          throw new Error('Lỗi khi lấy dữ liệu');
        }
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

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const data = await response.json();
      if (editingPublisher) {
        // Cập nhật dữ liệu trong state
        setPublishers(publishers.map(pub => 
          pub.PublisherID === editingPublisher.PublisherID ? { ...pub, ...formData } : pub
        ));
      } else {
        // Thêm mới vào danh sách
        setPublishers([...publishers, { ...formData, PublisherID: data.id }]);
      }
      setIsOpen(false);
      setEditingPublisher(null);
      setFormData({ PublisherName: '', Address: '', Phone: '' });
    } else {
      console.error('Lỗi:', await response.json());
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa?')) {
      await fetch(`/api/delete-publisher/${id}`, { method: 'DELETE' });
      setPublishers(publishers.filter(p => p.PublisherID !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Quản lý Nhà Xuất Bản</h2>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Thêm Nhà Xuất Bản
          </button>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Publisher ID</th>
                  <th className="px-4 py-2 text-left">Tên nhà xuất bản</th>
                  <th className="px-4 py-2 text-left">Địa chỉ</th>
                  <th className="px-4 py-2 text-left">Số điện thoại</th>
                  <th className="px-4 py-2 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {publishers.map((publisher) => (
                  <tr key={publisher.id} className="border-t">
                    <td className="px-4 py-2">{publisher.PublisherID}</td>
                    <td className="px-4 py-2">{publisher.PublisherName}</td>
                    <td className="px-4 py-2">{publisher.Address}</td>
                    <td className="px-4 py-2">{publisher.Phone}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => {
                            setEditingPublisher(publisher);
                            setFormData({
                              PublisherName: publisher.PublisherName,
                              Address: publisher.Address,
                              Phone: publisher.Phone
                            });
                            setIsOpen(true);
                          }}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(publisher.PublisherID)}
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
                {editingPublisher ? 'Chỉnh sửa Nhà Xuất Bản' : 'Thêm Nhà Xuất Bản Mới'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên nhà xuất bản</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.PublisherName}
                    onChange={(e) => setFormData({...formData, PublisherName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.Address}
                    onChange={(e) => setFormData({...formData, Address: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.Phone}
                    onChange={(e) => setFormData({...formData, Phone: e.target.value})}
                    required
                  />
                </div>
               
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setEditingPublisher(null);
                    setFormData({ PublisherName: '', Address: '', Phone: '' });
                  }}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingPublisher ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPublisher;