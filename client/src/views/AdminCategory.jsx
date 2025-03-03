import React, { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";

const AdminCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    categoryName: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category");
        if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi fetch:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = "/api/add-category";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName: formData.categoryName }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Lỗi không xác định");
        return;
      }

      setCategories((prev) => [...prev, {
        CategoryID: data.categoryId,
        CategoryName: formData.categoryName
      }]);

      setIsOpen(false);
      setFormData({ categoryName: "" });
    } catch (error) {
      setErrorMessage("Lỗi kết nối đến server");
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      await fetch(`/api/delete-category/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((p) => p.CategoryID !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Quản lý Danh Mục</h2>
          <button
            onClick={() => {
              setIsOpen(true);
              setErrorMessage("");
              setFormData({ categoryName: "" });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm Danh Mục
          </button>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Tên Danh Mục</th>
                <th className="px-4 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((category) => (
                <tr key={category.CategoryID} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{category.CategoryID}</td>
                  <td className="px-4 py-2">{category.CategoryName}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(category.CategoryID)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="Xóa"
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
              <h3 className="text-lg font-semibold">Thêm Danh Mục</h3>
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
                placeholder="Tên danh mục"
                value={formData.categoryName}
                onChange={(e) =>
                  setFormData({ ...formData, categoryName: e.target.value })
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

export default AdminCategory;