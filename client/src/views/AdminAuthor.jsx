import React, { useState,useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminAuthor = () => {
    const [authors, setAuthors] = useState([])
    const [isOpen, setIsOpen] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState(null);
    const [formData, setFormData] = useState({
        AuthorID: '',
        AuthorName: '',
        Description: '',
    });
    useEffect(() => {
        const fetchAuthors = async () => {
        try {
            const response = await fetch('/api/get-author');
            if (!response.ok) {
            throw new Error('Lỗi khi lấy dữ liệu');
            }
            const data = await response.json();
            setAuthors(data);
        } catch (error) {
            console.error('Lỗi fetch:', error);
        }
        };

        fetchAuthors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingAuthor ? 'PUT' : 'POST';
        const url = editingAuthor
          ? `/api/update-author/${editingAuthor.AuthorID}`
          : '/api/add-author';
    
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
    
        if (response.ok) {
          const data = await response.json();
          if (editingAuthor) {
            // Cập nhật state khi sửa
            setAuthors(authors.map(aut => 
              aut.AuthorID === editingAuthor.AuthorID ? { ...aut, ...formData } : aut
            ));
          } else {
            // Thêm mới vào danh sách với ID từ backend
            setAuthors([...authors, { ...formData, AuthorID: data.id }]);
          }
          setIsOpen(false);
          setEditingAuthor(null);
          setFormData({ AuthorID: '', AuthorName: '', Description: '' });
        } else {
          const errorData = await response.json();
          alert(errorData.message); // Hiển thị lỗi nếu AuthorID đã tồn tại
        }
    };
    

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa?')) {
        await fetch(`/api/delete-author/${id}`, { method: 'DELETE' });
        setAuthors(authors.filter(a => a.AuthorID !== id));
        }
    };

    return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Quản lý Tác Giả</h2>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Thêm Tác Giả
          </button>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Author ID</th>
                  <th className="px-4 py-2 text-left">Tên tác giả</th>
                  <th className="px-4 py-2 text-left">Chi tiết</th>
                  <th className="px-4 py-2 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((author) => (
                  <tr key={author.AuthorID} className="border-t">
                    <td className="px-4 py-2">{author.AuthorID}</td>
                    <td className="px-4 py-2">{author.AuthorName}</td>
                    <td className="px-4 py-2">{author.Description}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => {
                            setEditingAuthor(author);
                            setFormData({
                              AuthorID: author.AuthorID,
                              AuthorName: author.AuthorName,
                              Description: author.Description,
                            });
                            setIsOpen(true);
                          }}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(author.AuthorID)}
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
                {editingAuthor ? 'Chỉnh sửa Tác Giả' : 'Thêm Tác Giả Mới'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-4 space-y-4">
              <div>
                  <label className="block text-sm font-medium mb-1">Mã tác giả</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.AuthorID}
                    onChange={(e) => setFormData({...formData, AuthorID: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tên tác giả</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.AuthorName}
                    onChange={(e) => setFormData({...formData, AuthorName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Chi Tiết</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.Description}
                    onChange={(e) => setFormData({...formData, Description: e.target.value})}
                    required
                  />
                </div>
                
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setEditingAuthor(null);
                    setFormData({ AuthorID: '', AuthorName: '', Description: '' });
                  }}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingAuthor ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuthor;