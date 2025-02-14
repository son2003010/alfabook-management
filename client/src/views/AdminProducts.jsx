import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
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

  const booksPerPage = 10;

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

  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const response = await fetch('/api/get-publisher');
        const data = await response.json();
        setPublishers(data);
      } catch (err) {
        console.error('Lỗi khi lấy nhà xuất bản:', err);
      }
    };
    fetchPublishers();
  }, []);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch('/api/get-author');
        const data = await response.json();
        setAuthors(data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách tác giả:', err);
      }
    };
    fetchAuthors();
  }, []);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch('/api/get-promotions');
        const data = await response.json();
        setPromotions(data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách tác giả:', err);
      }
    };
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/get-book-by-category/${selectedCategory}?page=${currentPage}&pageSize=${booksPerPage}`);
        if (!response.ok) throw new Error('Không thể lấy dữ liệu sản phẩm.');
        const data = await response.json();

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

  const handleAuthorChange = (e) => {
    const selectedAuthors = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    setNewProduct({ ...newProduct, authorIds: selectedAuthors });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.title || !newProduct.price || !newProduct.categoryId || !newProduct.publisherId) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const response = await fetch("/api/add-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Thêm sản phẩm thành công!");
        setProducts([...products, data.product]);
        setIsModalOpen(false);
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
      setNewProduct({ ...newProduct, image: file.name });
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setNewProduct({ ...newProduct, image: "" });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          value={selectedCategory}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.CategoryID} value={category.CategoryID}>
              {category.CategoryName}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Sách</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhà Xuất Bản</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác Giả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kho</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.BookID} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.BookID}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.Title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(product.Price)} VND</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.publisherName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.authorNames}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.Quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-800 mx-2 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800 mx-2 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Không có sản phẩm nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-container">
          <div className="modal-content">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold">Thêm sản phẩm</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4 mt-4">
              <input type="text" name="title" placeholder="Tên sách" className="p-2 border rounded-md" onChange={handleChange} />
              <input type="text" name="price" placeholder="Giá" className="p-2 border rounded-md" onChange={handleChange} />
              <input type="number" name="quantity" placeholder="Số lượng" className="p-2 border rounded-md" onChange={handleChange} />
              <textarea name="description" placeholder="Mô tả" className="col-span-2 p-2 border rounded-md" onChange={handleChange} />

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
                      <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition">
                        <X />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <select name="categoryId" className="p-2 border rounded-md" onChange={handleChange}>
                <option value="">Chọn danh mục</option>
                {categories.map((c) => (
                  <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
                ))}
              </select>

              <select name="publisherId" className="p-2 border rounded-md" onChange={handleChange}>
                <option value="">Chọn nhà xuất bản</option>
                {publishers.map((p) => (
                  <option key={p.PublisherID} value={p.PublisherID}>{p.PublisherName}</option>
                ))}
              </select>
              <select name="promotionId" className="p-2 border rounded-md" onChange={handleChange}>
                <option value="">Chọn khuyến mãi</option>
                {promotions.map((promo) => (
                  <option key={promo.PromotionID} value={promo.PromotionID}>{promo.PromotionName}</option>
                ))}
              </select>
              <select multiple name="authorIds" className="col-span-2 p-2 border rounded-md" onChange={handleAuthorChange}>
                {authors.map((a) => (
                  <option key={a.AuthorID} value={a.AuthorID}>{a.AuthorName}</option>
                ))}
              </select>

              <button type="submit" className="bg-blue-600 text-white p-2 rounded-md px-6 hover:bg-blue-700 transition col-span-2">
                Thêm sản phẩm
              </button>
            </form>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            className={`p-2 rounded-lg flex items-center ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 transition-colors'
            } border`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-gray-700">
            Trang {currentPage} / {totalPages}
          </span>

          <button
            className={`p-2 rounded-lg flex items-center ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 transition-colors'
            } border`}
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