import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaTh,
  FaList,
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaEye,
  FaChevronDown,
  FaTags,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";
import "./ProductosCliente.css";

const ProductosCliente = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedMarca, setSelectedMarca] = useState("todas");
  const [sortBy, setSortBy] = useState("nombre");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Estado para favoritos (simulado - en producción vendría de la base de datos)
  const [favoritos, setFavoritos] = useState([]);

  // Estado para el modal de producto
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchProductos();
    fetchCategorias();
    fetchMarcas();
  }, []);

  const fetchProductos = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/productos/productos/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Filtrar solo productos activos
      setProductos(response.data.filter(producto => producto.estado));
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("Error al cargar productos");
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/productos/categorias/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategorias(response.data.filter(categoria => categoria.estado));
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const fetchMarcas = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/productos/marcas/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMarcas(response.data.filter(marca => marca.estado));
    } catch (err) {
      console.error("Error al cargar marcas:", err);
    }
  };

  // Función para filtrar productos
  const filteredProducts = productos.filter((producto) => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "todas" || 
      producto.categoria.toString() === selectedCategory;
    
    const matchesMarca = selectedMarca === "todas" || 
      producto.marca.toString() === selectedMarca;

    return matchesSearch && matchesCategory && matchesMarca;
  });

  // Función para ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "nombre":
        return a.nombre.localeCompare(b.nombre);
      case "precio_asc":
        return a.precio - b.precio; // Asumiendo que tendrás precio
      case "precio_desc":
        return b.precio - a.precio;
      case "categoria":
        return a.categoria_nombre.localeCompare(b.categoria_nombre);
      default:
        return 0;
    }
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  // Función para manejar favoritos
  const toggleFavorito = (productId) => {
    setFavoritos(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    setSuccessMessage(
      favoritos.includes(productId) 
        ? "Producto removido de favoritos" 
        : "Producto agregado a favoritos"
    );
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  // Función para ver detalles del producto
  const verDetalles = (producto) => {
    setSelectedProduct(producto);
    setShowProductModal(true);
  };

  // Función para agregar al carrito (simulada)
  const agregarAlCarrito = (producto) => {
    setSuccessMessage(`${producto.nombre} agregado al carrito`);
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  // Render de tarjeta de producto
  const renderProductCard = (producto) => (
    <div key={producto.producto_id} className="client-product-card">
      <div className="client-product-image-container">
        {producto.imagen_url ? (
          <img 
            src={producto.imagen_url} 
            alt={producto.nombre}
            className="client-product-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="client-product-placeholder" style={{display: producto.imagen_url ? 'none' : 'flex'}}>
          🧀
        </div>
        
        <div className="client-product-overlay">
          <button 
            className="client-overlay-btn client-view-btn"
            onClick={() => verDetalles(producto)}
            title="Ver detalles"
          >
            <FaEye />
          </button>
          <button 
            className={`client-overlay-btn client-favorite-btn ${favoritos.includes(producto.producto_id) ? 'active' : ''}`}
            onClick={() => toggleFavorito(producto.producto_id)}
            title={favoritos.includes(producto.producto_id) ? "Remover de favoritos" : "Agregar a favoritos"}
          >
            {favoritos.includes(producto.producto_id) ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        <div className="client-product-badges">
          <span className="client-category-badge">{producto.categoria_nombre}</span>
        </div>
      </div>

      <div className="client-product-content">
        <div className="client-product-header">
          <h3 className="client-product-name">{producto.nombre}</h3>
          <div className="client-product-rating">
            <FaStar className="star filled" />
            <FaStar className="star filled" />
            <FaStar className="star filled" />
            <FaStar className="star filled" />
            <FaRegStar className="star" />
            <span className="rating-text">(4.0)</span>
          </div>
        </div>

        <p className="client-product-description">{producto.descripcion}</p>

        <div className="client-product-details">
          <div className="client-product-detail">
            <span className="detail-label">Marca:</span>
            <span className="detail-value">{producto.marca_nombre}</span>
          </div>
          <div className="client-product-detail">
            <span className="detail-label">Peso:</span>
            <span className="detail-value">{producto.peso}</span>
          </div>
        </div>

        <div className="client-product-footer">
          <div className="client-product-price">
            <span className="price">Bs. 25.00</span>
            <span className="price-unit">/ {producto.peso}</span>
          </div>
          <button 
            className="client-add-to-cart-btn"
            onClick={() => agregarAlCarrito(producto)}
          >
            <FaShoppingCart /> Agregar
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="client-products-loading">
        <div className="client-loading-spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="client-products-container">
      {/* Header de productos */}
      <div className="client-products-header">
        <div className="client-products-title-section">
          <h1>Nuestros Productos</h1>
          <p>Descubre nuestra selección de quesos y productos lácteos de calidad</p>
        </div>
      </div>

      {/* Herramientas de filtrado y búsqueda */}
      <div className="client-products-tools">
        <div className="client-search-filter-section">
          <div className="client-search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="client-filter-dropdown">
            <button
              className="client-filter-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> Filtros <FaChevronDown />
            </button>
            {showFilters && (
              <div className="client-filter-menu">
                <div className="client-filter-group">
                  <label>Categoría:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="todas">Todas las categorías</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.categoria_id} value={categoria.categoria_id.toString()}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="client-filter-group">
                  <label>Marca:</label>
                  <select
                    value={selectedMarca}
                    onChange={(e) => setSelectedMarca(e.target.value)}
                  >
                    <option value="todas">Todas las marcas</option>
                    {marcas.map((marca) => (
                      <option key={marca.marca_id} value={marca.marca_id.toString()}>
                        {marca.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="client-filter-group">
                  <label>Ordenar por:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="nombre">Nombre</option>
                    <option value="categoria">Categoría</option>
                    <option value="precio_asc">Precio: Menor a Mayor</option>
                    <option value="precio_desc">Precio: Mayor a Menor</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="client-view-toggle">
          <button
            className={`client-view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <FaTh /> Cuadrícula
          </button>
          <button
            className={`client-view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <FaList /> Lista
          </button>
        </div>
      </div>

      {/* Grid de productos */}
      <div className={`client-products-grid ${viewMode}`}>
        {currentProducts.length > 0 ? (
          currentProducts.map(renderProductCard)
        ) : (
          <div className="client-no-products">
            <div className="client-no-products-icon">🔍</div>
            <h3>No se encontraron productos</h3>
            <p>Intenta ajustar tus filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="client-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="client-pagination-btn"
          >
            Anterior
          </button>
          
          <div className="client-pagination-info">
            Página {currentPage} de {totalPages}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="client-pagination-btn"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de detalles del producto */}
      {showProductModal && selectedProduct && (
        <div className="client-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="client-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="client-modal-header">
              <h2>{selectedProduct.nombre}</h2>
              <button 
                className="client-modal-close"
                onClick={() => setShowProductModal(false)}
              >
                ×
              </button>
            </div>
            <div className="client-modal-body">
              <div className="client-modal-product-image">
                {selectedProduct.imagen_url ? (
                  <img src={selectedProduct.imagen_url} alt={selectedProduct.nombre} />
                ) : (
                  <div className="client-modal-placeholder">🧀</div>
                )}
              </div>
              <div className="client-modal-product-info">
                <p className="client-modal-description">{selectedProduct.descripcion}</p>
                <div className="client-modal-details">
                  <div className="client-modal-detail">
                    <strong>Categoría:</strong> {selectedProduct.categoria_nombre}
                  </div>
                  <div className="client-modal-detail">
                    <strong>Marca:</strong> {selectedProduct.marca_nombre}
                  </div>
                  <div className="client-modal-detail">
                    <strong>Peso:</strong> {selectedProduct.peso}
                  </div>
                  {selectedProduct.fecha_vencimiento && (
                    <div className="client-modal-detail">
                      <strong>Fecha de vencimiento:</strong> {new Date(selectedProduct.fecha_vencimiento).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="client-modal-actions">
                  <button 
                    className="client-modal-add-cart"
                    onClick={() => {
                      agregarAlCarrito(selectedProduct);
                      setShowProductModal(false);
                    }}
                  >
                    <FaShoppingCart /> Agregar al Carrito
                  </button>
                  <button 
                    className={`client-modal-favorite ${favoritos.includes(selectedProduct.producto_id) ? 'active' : ''}`}
                    onClick={() => toggleFavorito(selectedProduct.producto_id)}
                  >
                    {favoritos.includes(selectedProduct.producto_id) ? <FaHeart /> : <FaRegHeart />}
                    {favoritos.includes(selectedProduct.producto_id) ? 'En Favoritos' : 'Agregar a Favoritos'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes */}
      {error && (
        <div className="client-error-message">
          <p>{error}</p>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="client-success-message">
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage("")}>×</button>
        </div>
      )}
    </div>
  );
};

export default ProductosCliente;