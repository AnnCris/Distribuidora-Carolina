import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaArrowUp, 
  FaArrowDown, 
  FaBoxOpen, 
  FaTags, 
  FaTrademark,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import './ProductosModule.css';

const ProductosModule = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estado para ordenamiento
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Estado para modales
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  
  // Estado para formularios
  const [productoForm, setProductoForm] = useState({
    nombre: '',
    descripcion: '', // Asegúrate de incluir la descripción
    categoria: '',
    marca: '',
    distribuidora: 1, // Usa el ID de una distribuidora existente
    peso: '',
    fecha_vencimiento: '',
    imagen_url: ''
  });
    
  const [categoriaForm, setCategoriaForm] = useState({
    nombre: '',
    descripcion: ''
  });
  
  const [marcaForm, setMarcaForm] = useState({
    nombre: '',
    descripcion: '',
    logo_url: ''
  });
  
  const [inventarioForm, setInventarioForm] = useState({
    producto: '',
    stock_actual: 0,
    stock_minimo: 0
  });
  
  // Funciones para cargar datos
  const loadProductos = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/productos/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setProductos(response.data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar productos');
    }
  };
  
  const loadCategorias = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/categorias/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCategorias(response.data);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('Error al cargar categorías');
    }
  };
  
  const loadMarcas = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/marcas/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMarcas(response.data);
    } catch (err) {
      console.error('Error al cargar marcas:', err);
      setError('Error al cargar marcas');
    }
  };
  
  const loadInventario = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/inventario/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setInventario(response.data);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError('Error al cargar inventario');
    }
  };
  
  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadProductos(),
          loadCategorias(),
          loadMarcas(),
          loadInventario()
        ]);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Funciones para paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Función para ordenar datos
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Función para ordenar cualquier lista de objetos
  const sortItems = (items, field, direction) => {
    if (!field) return items;
    
    return [...items].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Manejar campos anidados (por ejemplo, "categoria_nombre")
      if (field.includes('_')) {
        const [parent, child] = field.split('_');
        if (a[parent] && b[parent]) {
          aValue = a[parent][child];
          bValue = b[parent][child];
        }
      }
      
      // Manejar valores nulos o undefined
      if (aValue === null || aValue === undefined) return direction === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return direction === 'asc' ? 1 : -1;
      
      // Ordenar por tipo de dato
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };
  
  // Filtrado y ordenamiento de datos
  const filteredProductos = productos
    .filter(producto => 
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const sortedProducts = sortItems(filteredProductos, sortField, sortDirection);
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  
  const sortedCategorias = sortItems(categorias, sortField, sortDirection);
  const currentCategorias = sortedCategorias.slice(indexOfFirstItem, indexOfLastItem);
  
  const sortedMarcas = sortItems(marcas, sortField, sortDirection);
  const currentMarcas = sortedMarcas.slice(indexOfFirstItem, indexOfLastItem);
  
  const sortedInventario = sortItems(inventario, sortField, sortDirection);
  const currentInventario = sortedInventario.slice(indexOfFirstItem, indexOfLastItem);
  
  // Función para abrir modal
  const openModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    
    if (type.includes('producto') && item) {
      setProductoForm({
        nombre: item.nombre,
        descripcion: item.descripcion,
        categoria: item.categoria,
        marca: item.marca,
        distribuidora: item.distribuidora || 1,
        peso: item.peso,
        fecha_vencimiento: item.fecha_vencimiento ? item.fecha_vencimiento.split('T')[0] : '',
        imagen_url: item.imagen_url || ''
      });
    } else if (type.includes('categoria') && item) {
      setCategoriaForm({
        nombre: item.nombre,
        descripcion: item.descripcion
      });
    } else if (type.includes('marca') && item) {
      setMarcaForm({
        nombre: item.nombre,
        descripcion: item.descripcion,
        logo_url: item.logo_url || ''
      });
    } else if (type.includes('inventario') && item) {
      setInventarioForm({
        producto: item.producto,
        stock_actual: item.stock_actual,
        stock_minimo: item.stock_minimo
      });
    } else {
      // Reset forms para crear nuevos items
      if (type.includes('producto')) {
        setProductoForm({
          nombre: '',
          descripcion: '',
          categoria: '',
          marca: '',
          distribuidora: 1,
          peso: '',
          fecha_vencimiento: '',
          imagen_url: ''
        });
      } else if (type.includes('categoria')) {
        setCategoriaForm({
          nombre: '',
          descripcion: ''
        });
      } else if (type.includes('marca')) {
        setMarcaForm({
          nombre: '',
          descripcion: '',
          logo_url: ''
        });
      }
    }
    
    setShowModal(true);
  };
  
  // Función para cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setCurrentItem(null);
  };
  
  // Manejo de cambios en formularios
  const handleProductoChange = (e) => {
    const { name, value } = e.target;
    setProductoForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCategoriaChange = (e) => {
    const { name, value } = e.target;
    setCategoriaForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleMarcaChange = (e) => {
    const { name, value } = e.target;
    setMarcaForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleInventarioChange = (e) => {
    const { name, value } = e.target;
    setInventarioForm(prev => ({
      ...prev,
      [name]: name === 'producto' ? value : parseInt(value)
    }));
  };
  
  // Funciones para enviar formularios
  const handleSubmitProducto = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      
      // Verificar que todos los campos requeridos estén presentes
      if (!productoForm.nombre || !productoForm.categoria || !productoForm.marca) {
        setError('Por favor complete todos los campos requeridos');
        return;
      }
      
      // Preparar datos para enviar al servidor con conversiones de tipo adecuadas
      const productoData = {
        nombre: productoForm.nombre,
        descripcion: productoForm.descripcion || '',
        categoria: parseInt(productoForm.categoria, 10),
        marca: parseInt(productoForm.marca, 10),
        distribuidora: parseInt(productoForm.distribuidora, 10),
        peso: productoForm.peso || '',
        fecha_vencimiento: productoForm.fecha_vencimiento || null,
        imagen_url: productoForm.imagen_url || ''
      };
      
      console.log('Datos enviados al servidor:', productoData);
      
      if (currentItem) {
        // Actualizar producto existente
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/productos/${currentItem.producto_id}/`,
          productoData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Respuesta del servidor (actualización):', response.data);
      } else {
        // Crear nuevo producto
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/productos/`,
          productoData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Respuesta del servidor (creación):', response.data);
      }
      
      await loadProductos();
      await loadInventario();
      closeModal();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      
      // Mostrar detalles del error para mejor diagnóstico
      if (err.response && err.response.data) {
        console.error('Detalles del error:', err.response.data);
        let errorMessage = 'Error al guardar producto: ';
        
        // Formatear errores del servidor para mostrarlos al usuario
        if (typeof err.response.data === 'object') {
          Object.keys(err.response.data).forEach(key => {
            errorMessage += `${key}: ${err.response.data[key]} `;
          });
        } else {
          errorMessage += err.response.data;
        }
        
        setError(errorMessage);
      } else {
        setError('Error al guardar producto. Por favor, intente nuevamente.');
      }
    }
  };
  
  const handleSubmitCategoria = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      if (currentItem) {
        // Actualizar categoría existente
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/categorias/${currentItem.categoria_id}/`,
          categoriaForm,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        // Crear nueva categoría
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/categorias/`,
          categoriaForm,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      
      await loadCategorias();
      closeModal();
    } catch (err) {
      console.error('Error al guardar categoría:', err);
      setError('Error al guardar categoría');
    }
  };
  
  const handleSubmitMarca = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      if (currentItem) {
        // Actualizar marca existente
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/marcas/${currentItem.marca_id}/`,
          marcaForm,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        // Crear nueva marca
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/marcas/`,
          marcaForm,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      
      await loadMarcas();
      closeModal();
    } catch (err) {
      console.error('Error al guardar marca:', err);
      setError('Error al guardar marca');
    }
  };
  
  const handleSubmitInventario = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      if (currentItem) {
        // Actualizar inventario existente
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/inventario/${currentItem.inventario_id}/`,
          inventarioForm,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      
      await loadInventario();
      closeModal();
    } catch (err) {
      console.error('Error al guardar inventario:', err);
      setError('Error al guardar inventario');
    }
  };
  
  // Función para eliminar items
  const handleDelete = async (type, id) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar este ${type}?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('accessToken');
      
      if (type === 'producto') {
        await axios.delete(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/productos/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        await loadProductos();
        await loadInventario();
      } else if (type === 'categoria') {
        await axios.delete(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/categorias/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        await loadCategorias();
      } else if (type === 'marca') {
        await axios.delete(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/marcas/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        await loadMarcas();
      }
    } catch (err) {
      console.error(`Error al eliminar ${type}:`, err);
      setError(`Error al eliminar ${type}`);
    }
  };
  
  // Función para ajustar inventario
  const handleAjustarStock = async (inventarioId, cantidad) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/productos/inventario/${inventarioId}/ajustar_stock/`,
        { cantidad },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await loadInventario();
    } catch (err) {
      console.error('Error al ajustar stock:', err);
      setError('Error al ajustar stock');
    }
  };
  
  // Renderizar paginación
  const renderPagination = (totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="pagination">
        <button 
          onClick={() => paginate(1)} 
          disabled={currentPage === 1}
          className="pagination-button"
        >
          <FaChevronLeft /> <FaChevronLeft />
        </button>
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
          className="pagination-button"
        >
          <FaChevronLeft />
        </button>
        
        <span className="pagination-info">
          Página {currentPage} de {totalPages}
        </span>
        
        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          <FaChevronRight />
        </button>
        <button 
          onClick={() => paginate(totalPages)} 
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          <FaChevronRight /> <FaChevronRight />
        </button>
        
        <select 
          value={itemsPerPage} 
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="items-per-page"
        >
          <option value={5}>5 por página</option>
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
        </select>
      </div>
    );
  };
  
  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="sort-icon" />;
    return sortDirection === 'asc' ? 
      <FaSortUp className="sort-icon active" /> : 
      <FaSortDown className="sort-icon active" />;
  };
  
  if (loading) {
    return (
      <div className="productos-loading">
        <div className="spinner"></div>
        <p>Cargando módulo de productos...</p>
      </div>
    );
  }
  
  return (
    <div className="productos-module">
      <div className="productos-header">
        <h1>Gestión de Productos</h1>
        <div className="productos-tabs">
          <button 
            className={activeTab === 'productos' ? 'active' : ''} 
            onClick={() => setActiveTab('productos')}
          >
            <FaBoxOpen /> Productos
          </button>
          <button 
            className={activeTab === 'categorias' ? 'active' : ''} 
            onClick={() => setActiveTab('categorias')}
          >
            <FaTags /> Categorías
          </button>
          <button 
            className={activeTab === 'marcas' ? 'active' : ''} 
            onClick={() => setActiveTab('marcas')}
          >
            <FaTrademark /> Marcas
          </button>
          <button 
            className={activeTab === 'inventario' ? 'active' : ''} 
            onClick={() => setActiveTab('inventario')}
          >
            <FaBoxOpen /> Inventario
          </button>
        </div>
      </div>
      
      {activeTab === 'productos' && (
        <div className="productos-content">
          <div className="productos-tools">
            <div className="search-bar">
              <FaSearch />
              <input 
                type="text" 
                placeholder="Buscar productos..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="add-btn"
              onClick={() => openModal('nuevo-producto')}
            >
              <FaPlus /> Nuevo Producto
            </button>
          </div>
          
          <div className="productos-table-container">
            <table className="productos-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('producto_id')}>
                    ID {renderSortIcon('producto_id')}
                  </th>
                  <th onClick={() => handleSort('nombre')}>
                    Nombre {renderSortIcon('nombre')}
                  </th>
                  <th onClick={() => handleSort('categoria_nombre')}>
                    Categoría {renderSortIcon('categoria_nombre')}
                  </th>
                  <th onClick={() => handleSort('marca_nombre')}>
                    Marca {renderSortIcon('marca_nombre')}
                  </th>
                  <th onClick={() => handleSort('peso')}>
                    Peso {renderSortIcon('peso')}
                  </th>
                  <th onClick={() => handleSort('stock_actual')}>
                    Stock {renderSortIcon('stock_actual')}
                  </th>
                  <th onClick={() => handleSort('estado')}>
                    Estado {renderSortIcon('estado')}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length > 0 ? (
                  currentProducts.map(producto => {
                    const inventarioItem = inventario.find(item => item.producto === producto.producto_id);
                    const stockActual = inventarioItem ? inventarioItem.stock_actual : 0;
                    
                    return (
                      <tr key={producto.producto_id}>
                        <td>{producto.producto_id}</td>
                        <td>{producto.nombre}</td>
                        <td>{producto.categoria_nombre}</td>
                        <td>{producto.marca_nombre}</td>
                        <td>{producto.peso}</td>
                        <td>{stockActual}</td>
                        <td>
                          <span className={producto.estado ? 'estado-activo' : 'estado-inactivo'}>
                            {producto.estado ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="acciones">
                          <button 
                            className="edit-btn"
                            onClick={() => openModal('editar-producto', producto)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete('producto', producto.producto_id)}
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">No hay productos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {renderPagination(filteredProductos.length)}
        </div>
      )}
      
      {activeTab === 'categorias' && (
        <div className="productos-content">
          <div className="productos-tools">
            <button 
              className="add-btn"
              onClick={() => openModal('nueva-categoria')}
            >
              <FaPlus /> Nueva Categoría
            </button>
          </div>
          
          <div className="productos-table-container">
            <table className="productos-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('categoria_id')}>
                    ID {renderSortIcon('categoria_id')}
                  </th>
                  <th onClick={() => handleSort('nombre')}>
                    Nombre {renderSortIcon('nombre')}
                  </th>
                  <th onClick={() => handleSort('descripcion')}>
                    Descripción {renderSortIcon('descripcion')}
                  </th>
                  <th onClick={() => handleSort('estado')}>
                    Estado {renderSortIcon('estado')}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentCategorias.length > 0 ? (
                  currentCategorias.map(categoria => (
                    <tr key={categoria.categoria_id}>
                      <td>{categoria.categoria_id}</td>
                      <td>{categoria.nombre}</td>
                      <td>{categoria.descripcion}</td>
                      <td>
                        <span className={categoria.estado ? 'estado-activo' : 'estado-inactivo'}>
                          {categoria.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="acciones">
                        <button 
                          className="edit-btn"
                          onClick={() => openModal('editar-categoria', categoria)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete('categoria', categoria.categoria_id)}
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">No hay categorías disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {renderPagination(categorias.length)}
        </div>
      )}
      
      {activeTab === 'marcas' && (
        <div className="productos-content">
          <div className="productos-tools">
            <button 
              className="add-btn"
              onClick={() => openModal('nueva-marca')}
            >
              <FaPlus /> Nueva Marca
            </button>
          </div>
          
          <div className="productos-table-container">
            <table className="productos-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('marca_id')}>
                    ID {renderSortIcon('marca_id')}
                  </th>
                  <th onClick={() => handleSort('nombre')}>
                    Nombre {renderSortIcon('nombre')}
                  </th>
                  <th onClick={() => handleSort('descripcion')}>
                    Descripción {renderSortIcon('descripcion')}
                  </th>
                  <th>Logo</th>
                  <th onClick={() => handleSort('estado')}>
                    Estado {renderSortIcon('estado')}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentMarcas.length > 0 ? (
                  currentMarcas.map(marca => (
                    <tr key={marca.marca_id}>
                      <td>{marca.marca_id}</td>
                      <td>{marca.nombre}</td>
                      <td>{marca.descripcion}</td>
                      <td>
                        {marca.logo_url && (
                          <img 
                            src={marca.logo_url} 
                            alt={`Logo de ${marca.nombre}`} 
                            className="marca-logo" 
                          />
                        )}
                      </td>
                      <td>
                        <span className={marca.estado ? 'estado-activo' : 'estado-inactivo'}>
                          {marca.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="acciones">
                        <button 
                          className="edit-btn"
                          onClick={() => openModal('editar-marca', marca)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete('marca', marca.marca_id)}
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">No hay marcas disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {renderPagination(marcas.length)}
        </div>
      )}
      
      {activeTab === 'inventario' && (
        <div className="productos-content">
          <div className="productos-table-container">
            <table className="productos-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('inventario_id')}>
                    ID {renderSortIcon('inventario_id')}
                  </th>
                  <th onClick={() => handleSort('producto_nombre')}>
                    Producto {renderSortIcon('producto_nombre')}
                  </th>
                  <th onClick={() => handleSort('stock_actual')}>
                    Stock Actual {renderSortIcon('stock_actual')}
                  </th>
                  <th onClick={() => handleSort('stock_minimo')}>
                    Stock Mínimo {renderSortIcon('stock_minimo')}
                  </th>
                  <th onClick={() => handleSort('ultima_actualizacion')}>
                    Última Actualización {renderSortIcon('ultima_actualizacion')}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentInventario.length > 0 ? (
                  currentInventario.map(item => (
                    <tr key={item.inventario_id} className={item.stock_actual < item.stock_minimo ? 'stock-bajo' : ''}>
                      <td>{item.inventario_id}</td>
                      <td>{item.producto_nombre}</td>
                      <td>{item.stock_actual}</td>
                      <td>{item.stock_minimo}</td>
                      <td>{new Date(item.ultima_actualizacion).toLocaleString()}</td>
                      <td className="acciones">
                        <button 
                          className="edit-btn"
                          onClick={() => openModal('editar-inventario', item)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <div className="stock-buttons">
                          <button 
                            className="stock-up-btn"
                            onClick={() => handleAjustarStock(item.inventario_id, 1)}
                            title="Incrementar stock"
                          >
                            <FaArrowUp />
                          </button>
                          <button 
                            className="stock-down-btn"
                            onClick={() => handleAjustarStock(item.inventario_id, -1)}
                            title="Decrementar stock"
                          >
                            <FaArrowDown />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">No hay inventario disponible</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {renderPagination(inventario.length)}
        </div>
      )}
      
      {/* Modales para Formularios */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{modalType.includes('nuevo') || modalType.includes('nueva') ? 'Crear' : 'Editar'} {modalType.split('-')[1]}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              {modalType.includes('producto') && (
                <form className="form" onSubmit={handleSubmitProducto}>
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre:</label>
                    <input 
                      type="text" 
                      id="nombre" 
                      name="nombre" 
                      value={productoForm.nombre} 
                      onChange={handleProductoChange}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea 
                      id="descripcion" 
                      name="descripcion" 
                      value={productoForm.descripcion} 
                      onChange={handleProductoChange}
                      required 
                      placeholder="Descripción del producto"
                    />
                  </div>
                                    
                  <div className="form-group">
                    <label htmlFor="categoria">Categoría:</label>
                    <select 
                      id="categoria" 
                      name="categoria" 
                      value={productoForm.categoria} 
                      onChange={handleProductoChange}
                      required 
                    >
                      <option value="">Seleccione una categoría</option>
                      {categorias.map(categoria => (
                        <option key={categoria.categoria_id} value={categoria.categoria_id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="marca">Marca:</label>
                    <select 
                      id="marca" 
                      name="marca" 
                      value={productoForm.marca} 
                      onChange={handleProductoChange}
                      required 
                    >
                      <option value="">Seleccione una marca</option>
                      {marcas.map(marca => (
                        <option key={marca.marca_id} value={marca.marca_id}>
                          {marca.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="peso">Peso/Volumen:</label>
                    <input 
                      type="text" 
                      id="peso" 
                      name="peso" 
                      value={productoForm.peso} 
                      onChange={handleProductoChange}
                      required 
                      placeholder="Ej: 500g, 1kg, 250ml"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="fecha_vencimiento">Fecha de Vencimiento:</label>
                    <input 
                      type="date" 
                      id="fecha_vencimiento" 
                      name="fecha_vencimiento" 
                      value={productoForm.fecha_vencimiento} 
                      onChange={handleProductoChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="imagen_url">URL de Imagen:</label>
                    <input 
                      type="text" 
                      id="imagen_url" 
                      name="imagen_url" 
                      value={productoForm.imagen_url || ''} 
                      onChange={handleProductoChange}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  
                  <div className="form-buttons">
                    <button type="submit" className="submit-btn">
                      {modalType.includes('nuevo') ? 'Crear' : 'Actualizar'}
                    </button>
                    <button type="button" className="cancel-btn" onClick={closeModal}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
              
              {modalType.includes('categoria') && (
                <form className="form" onSubmit={handleSubmitCategoria}>
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre:</label>
                    <input 
                      type="text" 
                      id="nombre" 
                      name="nombre" 
                      value={categoriaForm.nombre} 
                      onChange={handleCategoriaChange}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea 
                      id="descripcion" 
                      name="descripcion" 
                      value={categoriaForm.descripcion} 
                      onChange={handleCategoriaChange}
                      required 
                    />
                  </div>
                  
                  <div className="form-buttons">
                    <button type="submit" className="submit-btn">
                      {modalType.includes('nueva') ? 'Crear' : 'Actualizar'}
                    </button>
                    <button type="button" className="cancel-btn" onClick={closeModal}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
              
              {modalType.includes('marca') && (
                <form className="form" onSubmit={handleSubmitMarca}>
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre:</label>
                    <input 
                      type="text" 
                      id="nombre" 
                      name="nombre" 
                      value={marcaForm.nombre} 
                      onChange={handleMarcaChange}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea 
                      id="descripcion" 
                      name="descripcion" 
                      value={marcaForm.descripcion} 
                      onChange={handleMarcaChange}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="logo_url">URL del Logo:</label>
                    <input 
                      type="text" 
                      id="logo_url" 
                      name="logo_url" 
                      value={marcaForm.logo_url || ''} 
                      onChange={handleMarcaChange}
                      placeholder="https://ejemplo.com/logo.png"
                    />
                  </div>
                  
                  <div className="form-buttons">
                    <button type="submit" className="submit-btn">
                      {modalType.includes('nueva') ? 'Crear' : 'Actualizar'}
                    </button>
                    <button type="button" className="cancel-btn" onClick={closeModal}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
              
              {modalType.includes('inventario') && (
                <form className="form" onSubmit={handleSubmitInventario}>
                  <div className="form-group">
                    <label htmlFor="producto">Producto:</label>
                    <input 
                      type="text" 
                      id="producto" 
                      value={
                        productos.find(p => p.producto_id === Number(inventarioForm.producto))?.nombre || ''
                      }
                      disabled
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="stock_actual">Stock Actual:</label>
                    <input 
                      type="number" 
                      id="stock_actual" 
                      name="stock_actual" 
                      value={inventarioForm.stock_actual} 
                      onChange={handleInventarioChange}
                      min="0"
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="stock_minimo">Stock Mínimo:</label>
                    <input 
                      type="number" 
                      id="stock_minimo" 
                      name="stock_minimo" 
                      value={inventarioForm.stock_minimo} 
                      onChange={handleInventarioChange}
                      min="0"
                      required 
                    />
                  </div>
                  
                  <div className="form-buttons">
                    <button type="submit" className="submit-btn">
                      Actualizar
                    </button>
                    <button type="button" className="cancel-btn" onClick={closeModal}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosModule;