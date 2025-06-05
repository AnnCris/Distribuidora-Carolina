import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  FaSortDown,
  FaCalendarAlt,
  FaFilter,
  FaTh,
  FaList,
  FaChevronDown,
  FaQuestionCircle,
  FaImage,
  FaTimes,
} from "react-icons/fa";
import "./ProductosModule.css";

const ProductosModule = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("productos");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Vista de productos (grid o tabla)
  const [viewMode, setViewMode] = useState("grid");

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estado para ordenamiento
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  // Estado para filtros adicionales
  const [filters, setFilters] = useState({
    estado: "todos",
    categoria: "todas",
    stockMinimo: false,
  });

  // Estado para modales
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentItem, setCurrentItem] = useState(null);

  // Estado para ver filtros
  const [showFilters, setShowFilters] = useState(false);

  // Estados para preview de imágenes
  const [imagePreview, setImagePreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Estado para formularios
  const [productoForm, setProductoForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    marca: "",
    distribuidora: 1,
    peso: "",
    fecha_vencimiento: "",
    imagen: null,
    estado: true,
  });

  const [categoriaForm, setCategoriaForm] = useState({
    nombre: "",
    descripcion: "",
    estado: true,
  });

  const [marcaForm, setMarcaForm] = useState({
    nombre: "",
    descripcion: "",
    logo: null,
    estado: true,
  });

  const [inventarioForm, setInventarioForm] = useState({
    producto: "",
    stock_actual: 0,
    stock_minimo: 0,
  });

  // Funciones para cargar datos
  const loadProductos = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:8000"
        }/api/productos/productos/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProductos(response.data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("Error al cargar productos");
    }
  };

  const loadCategorias = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:8000"
        }/api/productos/categorias/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategorias(response.data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setError("Error al cargar categorías");
    }
  };

  const loadMarcas = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:8000"
        }/api/productos/marcas/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMarcas(response.data);
    } catch (err) {
      console.error("Error al cargar marcas:", err);
      setError("Error al cargar marcas");
    }
  };

  const loadInventario = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:8000"
        }/api/productos/inventario/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInventario(response.data);
    } catch (err) {
      console.error("Error al cargar inventario:", err);
      setError("Error al cargar inventario");
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
          loadInventario(),
        ]);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar datos");
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
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Función para ordenar cualquier lista de objetos
  const sortItems = (items, field, direction) => {
    if (!field) return items;

    return [...items].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // Manejar campos anidados (por ejemplo, "categoria_nombre")
      if (field.includes("_")) {
        const [parent, child] = field.split("_");
        if (a[parent] && b[parent]) {
          aValue = a[parent][child];
          bValue = b[parent][child];
        }
      }

      // Manejar valores nulos o undefined
      if (aValue === null || aValue === undefined)
        return direction === "asc" ? -1 : 1;
      if (bValue === null || bValue === undefined)
        return direction === "asc" ? 1 : -1;

      // Ordenar por tipo de dato
      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return direction === "asc" ? aValue - bValue : bValue - aValue;
    });
  };

  // Filtrado con filtros adicionales
  const applyFilters = (items) => {
    return items.filter((item) => {
      // Filtro de búsqueda por texto
      const matchesSearch =
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.descripcion &&
          item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro por estado
      const matchesEstado = 
        filters.estado === 'todos' || 
        (filters.estado === 'activo' && item.estado) ||
        (filters.estado === 'inactivo' && !item.estado);

      // Filtro por categoría
      const matchesCategoria =
        filters.categoria === "todas" ||
        item.categoria.toString() === filters.categoria;

      // Filtro por stock bajo
      const inventarioItem = inventario.find(
        (inv) => inv.producto === item.producto_id
      );
      const stockBajo = inventarioItem
        ? inventarioItem.stock_actual < inventarioItem.stock_minimo
        : false;

      const matchesStockMinimo =
        !filters.stockMinimo || (filters.stockMinimo && stockBajo);

      return matchesSearch && matchesEstado && matchesCategoria && matchesStockMinimo;
    });
  };

  // Aplicar filtros y ordenar
  const filteredProductos = applyFilters(productos);
  const sortedProducts = sortItems(filteredProductos, sortField, sortDirection);
  const currentProducts = sortedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Filtrado para categorías
  const filteredCategorias = categorias.filter(categoria => {
    const matchesSearch = searchTerm === '' || 
      categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (categoria.descripcion && categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEstado = 
      filters.estado === 'todos' || 
      (filters.estado === 'activo' && categoria.estado) ||
      (filters.estado === 'inactivo' && !categoria.estado);
      
    return matchesSearch && matchesEstado;
  });

  // Filtrado para marcas
  const filteredMarcas = marcas.filter(marca => {
    const matchesSearch = searchTerm === '' || 
      marca.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (marca.descripcion && marca.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEstado = 
      filters.estado === 'todos' || 
      (filters.estado === 'activo' && marca.estado) ||
      (filters.estado === 'inactivo' && !marca.estado);
      
    return matchesSearch && matchesEstado;
  });

  // Filtrar y ordenar categorías
  const sortedCategorias = sortItems(filteredCategorias, sortField, sortDirection);
  const currentCategorias = sortedCategorias.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Filtrar y ordenar marcas
  const sortedMarcas = sortItems(filteredMarcas, sortField, sortDirection);
  const currentMarcas = sortedMarcas.slice(indexOfFirstItem, indexOfLastItem);

  // Filtrar y ordenar inventario
  const sortedInventario = sortItems(inventario, sortField, sortDirection);
  const currentInventario = sortedInventario.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Función para manejar archivos
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño del archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("El archivo no puede ser mayor a 5MB");
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError("Tipo de archivo no permitido. Use JPG, PNG, GIF o WebP");
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'imagen') {
          setImagePreview(e.target.result);
          setProductoForm(prev => ({ ...prev, imagen: file }));
        } else if (type === 'logo') {
          setLogoPreview(e.target.result);
          setMarcaForm(prev => ({ ...prev, logo: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para remover imagen
  const removeImage = (type) => {
    if (type === 'imagen') {
      setImagePreview(null);
      setProductoForm(prev => ({ ...prev, imagen: null }));
    } else if (type === 'logo') {
      setLogoPreview(null);
      setMarcaForm(prev => ({ ...prev, logo: null }));
    }
  };

  // Función para abrir modal
  const openModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);

    if (type.includes("producto") && item) {
      setProductoForm({
        nombre: item.nombre,
        descripcion: item.descripcion,
        categoria: item.categoria,
        marca: item.marca,
        distribuidora: item.distribuidora || 1,
        peso: item.peso,
        fecha_vencimiento: item.fecha_vencimiento
          ? item.fecha_vencimiento.split("T")[0]
          : "",
        imagen: null,
        estado: item.estado,
      });
      // Mostrar imagen actual si existe
      setImagePreview(item.imagen_url || null);
    } else if (type.includes("categoria") && item) {
      setCategoriaForm({
        nombre: item.nombre,
        descripcion: item.descripcion,
        estado: item.estado,
      });
    } else if (type.includes("marca") && item) {
      setMarcaForm({
        nombre: item.nombre,
        descripcion: item.descripcion,
        logo: null,
        estado: item.estado,
      });
      // Mostrar logo actual si existe
      setLogoPreview(item.logo_url || null);
    } else if (type.includes("inventario") && item) {
      setInventarioForm({
        producto: item.producto,
        stock_actual: item.stock_actual,
        stock_minimo: item.stock_minimo,
      });
    } else {
      // Reset forms para crear nuevos items
      if (type.includes("producto")) {
        setProductoForm({
          nombre: "",
          descripcion: "",
          categoria: "",
          marca: "",
          distribuidora: 1,
          peso: "",
          fecha_vencimiento: "",
          imagen: null,
          estado: true,
        });
        setImagePreview(null);
      } else if (type.includes("categoria")) {
        setCategoriaForm({
          nombre: "",
          descripcion: "",
          estado: true,
        });
      } else if (type.includes("marca")) {
        setMarcaForm({
          nombre: "",
          descripcion: "",
          logo: null,
          estado: true,
        });
        setLogoPreview(null);
      }
    }

    setShowModal(true);
  };

  // Función para cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setCurrentItem(null);
    setImagePreview(null);
    setLogoPreview(null);
  };

  // Manejo de cambios en formularios
  const handleProductoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductoForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoriaChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoriaForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMarcaChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMarcaForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleInventarioChange = (e) => {
    const { name, value } = e.target;
    setInventarioForm((prev) => ({
      ...prev,
      [name]: name === "producto" ? value : parseInt(value),
    }));
  };

  // Funciones para enviar formularios
  const handleSubmitProducto = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");

      if (!productoForm.nombre || !productoForm.categoria || !productoForm.marca) {
        setError("Por favor complete todos los campos requeridos");
        return;
      }

      // Crear FormData para manejar archivos
      const formData = new FormData();
      formData.append('nombre', productoForm.nombre);
      formData.append('descripcion', productoForm.descripcion || '');
      formData.append('categoria', parseInt(productoForm.categoria, 10));
      formData.append('marca', parseInt(productoForm.marca, 10));
      formData.append('distribuidora', parseInt(productoForm.distribuidora, 10));
      formData.append('peso', productoForm.peso || '');
      formData.append('fecha_vencimiento', productoForm.fecha_vencimiento || '');
      formData.append('estado', productoForm.estado);

      // Agregar imagen si existe
      if (productoForm.imagen) {
        formData.append('imagen', productoForm.imagen);
      }

      if (currentItem) {
        // Actualizar producto existente
        await axios.put(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/productos/productos/${currentItem.producto_id}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // Crear nuevo producto
        await axios.post(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/productos/productos/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      await Promise.all([loadProductos(), loadInventario()]);
      closeModal();

      setSuccessMessage(
        currentItem
          ? "Producto actualizado correctamente"
          : "Producto creado correctamente"
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error al guardar producto:", err);
      setError("Error al guardar producto. Por favor, intente nuevamente.");
    }
  };

  const handleSubmitMarca = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");

      // Crear FormData para manejar archivos
      const formData = new FormData();
      formData.append('nombre', marcaForm.nombre);
      formData.append('descripcion', marcaForm.descripcion);
      formData.append('estado', marcaForm.estado);

      // Agregar logo si existe
      if (marcaForm.logo) {
        formData.append('logo', marcaForm.logo);
      }

      if (currentItem) {
        // Actualizar marca existente
        await axios.put(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/productos/marcas/${currentItem.marca_id}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // Crear nueva marca
        await axios.post(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/productos/marcas/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      await loadMarcas();
      closeModal();

      setSuccessMessage(
        currentItem
          ? "Marca actualizada correctamente"
          : "Marca creada correctamente"
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error al guardar marca:", err);
      setError("Error al guardar marca");
    }
  };

  // Las otras funciones de submit permanecen igual...
  const handleSubmitCategoria = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      if (currentItem) {
        await axios.put(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/productos/categorias/${currentItem.categoria_id}/`,
          categoriaForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/productos/categorias/`,
          categoriaForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      await loadCategorias();
      closeModal();

      setSuccessMessage(
        currentItem
          ? "Categoría actualizada correctamente"
          : "Categoría creada correctamente"
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error al guardar categoría:", err);
      setError("Error al guardar categoría");
    }
  };

  const handleSubmitInventario = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      if (currentItem) {
        await axios.put(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/productos/inventario/${currentItem.inventario_id}/`,
          inventarioForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      await loadInventario();
      closeModal();

      setSuccessMessage("Inventario actualizado correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error al guardar inventario:", err);
      setError("Error al guardar inventario");
    }
  };

  // Función para eliminar items
  const handleDelete = async (type, id) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar este ${type}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      if (type === "producto") {
        const inventarioItem = inventario.find((item) => item.producto === id);

        if (inventarioItem) {
          await axios.delete(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:8000"
            }/api/productos/inventario/${inventarioItem.inventario_id}/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setInventario((prevInventario) =>
            prevInventario.filter(
              (i) => i.inventario_id !== inventarioItem.inventario_id
            )
          );
        }

        await axios.delete(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/productos/productos/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProductos((prevProductos) =>
          prevProductos.filter((p) => p.producto_id !== id)
        );

        setSuccessMessage("Producto y su inventario eliminados correctamente");
      } else if (type === "categoria") {
        await axios.delete(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/productos/categorias/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCategorias((prevCategorias) =>
          prevCategorias.filter((c) => c.categoria_id !== id)
        );

        setSuccessMessage("Categoría eliminada correctamente");
      } else if (type === "marca") {
        await axios.delete(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/productos/marcas/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMarcas((prevMarcas) => prevMarcas.filter((m) => m.marca_id !== id));

        setSuccessMessage("Marca eliminada correctamente");
      } else if (type === "inventario") {
        await axios.delete(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/productos/inventario/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setInventario((prevInventario) =>
          prevInventario.filter((i) => i.inventario_id !== id)
        );

        setSuccessMessage("Inventario eliminado correctamente");
      }

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(`Error al eliminar ${type}:`, err);
      setError(`Error al eliminar ${type}`);
    }
  };

  // Función para ajustar inventario
  const handleAjustarStock = async (inventarioId, cantidad) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:8000"
        }/api/productos/inventario/${inventarioId}/ajustar_stock/`,
        { cantidad },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setInventario((prevInventario) =>
        prevInventario.map((item) =>
          item.inventario_id === inventarioId
            ? { ...item, stock_actual: item.stock_actual + cantidad }
            : item
        )
      );

      await loadInventario();

      setSuccessMessage(
        `Stock ${cantidad > 0 ? "incrementado" : "decrementado"} correctamente`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error al ajustar stock:", err);
      setError("Error al ajustar stock");
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
          className="pagination-button">
          <FaChevronLeft /> <FaChevronLeft />
        </button>
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button">
          <FaChevronLeft />
        </button>

        <span className="pagination-info">
          Página {currentPage} de {totalPages}
        </span>

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button">
          <FaChevronRight />
        </button>
        <button
          onClick={() => paginate(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-button">
          <FaChevronRight /> <FaChevronRight />
        </button>

        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="items-per-page">
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
    return sortDirection === "asc" ? (
      <FaSortUp className="sort-icon active" />
    ) : (
      <FaSortDown className="sort-icon active" />
    );
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
        <div className="productos-header-top">
          <div className="productos-title-section">
            <h1>Gestión de Productos</h1>
            <div className="productos-date">
              <FaCalendarAlt />
              <span>
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="productos-tabs">
          <button
            className={activeTab === "productos" ? "active" : ""}
            onClick={() => setActiveTab("productos")}>
            <FaBoxOpen /> Productos
          </button>
          <button
            className={activeTab === "categorias" ? "active" : ""}
            onClick={() => setActiveTab("categorias")}>
            <FaTags /> Categorías
          </button>
          <button
            className={activeTab === "marcas" ? "active" : ""}
            onClick={() => setActiveTab("marcas")}>
            <FaTrademark /> Marcas
          </button>
          <button
            className={activeTab === "inventario" ? "active" : ""}
            onClick={() => setActiveTab("inventario")}>
            <FaBoxOpen /> Inventario
          </button>
        </div>
      </div>

      {activeTab === "productos" && (
        <div className="productos-content">
          <div className="productos-tools">
            <div className="search-filter-section">
              <div className="search-bar">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-dropdown">
                <button
                  className="filter-btn"
                  onClick={() => setShowFilters(!showFilters)}>
                  <FaFilter /> Filtros <FaChevronDown />
                </button>
                {showFilters && (
                  <div className="filter-menu">
                    <div className="filter-group">
                      <label>Estado:</label>
                      <select
                        value={filters.estado}
                        onChange={(e) =>
                          setFilters({ ...filters, estado: e.target.value })
                        }>
                        <option value="todos">Todos</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Categoría:</label>
                      <select
                        value={filters.categoria}
                        onChange={(e) =>
                          setFilters({ ...filters, categoria: e.target.value })
                        }>
                        <option value="todas">Todas</option>
                        {categorias.map((cat) => (
                          <option
                            key={cat.categoria_id}
                            value={cat.categoria_id.toString()}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="filter-group checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={filters.stockMinimo}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              stockMinimo: e.target.checked,
                            })
                          }
                        />
                        Stock bajo mínimo
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="view-toggle">
              <button
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}>
                <FaTh /> Vista de Tarjetas
              </button>
              <button
                className={viewMode === "table" ? "active" : ""}
                onClick={() => setViewMode("table")}>
                <FaList /> Vista de Tabla
              </button>
            </div>

            <button
              className="add-btn"
              onClick={() => openModal("nuevo-producto")}>
              <FaPlus /> Nuevo Producto
            </button>
          </div>

          {viewMode === "grid" ? (
            <div className="productos-cards-grid">
              {currentProducts.length > 0 ? (
                currentProducts.map((producto) => {
                  const inventarioItem = inventario.find(
                    (item) => item.producto === producto.producto_id
                  );
                  const stockActual = inventarioItem
                    ? inventarioItem.stock_actual
                    : 0;
                  const stockMinimo = inventarioItem
                    ? inventarioItem.stock_minimo
                    : 0;
                  const stockBajo = stockActual < stockMinimo;

                  return (
                    <div
                      key={producto.producto_id}
                      className={`producto-card ${
                        stockBajo ? "stock-bajo" : ""
                      }`}>
                      <div className="producto-card-header">
                        <div className="producto-categoria">
                          {producto.categoria_nombre}
                        </div>
                        <div
                          className={`producto-estado ${
                            producto.estado ? "activo" : "inactivo"
                          }`}>
                          {producto.estado ? "Activo" : "Inactivo"}
                        </div>
                      </div>

                      {/* Mostrar imagen del producto */}
                      {producto.imagen_url && (
                        <div className="producto-image">
                          <img 
                            src={producto.imagen_url} 
                            alt={producto.nombre}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="producto-card-content">
                        <h3 className="producto-nombre">{producto.nombre}</h3>
                        <div className="producto-info">
                          <div className="producto-info-item">
                            <span className="info-label">Marca:</span>
                            <span className="info-value">
                              {producto.marca_nombre}
                            </span>
                          </div>
                          <div className="producto-info-item">
                            <span className="info-label">Peso:</span>
                            <span className="info-value">{producto.peso}</span>
                          </div>
                          <div className="producto-info-item">
                            <span className="info-label">Stock:</span>
                            <span
                              className={`info-value ${
                                stockBajo ? "stock-bajo-text" : ""
                              }`}>
                              {stockActual}{" "}
                              {stockBajo && (
                                <span className="stock-warning">¡Bajo!</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="producto-card-actions">
                        <button
                          className="edit-btn"
                          onClick={() => openModal("editar-producto", producto)}
                          title="Editar">
                          <FaEdit /> Editar
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete("producto", producto.producto_id)
                          }
                          title="Eliminar">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-data-message">
                  <div className="no-data-icon">
                    <FaBoxOpen />
                  </div>
                  <h3>No hay productos disponibles</h3>
                  <p>
                    Agrega nuevos productos haciendo clic en "Nuevo Producto"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="productos-table-container">
              <table className="productos-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("nombre")}>
                      Nombre {renderSortIcon("nombre")}
                    </th>
                    <th onClick={() => handleSort("categoria_nombre")}>
                      Categoría {renderSortIcon("categoria_nombre")}
                    </th>
                    <th onClick={() => handleSort("marca_nombre")}>
                      Marca {renderSortIcon("marca_nombre")}
                    </th>
                    <th onClick={() => handleSort("peso")}>
                      Peso {renderSortIcon("peso")}
                    </th>
                    <th onClick={() => handleSort("stock_actual")}>
                      Stock {renderSortIcon("stock_actual")}
                    </th>
                    <th onClick={() => handleSort("estado")}>
                      Estado {renderSortIcon("estado")}
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.length > 0 ? (
                    currentProducts.map((producto) => {
                      const inventarioItem = inventario.find(
                        (item) => item.producto === producto.producto_id
                      );
                      const stockActual = inventarioItem
                        ? inventarioItem.stock_actual
                        : 0;
                      const stockMinimo = inventarioItem
                        ? inventarioItem.stock_minimo
                        : 0;
                      const stockBajo = stockActual < stockMinimo;

                      return (
                        <tr
                          key={producto.producto_id}
                          className={stockBajo ? "stock-bajo-row" : ""}>
                          <td>{producto.nombre}</td>
                          <td>{producto.categoria_nombre}</td>
                          <td>{producto.marca_nombre}</td>
                          <td>{producto.peso}</td>
                          <td className={stockBajo ? "stock-bajo-text" : ""}>
                            {stockActual}{" "}
                            {stockBajo && (
                              <span className="stock-warning">¡Bajo!</span>
                            )}
                          </td>
                          <td>
                            <span
                              className={
                                producto.estado
                                  ? "estado-activo"
                                  : "estado-inactivo"
                              }>
                              {producto.estado ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="acciones">
                            <button
                              className="edit-btn"
                              onClick={() =>
                                openModal("editar-producto", producto)
                              }
                              title="Editar">
                              <FaEdit />
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDelete("producto", producto.producto_id)
                              }
                              title="Eliminar">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        No hay productos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {renderPagination(filteredProductos.length)}
        </div>
      )}

      {activeTab === "categorias" && (
        <div className="productos-content">
          <div className="productos-tools">
            <div className="search-filter-section">
              <div className="search-bar">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Buscar categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-dropdown">
                <button
                  className="filter-btn"
                  onClick={() => setShowFilters(!showFilters)}>
                  <FaFilter /> Filtros <FaChevronDown />
                </button>
                {showFilters && (
                  <div className="filter-menu">
                    <div className="filter-group">
                      <label>Estado:</label>
                      <select
                        value={filters.estado}
                        onChange={(e) =>
                          setFilters({ ...filters, estado: e.target.value })
                        }>
                        <option value="todos">Todos</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              className="add-btn"
              onClick={() => openModal("nueva-categoria")}>
              <FaPlus /> Nueva Categoría
            </button>
          </div>

          <div className="productos-table-container">
            <table className="productos-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("nombre")}>
                    Nombre {renderSortIcon("nombre")}
                  </th>
                  <th onClick={() => handleSort("descripcion")}>
                    Descripción {renderSortIcon("descripcion")}
                  </th>
                  <th onClick={() => handleSort("estado")}>
                    Estado {renderSortIcon("estado")}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentCategorias.length > 0 ? (
                  currentCategorias.map((categoria) => (
                    <tr key={categoria.categoria_id}>
                      <td>{categoria.nombre}</td>
                      <td>{categoria.descripcion}</td>
                      <td>
                        <span
                          className={
                            categoria.estado
                              ? "estado-activo"
                              : "estado-inactivo"
                          }>
                          {categoria.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="acciones">
                        <button
                          className="edit-btn"
                          onClick={() =>
                            openModal("editar-categoria", categoria)
                          }
                          title="Editar">
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete("categoria", categoria.categoria_id)
                          }
                          title="Eliminar">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No hay categorías disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {renderPagination(filteredCategorias.length)}
        </div>
      )}

      {activeTab === "marcas" && (
        <div className="productos-content">
          <div className="productos-tools">
            <div className="search-filter-section">
              <div className="search-bar">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Buscar marcas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-dropdown">
                <button
                  className="filter-btn"
                  onClick={() => setShowFilters(!showFilters)}>
                  <FaFilter /> Filtros <FaChevronDown />
                </button>
                {showFilters && (
                  <div className="filter-menu">
                    <div className="filter-group">
                      <label>Estado:</label>
                      <select
                        value={filters.estado}
                        onChange={(e) =>
                          setFilters({ ...filters, estado: e.target.value })
                        }>
                        <option value="todos">Todos</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              className="add-btn"
              onClick={() => openModal("nueva-marca")}>
              <FaPlus /> Nueva Marca
            </button>
          </div>

          <div className="productos-table-container">
            <table className="productos-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("nombre")}>
                    Nombre {renderSortIcon("nombre")}
                  </th>
                  <th onClick={() => handleSort("descripcion")}>
                    Descripción {renderSortIcon("descripcion")}
                  </th>
                  <th>Logo</th>
                  <th onClick={() => handleSort("estado")}>
                    Estado {renderSortIcon("estado")}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentMarcas.length > 0 ? (
                  currentMarcas.map((marca) => (
                    <tr key={marca.marca_id}>
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
                        <span
                          className={
                            marca.estado ? "estado-activo" : "estado-inactivo"
                          }>
                          {marca.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="acciones">
                        <button
                          className="edit-btn"
                          onClick={() => openModal("editar-marca", marca)}
                          title="Editar">
                          <FaEdit />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete("marca", marca.marca_id)}
                          title="Eliminar">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No hay marcas disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {renderPagination(filteredMarcas.length)}
        </div>
      )}

      {activeTab === "inventario" && (
        <div className="productos-content">
          <div className="inventario-help-tooltip">
            <div className="tooltip-icon">
              <FaQuestionCircle />
            </div>
            <div className="tooltip-content">
              <h4>Control de Inventario</h4>
              <p>En esta sección puede gestionar el stock de productos.</p>
              <ul>
                <li>
                  <FaArrowUp className="tooltip-icon-up" /> Incrementa el stock
                  en 1 unidad
                </li>
                <li>
                  <FaArrowDown className="tooltip-icon-down" /> Reduce el stock
                  en 1 unidad
                </li>
              </ul>
              <p>
                También puede editar manualmente el stock mínimo y actual
                haciendo clic en el botón de editar.
              </p>
              <p>
                Si necesita eliminar un inventario huérfano, utilice el botón de
                eliminar.
              </p>
            </div>
          </div>

          <div className="productos-table-container">
            <table className="productos-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("producto_nombre")}>
                    Producto {renderSortIcon("producto_nombre")}
                  </th>
                  <th onClick={() => handleSort("stock_actual")}>
                    Stock Actual {renderSortIcon("stock_actual")}
                  </th>
                  <th onClick={() => handleSort("stock_minimo")}>
                    Stock Mínimo {renderSortIcon("stock_minimo")}
                  </th>
                  <th onClick={() => handleSort("ultima_actualizacion")}>
                    Última Actualización{" "}
                    {renderSortIcon("ultima_actualizacion")}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentInventario.length > 0 ? (
                  currentInventario.map((item) => (
                    <tr
                      key={item.inventario_id}
                      className={
                        item.stock_actual < item.stock_minimo
                          ? "stock-bajo-row"
                          : ""
                      }>
                      <td>{item.producto_nombre}</td>
                      <td
                        className={
                          item.stock_actual < item.stock_minimo
                            ? "stock-bajo-text"
                            : ""
                        }>
                        {item.stock_actual}
                      </td>
                      <td>{item.stock_minimo}</td>
                      <td>
                        {new Date(item.ultima_actualizacion).toLocaleString()}
                      </td>
                      <td className="acciones">
                        <button
                          className="edit-btn"
                          onClick={() => openModal("editar-inventario", item)}
                          title="Editar inventario">
                          <FaEdit />
                        </button>
                        <div className="stock-buttons">
                          <button
                            className="stock-up-btn"
                            onClick={() =>
                              handleAjustarStock(item.inventario_id, 1)
                            }
                            title="Incrementar stock en 1 unidad">
                            <FaArrowUp />
                          </button>
                          <button
                            className="stock-down-btn"
                            onClick={() =>
                              handleAjustarStock(item.inventario_id, -1)
                            }
                            title="Decrementar stock en 1 unidad">
                            <FaArrowDown />
                          </button>
                        </div>
                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete("inventario", item.inventario_id)
                          }
                          title="Eliminar inventario">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No hay inventario disponible
                    </td>
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
              <h2>
                {modalType.includes("nuevo") || modalType.includes("nueva")
                  ? "Crear"
                  : "Editar"}{" "}
                {modalType.split("-")[1]}
              </h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {modalType.includes("producto") && (
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
                      required>
                      <option value="">Seleccione una categoría</option>
                      {categorias.map((categoria) => (
                        <option
                          key={categoria.categoria_id}
                          value={categoria.categoria_id}>
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
                      required>
                      <option value="">Seleccione una marca</option>
                      {marcas.map((marca) => (
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
                    <label htmlFor="fecha_vencimiento">
                      Fecha de Vencimiento:
                    </label>
                    <input
                      type="date"
                      id="fecha_vencimiento"
                      name="fecha_vencimiento"
                      value={productoForm.fecha_vencimiento}
                      onChange={handleProductoChange}
                    />
                  </div>

                  {/* Campo de imagen del producto */}
                  <div className="form-group">
                    <label htmlFor="imagen">Imagen del Producto:</label>
                    <div className="file-input-container">
                      <input
                        type="file"
                        id="imagen"
                        name="imagen"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'imagen')}
                        className="file-input"
                      />
                      {imagePreview && (
                        <div className="image-preview">
                          <img src={imagePreview} alt="Vista previa" />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeImage('imagen')}
                            title="Eliminar imagen">
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </div>
                    <small className="help-text">
                      Formatos permitidos: JPG, PNG, GIF, WebP (máximo 5MB)
                    </small>
                  </div>

                  <div className="form-group form-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="estado"
                        checked={productoForm.estado}
                        onChange={handleProductoChange}
                      />
                      Producto Activo
                    </label>
                  </div>

                  <div className="form-buttons">
                    <button type="submit" className="submit-btn">
                      {modalType.includes("nuevo") ? "Crear" : "Actualizar"}
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={closeModal}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {modalType.includes("categoria") && (
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

                  <div className="form-group form-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="estado"
                        checked={categoriaForm.estado}
                        onChange={handleCategoriaChange}
                      />
                      Categoría Activa
                    </label>
                  </div>

                  <div className="form-buttons">
                    <button type="submit" className="submit-btn">
                      {modalType.includes("nueva") ? "Crear" : "Actualizar"}
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={closeModal}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {modalType.includes("marca") && (
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

                  {/* Campo de logo de la marca */}
                  <div className="form-group">
                    <label htmlFor="logo">Logo de la Marca:</label>
                    <div className="file-input-container">
                      <input
                        type="file"
                        id="logo"
                        name="logo"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'logo')}
                        className="file-input"
                      />
                      {logoPreview && (
                        <div className="image-preview">
                          <img src={logoPreview} alt="Vista previa del logo" />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeImage('logo')}
                            title="Eliminar logo">
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </div>
                    <small className="help-text">
                      Formatos permitidos: JPG, PNG, GIF, WebP (máximo 5MB)
                    </small>
                  </div>

                  <div className="form-group form-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="estado"
                        checked={marcaForm.estado}
                        onChange={handleMarcaChange}
                      />
                      Marca Activa
                    </label>
                  </div>

                  <div className="form-buttons">
                    <button type="submit" className="submit-btn">
                      {modalType.includes("nueva") ? "Crear" : "Actualizar"}
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={closeModal}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {modalType.includes("inventario") && (
                <form className="form" onSubmit={handleSubmitInventario}>
                  <div className="form-group">
                    <label htmlFor="producto">Producto:</label>
                    <input
                      type="text"
                      id="producto"
                      value={
                        productos.find(
                          (p) =>
                            p.producto_id === Number(inventarioForm.producto)
                        )?.nombre || ""
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
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={closeModal}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mensajes de error */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError("")} className="close-error-btn">
            ×
          </button>
        </div>
      )}

      {/* Mensajes de éxito */}
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
          <button
            onClick={() => setSuccessMessage("")}
            className="close-success-btn">
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductosModule;