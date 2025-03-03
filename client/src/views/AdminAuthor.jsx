import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";

const AdminAuthor = () => {
  const [authors, setAuthors] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    AuthorID: "",
    AuthorName: "",
    Description: "",
  });

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch("/api/get-author");
        if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu");
        const data = await response.json();
        setAuthors(data);
      } catch (error) {
        console.error("Lỗi fetch:", error);
      }
    };

    fetchAuthors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const method = editingAuthor ? "PUT" : "POST";
    const url = editingAuthor
      ? `/api/update-author/${editingAuthor.AuthorID}`
      : "/api/add-author";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json(); // Nhận phản hồi từ backend

      if (!response.ok) {
        setErrorMessage(data.message || "Lỗi không xác định");
        return;
      }

      setAuthors((prev) =>
        editingAuthor
          ? prev.map((a) =>
              a.AuthorID === editingAuthor.AuthorID ? { ...a, ...formData } : a
            )
          : [...prev, { ...formData }]
      );

      setIsOpen(false);
      setEditingAuthor(null);
      setFormData({ AuthorID: "", AuthorName: "", Description: "" });
    } catch (error) {
      setErrorMessage("Lỗi kết nối đến server");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      await fetch(`/api/delete-author/${id}`, { method: "DELETE" });
      setAuthors((prev) => prev.filter((a) => a.AuthorID !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Quản lý Tác Giả</h2>
          <button
            onClick={() => {
              setIsOpen(true);
              setEditingAuthor(null);
              setErrorMessage("");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm Tác Giả
          </button>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Tên</th>
                <th className="px-4 py-2">Chi tiết</th>
                <th className="px-4 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {authors.map((author) => (
                <tr key={author.AuthorID} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{author.AuthorID}</td>
                  <td className="px-4 py-2">{author.AuthorName}</td>
                  <td className="px-4 py-2">{author.Description}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingAuthor(author);
                        setFormData(author);
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

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-semibold">
                {editingAuthor ? "Chỉnh sửa Tác Giả" : "Thêm Tác Giả"}
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setErrorMessage("");
                }}
                className="text-gray-500 hover:text-gray-800"
              >
                <X />
              </button>
            </div>

            {/* Hiển thị thông báo lỗi từ backend */}
            {errorMessage && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mt-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Mã tác giả"
                value={formData.AuthorID}
                onChange={(e) =>
                  setFormData({ ...formData, AuthorID: e.target.value })
                }
                required
                disabled={!!editingAuthor} // Không cho phép sửa AuthorID khi chỉnh sửa
              />
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Tên tác giả"
                value={formData.AuthorName}
                onChange={(e) =>
                  setFormData({ ...formData, AuthorName: e.target.value })
                }
                required
              />
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Mô tả"
                value={formData.Description}
                onChange={(e) =>
                  setFormData({ ...formData, Description: e.target.value })
                }
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-500 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => setIsOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Lưu
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
