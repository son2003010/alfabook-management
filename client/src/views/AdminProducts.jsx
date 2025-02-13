import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]); // Lưu danh sách sản phẩm
  const [categories, setCategories] = useState([]); // Lưu danh mục sách
  const [publishers, setPublishers] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(''); // Danh mục được chọn
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    bookId: "",
    title: "",
    categoryId: "",
    publisherId: "",
    price: "",
    quantity: "",
    description: "",
    image: "",
    promotionId: "",
    authorIds: [],
  });
  const booksPerPage = 10; // Hiển thị 10 sản phẩm mỗi trang

  // Fetch danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/category');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Lỗi khi lấy danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch sản phẩm theo danh mục và trang
  useEffect(() => {
    if (!selectedCategory) return;
  
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/get-book-by-category/${selectedCategory}?page=${currentPage}&pageSize=${booksPerPage}`);
        if (!response.ok) throw new Error('Không thể lấy dữ liệu sản phẩm.');
        const data = await response.json();
  
        // Lấy thông tin chi tiết của từng sách
        const productsWithDetails = await Promise.all(
          data.books.map(async (book) => {
            try {
              const detailsRes = await fetch(`/api/get-book/${book.BookID}`);
              const detailsData = await detailsRes.json();
              return {
                ...book,
                publisherName: detailsData.PublisherName || "Không có",
                authorNames: detailsData.AuthorName || "Không có",
              };
            } catch (error) {
              console.error(`Lỗi khi lấy chi tiết sách ID ${book.BookID}:`, error);
              return book;
            }
          })
        );
  
        setProducts(productsWithDetails);
        setTotalPages(Math.ceil(data.total / booksPerPage));
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, [selectedCategory, currentPage]);
  


  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  // Xử lý nhập danh sách tác giả
  const handleAuthorChange = (e) => {
    const selectedAuthors = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    setNewProduct({ ...newProduct, authorIds: selectedAuthors });
  };

  // Xử lý thêm sản phẩm
  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Kiểm tra dữ liệu bắt buộc
    if (!newProduct.title || !newProduct.price || !newProduct.categoryId || !newProduct.publisherId) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const response = await fetch("/api/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Thêm sản phẩm thành công!");
        setProducts([...products, data.product]); // Cập nhật danh sách
        setIsModalOpen(false); // Đóng modal
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm:", err);
    }
  };
  const getBookImage = (imageName) => {
    try {
      return require(`../assets/${imageName}`);
    } catch (err) {
      console.error("Error loading image:", err);
    }
  };
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  
  const handleRemoveImage = () => {
    setPreviewImage(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Bộ lọc danh mục */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select 
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1); // Reset về trang đầu tiên khi đổi danh mục
          }}
        >
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category.CategoryID} value={category.CategoryID}>
              {category.CategoryName}
            </option>
          ))}
        </select>
      </div>

      {/* Hiển thị lỗi hoặc loading */}
      {error && <p className="text-red-500">{error}</p>}
      {loading && <p className="text-gray-500">Đang tải dữ liệu...</p>}

      {/* Bảng sản phẩm */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tên Sách</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nhà Xuất Bản</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tác Giả</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kho</th>

              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.BookID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{product.BookID}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.Title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatPrice(product.Price)} VND</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.publisherName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.authorNames}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.Quantity}</td>


                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-blue-600 hover:text-blue-800 mx-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 mx-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  Không có sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
      {/* Modal thêm sản phẩm */}

      {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-[800px]">
          {/* Tiêu đề + Nút đóng */}
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-xl font-bold">Thêm sản phẩm</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
              <X />
            </button>
          </div>

          {/* Form thêm sản phẩm */}
          <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4 mt-4">
            <input type="number" name="bookId" placeholder="Mã sách" className="p-2 border rounded-md" onChange={handleChange} />
            <input type="text" name="title" placeholder="Tên sách" className="p-2 border rounded-md" onChange={handleChange} />
            <input type="number" name="price" placeholder="Giá" className="p-2 border rounded-md" onChange={handleChange} />
            <input type="number" name="quantity" placeholder="Số lượng" className="p-2 border rounded-md" onChange={handleChange} />

            {/* Mô tả rộng hơn */}
            <textarea name="description" placeholder="Mô tả" className="col-span-2 p-2 border rounded-md" onChange={handleChange} />

            {/* Chọn ảnh */}
            <div className="col-span-2">
              <label className="block font-medium">Ảnh sản phẩm</label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                  Chọn ảnh
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {previewImage && (
                  <div className="relative">
                    <img src={previewImage} alt="Ảnh xem trước" className="h-24 w-24 object-cover rounded-md shadow" />
                    <button 
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                    >
                      <X />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Dropdown danh mục & nhà xuất bản */}
            <select name="categoryId" className="p-2 border rounded-md" onChange={handleChange}>
              <option value="">Chọn danh mục</option>
              {categories.map((c) => (
                <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
              ))}
            </select>

            <select name="publisherId" className="p-2 border rounded-md" onChange={handleChange}>
              <option value="">Chọn nhà xuất bản</option>
              <option value="1">Nhà xuất bản Kim Đồng</option>
              <option value="2">Nhà xuất bản Trẻ</option>
              <option value="3">Nhà xuất bản Lao Động</option>
              <option value="4">Nhà xuất bản Tổng hợp thành phố Hồ Chí Minh</option>
              <option value="5">Nhà xuất bản Hội Nhà Văn</option>
            </select>


            <input type="number" name="promotionId" placeholder="Mã khuyến mãi (nếu có)" className="p-2 border rounded-md" onChange={handleChange} />

            {/* Chọn nhiều tác giả */}
            <select multiple name="authorIds" className="col-span-2 p-2 border rounded-md" onChange={handleAuthorChange}>
              <option value="1">Tác giả A</option>
              <option value="2">Tác giả B</option>
              <option value="3">Tác giả C</option>
            </select>

            {/* Nút Thêm sản phẩm */}
            <div className="col-span-2 flex justify-end">
              <button type="submit" className="bg-blue-600 text-white p-2 rounded-md px-6 hover:bg-blue-700 transition">
                Thêm sản phẩm
              </button>
            </div>
          </form>
        </div>
      </div>
    )}



      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            className={`px-4 py-2 bg-gray-200 rounded-lg ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-gray-700">Trang {currentPage} / {totalPages}</span>

          <button
            className={`px-4 py-2 bg-gray-200 rounded-lg ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
