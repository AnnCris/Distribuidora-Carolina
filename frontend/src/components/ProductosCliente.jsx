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
  FaTimes,
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

  // Cerrar filtros al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilters && !event.target.closest('.client-filter-dropdown')) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showProductModal) {
        cerrarModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showProductModal]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showProductModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup al desmontar el componente
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showProductModal]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedMarca, sortBy]);

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
      setError("Error al cargar productos. Por favor, intenta nuevamente.");
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
        return (a.precio || 25) - (b.precio || 25); // Precio por defecto si no existe
      case "precio_desc":
        return (b.precio || 25) - (a.precio || 25);
      case "categoria":
        return a.categoria_nombre?.localeCompare(b.categoria_nombre) || 0;
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
    
    const isFavorite = favoritos.includes(productId);
    setSuccessMessage(
      isFavorite 
        ? "Producto removido de favoritos" 
        : "Producto agregado a favoritos"
    );
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Función para ver detalles del producto
  const verDetalles = (producto) => {
    console.log('Abriendo modal para:', producto); // Debug
    setSelectedProduct(producto);
    setShowProductModal(true);
  };

  // Función para cerrar modal
  const cerrarModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Función para agregar al carrito (simulada)
  const agregarAlCarrito = (producto) => {
    setSuccessMessage(`${producto.nombre} agregado al carrito`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setSearchTerm("");
    setSelectedCategory("todas");
    setSelectedMarca("todas");
    setSortBy("nombre");
    setShowFilters(false);
  };

  // Función para truncar texto
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Render de tarjeta de producto mejorada
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
          <h3 className="client-product-name" title={producto.nombre}>
            {producto.nombre}
          </h3>
          <div className="client-product-rating">
            <FaStar className="star filled" />
            <FaStar className="star filled" />
            <FaStar className="star filled" />
            <FaStar className="star filled" />
            <FaRegStar className="star" />
            <span className="rating-text">(4.0)</span>
          </div>
        </div>

        <p className="client-product-description" title={producto.descripcion}>
          {producto.descripcion}
        </p>

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
            <span className="price">Bs. {producto.precio || '25.00'}</span>
            <span className="price-unit">/ {producto.peso}</span>
          </div>
          <button 
            className="client-add-to-cart-btn"
            onClick={() => agregarAlCarrito(producto)}
            title={`Agregar ${producto.nombre} al carrito`}
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
              <FaFilter /> Filtros <FaChevronDown style={{transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease'}} />
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
                    <option value="nombre">Nombre A-Z</option>
                    <option value="categoria">Categoría</option>
                    <option value="precio_asc">Precio: Menor a Mayor</option>
                    <option value="precio_desc">Precio: Mayor a Menor</option>
                  </select>
                </div>
                <button 
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '15px',
                    backgroundColor: '#f0f0f0',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#666'
                  }}
                  onClick={limpiarFiltros}
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="client-view-toggle">
          <button
            className={`client-view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Vista en cuadrícula"
          >
            <FaTh /> Cuadrícula
          </button>
          <button
            className={`client-view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="Vista en lista"
          >
            <FaList /> Lista
          </button>
        </div>
      </div>

      {/* Indicador de resultados */}
      {(searchTerm || selectedCategory !== "todas" || selectedMarca !== "todas") && (
        <div style={{
          marginBottom: '20px',
          padding: '15px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{color: '#666', fontWeight: '600'}}>
            {sortedProducts.length} producto{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
          </span>
          <button 
            onClick={limpiarFiltros}
            style={{
              background: 'none',
              border: '1px solid #e9424f',
              color: '#e9424f',
              padding: '8px 15px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <FaTimes size={12} /> Limpiar
          </button>
        </div>
      )}

      {/* Grid de productos */}
      <div className={`client-products-grid ${viewMode}`}>
        {currentProducts.length > 0 ? (
          currentProducts.map(renderProductCard)
        ) : (
          <div className="client-no-products">
            <div className="client-no-products-icon">🔍</div>
            <h3>No se encontraron productos</h3>
            <p>Intenta ajustar tus filtros de búsqueda o explorar otras categorías</p>
            <button 
              onClick={limpiarFiltros}
              style={{
                marginTop: '20px',
                padding: '12px 25px',
                backgroundColor: '#e9424f',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Ver todos los productos
            </button>
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
        <div className="client-modal-overlay" onClick={cerrarModal}>
          <div className="client-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="client-modal-header">
              <h2>{selectedProduct.nombre}</h2>
              <button 
                className="client-modal-close"
                onClick={cerrarModal}
                title="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="client-modal-body">
              <div className="client-modal-product-image">
                {selectedProduct.imagen_url ? (
                  <img 
                    src={selectedProduct.imagen_url} 
                    alt={selectedProduct.nombre}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="client-modal-placeholder" 
                  style={{display: selectedProduct.imagen_url ? 'none' : 'flex'}}
                >
                  🧀
                </div>
              </div>
              <div className="client-modal-product-info">
                <p className="client-modal-description">
                  {selectedProduct.descripcion || 'Sin descripción disponible'}
                </p>
                <div className="client-modal-details">
                  <div className="client-modal-detail">
                    <strong>Categoría:</strong> 
                    <span>{selectedProduct.categoria_nombre || 'No especificada'}</span>
                  </div>
                  <div className="client-modal-detail">
                    <strong>Marca:</strong> 
                    <span>{selectedProduct.marca_nombre || 'No especificada'}</span>
                  </div>
                  <div className="client-modal-detail">
                    <strong>Peso:</strong> 
                    <span>{selectedProduct.peso || 'No especificado'}</span>
                  </div>
                  <div className="client-modal-detail">
                    <strong>Precio:</strong> 
                    <span>Bs. {selectedProduct.precio || '25.00'}</span>
                  </div>
                  {selectedProduct.fecha_vencimiento && (
                    <div className="client-modal-detail">
                      <strong>Fecha de vencimiento:</strong> 
                      <span>{new Date(selectedProduct.fecha_vencimiento).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                  {selectedProduct.stock && (
                    <div className="client-modal-detail">
                      <strong>Stock disponible:</strong> 
                      <span>{selectedProduct.stock} unidades</span>
                    </div>
                  )}
                </div>
                <div className="client-modal-actions">
                  <button 
                    className="client-modal-add-cart"
                    onClick={() => {
                      agregarAlCarrito(selectedProduct);
                      cerrarModal();
                    }}
                  >
                    <FaShoppingCart /> Agregar al Carrito
                  </button>
                  <button 
                    className={`client-modal-favorite ${favoritos.includes(selectedProduct.producto_id) ? 'active' : ''}`}
                    onClick={() => toggleFavorito(selectedProduct.producto_id)}
                  >
                    {favoritos.includes(selectedProduct.producto_id) ? <FaHeart /> : <FaRegHeart />}
                    {favoritos.includes(selectedProduct.producto_id) ? 'En Favoritos' : 'Favoritos'}
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