import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUserTie,
  FaEye,
  FaEyeSlash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaFilter,
  FaTh,
  FaList,
  FaChevronDown,
  FaUsers,
  FaUser,
} from "react-icons/fa";
import "./UsuariosModule.css";

const UsuariosModule = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Vista de usuarios (grid o tabla)
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
    rol: "todos",
  });

  // Estado para modales
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentItem, setCurrentItem] = useState(null);

  // Estado para ver filtros
  const [showFilters, setShowFilters] = useState(false);

  // Estado para formularios
  const [usuarioForm, setUsuarioForm] = useState({
    username: "",
    password: "",
    password2: "",
    persona: {
      nombres: "",
      apellido_paterno: "",
      apellido_materno: "",
      telefono: "",
      direccion: "",
      email: "",
      ci: "",
    },
    rol: "",
    estado: true,
  });

  const [rolForm, setRolForm] = useState({
    nombre: "",
    descripcion: "",
    estado: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fecha actual
  const getCurrentDate = () => {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return now.toLocaleDateString("es-BO", options);
  };

  // Funciones para cargar datos
  const loadUsuarios = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:8000"
        }/api/usuarios/usuarios/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsuarios(response.data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError("Error al cargar usuarios");
    }
  };

  const loadRoles = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:8000"
        }/api/usuarios/roles/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRoles(response.data);
    } catch (err) {
      console.error("Error al cargar roles:", err);
      setError("Error al cargar roles");
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([loadUsuarios(), loadRoles()]);
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

      // Manejar campos anidados (por ejemplo, "persona.nombres")
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
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

  // Aplicar filtros
  const applyFilters = (items) => {
    return items.filter((item) => {
      // Filtro de búsqueda por texto
      const matchesSearch =
        item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.persona &&
          item.persona.nombres &&
          item.persona.nombres
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (item.persona &&
          item.persona.apellido_paterno &&
          item.persona.apellido_paterno
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (item.persona &&
          item.persona.ci &&
          item.persona.ci.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro por estado
      const matchesEstado =
        filters.estado === "todos" ||
        (filters.estado === "activo" && item.estado) ||
        (filters.estado === "inactivo" && !item.estado);

      // Filtro por rol
      const matchesRol =
        filters.rol === "todos" ||
        (item.rol && item.rol.rol_id.toString() === filters.rol);

      return matchesSearch && matchesEstado && matchesRol;
    });
  };

  // Filtrado y ordenamiento de usuarios
  const filteredUsuarios = applyFilters(usuarios);
  const sortedUsuarios = sortItems(filteredUsuarios, sortField, sortDirection);
  const currentUsuarios = sortedUsuarios.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Filtrado para roles
  const filteredRoles = roles.filter((rol) => {
    const matchesSearch =
      searchTerm === "" ||
      rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rol.descripcion &&
        rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEstado =
      filters.estado === "todos" ||
      (filters.estado === "activo" && rol.estado) ||
      (filters.estado === "inactivo" && !rol.estado);

    return matchesSearch && matchesEstado;
  });

  const sortedRoles = sortItems(filteredRoles, sortField, sortDirection);
  const currentRoles = sortedRoles.slice(indexOfFirstItem, indexOfLastItem);

  // Función para abrir modal
  const openModal = (type, item = null) => {
    console.log("Abriendo modal:", type, item);
    setModalType(type);
    setCurrentItem(item);

    if (type.includes("usuario") && item) {
      console.log("Cargando datos del usuario:", item);

      // Cargar datos del usuario para editar
      setUsuarioForm({
        username: item.username || "",
        password: "",
        password2: "",
        persona: {
          nombres: item.persona?.nombres || "",
          apellido_paterno: item.persona?.apellido_paterno || "",
          apellido_materno: item.persona?.apellido_materno || "",
          telefono: item.persona?.telefono || "",
          direccion: item.persona?.direccion || "",
          email: item.persona?.email || "",
          ci: item.persona?.ci || "",
        },
        rol: item.rol?.rol_id || "",
        estado: item.estado !== undefined ? item.estado : true,
      });
    } else if (type.includes("rol") && item) {
      // Cargar datos del rol para editar
      setRolForm({
        nombre: item.nombre || "",
        descripcion: item.descripcion || "",
        estado: item.estado !== undefined ? item.estado : true,
      });
    } else {
      // Reset forms para crear nuevos items
      if (type.includes("usuario")) {
        setUsuarioForm({
          username: "",
          password: "",
          password2: "",
          persona: {
            nombres: "",
            apellido_paterno: "",
            apellido_materno: "",
            telefono: "",
            direccion: "",
            email: "",
            ci: "",
          },
          rol: "",
          estado: true,
        });
      } else if (type.includes("rol")) {
        setRolForm({
          nombre: "",
          descripcion: "",
          estado: true,
        });
      }
    }

    setShowModal(true);
    setError(""); // Limpiar errores previos
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Función para cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setCurrentItem(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError(""); // Limpiar errores al cerrar modal

    // Reset completo de formularios
    setUsuarioForm({
      username: "",
      password: "",
      password2: "",
      persona: {
        nombres: "",
        apellido_paterno: "",
        apellido_materno: "",
        telefono: "",
        direccion: "",
        email: "",
        ci: "",
      },
      rol: "",
      estado: true,
    });

    setRolForm({
      nombre: "",
      descripcion: "",
      estado: true,
    });
  };

  // Manejo de cambios en formularios
  const handleUsuarioChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      // Manejar cambios en campos anidados (persona)
      const [parent, child] = name.split(".");
      setUsuarioForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setUsuarioForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleRolChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRolForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Funciones para enviar formularios

  const handleSubmitUsuario = async (e) => {
    e.preventDefault();

    // Debug del formulario antes de enviar
    debugFormData(usuarioForm, "usuario");

    try {
      const token = localStorage.getItem("accessToken");

      if (currentItem) {
        // Actualizar usuario existente
        const updateData = {
          username: usuarioForm.username,
          rol: usuarioForm.rol,
          estado: usuarioForm.estado,
          // Campos de persona como campos planos
          nombres: usuarioForm.persona.nombres,
          apellido_paterno: usuarioForm.persona.apellido_paterno,
          apellido_materno: usuarioForm.persona.apellido_materno,
          telefono: usuarioForm.persona.telefono,
          direccion: usuarioForm.persona.direccion,
          email: usuarioForm.persona.email,
          ci: usuarioForm.persona.ci,
        };

        // Solo incluir contraseña si se proporcionó una nueva y no está vacía
        if (usuarioForm.password && usuarioForm.password.trim() !== "") {
          // Validar que las contraseñas coincidan
          if (usuarioForm.password !== usuarioForm.password2) {
            setError("Las contraseñas no coinciden");
            return;
          }
          updateData.password = usuarioForm.password;
        }

        console.log("Datos a enviar para actualización:", updateData);

        const response = await axios.put(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/usuarios/usuarios/${currentItem.usuario_id}/`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Respuesta del servidor:", response.data);
      } else {
        // Crear nuevo usuario (mantener el código existente)

        // Validar que las contraseñas coincidan
        if (usuarioForm.password !== usuarioForm.password2) {
          setError("Las contraseñas no coinciden");
          return;
        }

        const createData = {
          username: usuarioForm.username,
          password: usuarioForm.password,
          password2: usuarioForm.password2,
          persona: {
            nombres: usuarioForm.persona.nombres,
            apellido_paterno: usuarioForm.persona.apellido_paterno,
            apellido_materno: usuarioForm.persona.apellido_materno,
            telefono: usuarioForm.persona.telefono,
            direccion: usuarioForm.persona.direccion,
            email: usuarioForm.persona.email,
            ci: usuarioForm.persona.ci,
          },
          rol: usuarioForm.rol,
        };

        console.log("Datos a enviar para creación:", createData);

        await axios.post(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/usuarios/auth/registro/`,
          createData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      await loadUsuarios();
      closeModal();
      setSuccessMessage(
        currentItem
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente"
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error completo:", err);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);

      let errorMessage = "Error al guardar usuario";

      if (err.response?.status === 400 && err.response?.data) {
        // Manejar errores de validación
        const errorData = err.response.data;
        const errorMessages = [];

        Object.keys(errorData).forEach((field) => {
          if (Array.isArray(errorData[field])) {
            errorMessages.push(`${field}: ${errorData[field].join(", ")}`);
          } else if (typeof errorData[field] === "string") {
            errorMessages.push(`${field}: ${errorData[field]}`);
          }
        });

        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join("\n");
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
    }
  };

  const debugFormData = (formData, type) => {
    console.log(`=== DEBUG: ${type} Form Data ===`);
    console.log("Datos del formulario:", formData);
    if (type === "usuario") {
      console.log("Username:", formData.username);
      console.log("Persona data:", formData.persona);
      console.log("Rol:", formData.rol);
      console.log("Estado:", formData.estado);
      console.log(
        "Password (length):",
        formData.password ? formData.password.length : 0
      );
    }
    console.log("=== FIN DEBUG ===");
  };

  const handleSubmitRol = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      if (currentItem) {
        // Actualizar rol existente
        await axios.put(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/usuarios/roles/${currentItem.rol_id}/`,
          rolForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Crear nuevo rol
        await axios.post(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/usuarios/roles/`,
          rolForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      await loadRoles();
      closeModal();
      setSuccessMessage(
        currentItem
          ? "Rol actualizado correctamente"
          : "Rol creado correctamente"
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error al guardar rol:", err);
      setError("Error al guardar rol");
    }
  };

  // Función para eliminar items
  const handleDelete = async (type, id) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar este ${type}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      if (type === "usuario") {
        await axios.delete(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/usuarios/usuarios/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await loadUsuarios();
        setSuccessMessage("Usuario eliminado correctamente");
      } else if (type === "rol") {
        await axios.delete(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/usuarios/roles/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await loadRoles();
        setSuccessMessage("Rol eliminado correctamente");
      }
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(`Error al eliminar ${type}:`, err);
      setError(`Error al eliminar ${type}`);
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
    return sortDirection === "asc" ? (
      <FaSortUp className="sort-icon active" />
    ) : (
      <FaSortDown className="sort-icon active" />
    );
  };

  if (loading) {
    return (
      <div className="usuarios-loading">
        <div className="spinner"></div>
        <p>Cargando módulo de usuarios...</p>
      </div>
    );
  }

  return (
    <div className="usuarios-module">
      <div className="usuarios-header">
        <div className="usuarios-header-top">
          <div className="usuarios-title-section">
            <h1>Gestión de Usuarios</h1>
            <div className="usuarios-date">
              <FaCalendarAlt />
              <span>{getCurrentDate()}</span>
            </div>
          </div>
        </div>

        <div className="usuarios-tabs">
          <button
            className={activeTab === "usuarios" ? "active" : ""}
            onClick={() => setActiveTab("usuarios")}
          >
            <FaUsers /> Usuarios
          </button>
          <button
            className={activeTab === "roles" ? "active" : ""}
            onClick={() => setActiveTab("roles")}
          >
            <FaUserTie /> Roles
          </button>
        </div>
      </div>

      {activeTab === "usuarios" && (
        <div className="usuarios-content">
          <div className="usuarios-tools">
            <div className="search-filter-section">
              <div className="search-bar">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-dropdown">
                <button
                  className="filter-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
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
                        }
                      >
                        <option value="todos">Todos</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Rol:</label>
                      <select
                        value={filters.rol}
                        onChange={(e) =>
                          setFilters({ ...filters, rol: e.target.value })
                        }
                      >
                        <option value="todos">Todos</option>
                        {roles.map((rol) => (
                          <option
                            key={rol.rol_id}
                            value={rol.rol_id.toString()}
                          >
                            {rol.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="view-toggle">
              <button
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
              >
                <FaTh /> Vista de Tarjetas
              </button>
              <button
                className={viewMode === "table" ? "active" : ""}
                onClick={() => setViewMode("table")}
              >
                <FaList /> Vista de Tabla
              </button>
            </div>

            <button
              className="add-btn"
              onClick={() => openModal("nuevo-usuario")}
            >
              <FaPlus /> Nuevo Usuario
            </button>
          </div>

          {viewMode === "grid" ? (
            <div className="usuarios-cards-grid">
              {currentUsuarios.length > 0 ? (
                currentUsuarios.map((usuario) => (
                  <div key={usuario.usuario_id} className="usuario-card">
                    <div className="usuario-card-header">
                      <div className="usuario-avatar">
                        <FaUser />
                      </div>
                      <div
                        className={`usuario-estado ${
                          usuario.estado ? "activo" : "inactivo"
                        }`}
                      >
                        {usuario.estado ? "Activo" : "Inactivo"}
                      </div>
                    </div>

                    <div className="usuario-card-content">
                      <h3 className="usuario-nombre">
                        {usuario.persona
                          ? `${usuario.persona.nombres} ${usuario.persona.apellido_paterno}`
                          : usuario.username}
                      </h3>
                      <div className="usuario-info">
                        <div className="usuario-info-item">
                          <span className="info-label">Usuario:</span>
                          <span className="info-value">{usuario.username}</span>
                        </div>
                        <div className="usuario-info-item">
                          <span className="info-label">CI:</span>
                          <span className="info-value">
                            {usuario.persona?.ci || "N/A"}
                          </span>
                        </div>
                        <div className="usuario-info-item">
                          <span className="info-label">Email:</span>
                          <span className="info-value">
                            {usuario.persona?.email || "N/A"}
                          </span>
                        </div>
                        <div className="usuario-info-item">
                          <span className="info-label">Teléfono:</span>
                          <span className="info-value">
                            {usuario.persona?.telefono || "N/A"}
                          </span>
                        </div>
                        <div className="usuario-info-item">
                          <span className="info-label">Rol:</span>
                          <span className="info-value">
                            {usuario.rol?.nombre || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="usuario-card-actions">
                      <button
                        className="edit-btn"
                        onClick={() => openModal("editar-usuario", usuario)}
                        title="Editar"
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete("usuario", usuario.usuario_id)
                        }
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-message">
                  <div className="no-data-icon">
                    <FaUsers />
                  </div>
                  <h3>No hay usuarios disponibles</h3>
                  <p>Agrega nuevos usuarios haciendo clic en "Nuevo Usuario"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="usuarios-table-container">
              <table className="usuarios-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("usuario_id")}>
                      ID {renderSortIcon("usuario_id")}
                    </th>
                    <th onClick={() => handleSort("username")}>
                      Usuario {renderSortIcon("username")}
                    </th>
                    <th onClick={() => handleSort("persona.nombres")}>
                      Nombres {renderSortIcon("persona.nombres")}
                    </th>
                    <th onClick={() => handleSort("persona.ci")}>
                      CI {renderSortIcon("persona.ci")}
                    </th>
                    <th onClick={() => handleSort("persona.email")}>
                      Email {renderSortIcon("persona.email")}
                    </th>
                    <th onClick={() => handleSort("rol.nombre")}>
                      Rol {renderSortIcon("rol.nombre")}
                    </th>
                    <th onClick={() => handleSort("estado")}>
                      Estado {renderSortIcon("estado")}
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsuarios.length > 0 ? (
                    currentUsuarios.map((usuario) => (
                      <tr key={usuario.usuario_id}>
                        <td>{usuario.usuario_id}</td>
                        <td>{usuario.username}</td>
                        <td>
                          {usuario.persona
                            ? `${usuario.persona.nombres} ${usuario.persona.apellido_paterno}`
                            : "N/A"}
                        </td>
                        <td>{usuario.persona ? usuario.persona.ci : "N/A"}</td>
                        <td>
                          {usuario.persona ? usuario.persona.email : "N/A"}
                        </td>
                        <td>{usuario.rol ? usuario.rol.nombre : "N/A"}</td>
                        <td>
                          <span
                            className={
                              usuario.estado
                                ? "estado-activo"
                                : "estado-inactivo"
                            }
                          >
                            {usuario.estado ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="acciones">
                          <button
                            className="edit-btn"
                            onClick={() => openModal("editar-usuario", usuario)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDelete("usuario", usuario.usuario_id)
                            }
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">
                        No hay usuarios disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {renderPagination(filteredUsuarios.length)}
        </div>
      )}

      {activeTab === "roles" && (
        <div className="usuarios-content">
          <div className="usuarios-tools">
            <div className="search-filter-section">
              <div className="search-bar">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Buscar roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-dropdown">
                <button
                  className="filter-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
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
                        }
                      >
                        <option value="todos">Todos</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button className="add-btn" onClick={() => openModal("nuevo-rol")}>
              <FaPlus /> Nuevo Rol
            </button>
          </div>

          <div className="roles-cards-grid">
            {currentRoles.length > 0 ? (
              currentRoles.map((rol) => (
                <div key={rol.rol_id} className="rol-card">
                  <div className="rol-card-header">
                    <div className="rol-icon">
                      <FaUserTie />
                    </div>
                    <div
                      className={`rol-estado ${
                        rol.estado ? "activo" : "inactivo"
                      }`}
                    >
                      {rol.estado ? "Activo" : "Inactivo"}
                    </div>
                  </div>

                  <div className="rol-card-content">
                    <h3 className="rol-nombre">{rol.nombre}</h3>
                    <p className="rol-descripcion">{rol.descripcion}</p>
                  </div>

                  <div className="rol-card-actions">
                    <button
                      className="edit-btn"
                      onClick={() => openModal("editar-rol", rol)}
                      title="Editar"
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete("rol", rol.rol_id)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-message">
                <div className="no-data-icon">
                  <FaUserTie />
                </div>
                <h3>No hay roles disponibles</h3>
                <p>Agrega nuevos roles haciendo clic en "Nuevo Rol"</p>
              </div>
            )}
          </div>

          {renderPagination(filteredRoles.length)}
        </div>
      )}

      {/* Modales para Formularios */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>
                {modalType.includes("nuevo") ? "Crear" : "Editar"}{" "}
                {modalType.split("-")[1]}
              </h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {modalType.includes("usuario") && (
                <form className="form" onSubmit={handleSubmitUsuario}>
                  <div className="form-sections">
                    <div className="form-section">
                      <h3>Información de Cuenta</h3>
                      <div className="form-group">
                        <label htmlFor="username">Nombre de Usuario:</label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={usuarioForm.username}
                          onChange={handleUsuarioChange}
                          required
                        />
                      </div>
                      {!currentItem && (
                        <>
                          <div className="form-group">
                            <label htmlFor="password">Contraseña:</label>
                            <div className="password-input-container">
                              <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={usuarioForm.password}
                                onChange={handleUsuarioChange}
                                required={!currentItem}
                                placeholder="Mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos"
                              />
                              <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="password2">
                              Confirmar Contraseña:
                            </label>
                            <div className="password-input-container">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="password2"
                                name="password2"
                                value={usuarioForm.password2}
                                onChange={handleUsuarioChange}
                                required={!currentItem}
                                placeholder="Repite la contraseña anterior"
                              />
                              <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
                                  <FaEyeSlash />
                                ) : (
                                  <FaEye />
                                )}
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {currentItem && (
                        <>
                          <div className="form-group">
                            <label htmlFor="password">
                              Nueva Contraseña (opcional):
                            </label>
                            <div className="password-input-container">
                              <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={usuarioForm.password}
                                onChange={handleUsuarioChange}
                                placeholder="Dejar en blanco para mantener la actual"
                              />
                              <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                            <small
                              style={{ color: "#6b7280", fontSize: "0.85rem" }}
                            >
                              Solo completa este campo si deseas cambiar la
                              contraseña
                            </small>
                          </div>

                          {usuarioForm.password &&
                            usuarioForm.password.trim() !== "" && (
                              <div className="form-group">
                                <label htmlFor="password2">
                                  Confirmar Nueva Contraseña:
                                </label>
                                <div className="password-input-container">
                                  <input
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    id="password2"
                                    name="password2"
                                    value={usuarioForm.password2}
                                    onChange={handleUsuarioChange}
                                    placeholder="Confirma la nueva contraseña"
                                  />
                                  <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword
                                      )
                                    }
                                  >
                                    {showConfirmPassword ? (
                                      <FaEyeSlash />
                                    ) : (
                                      <FaEye />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                        </>
                      )}

                      <div className="form-group">
                        <label htmlFor="rol">Rol:</label>
                        <select
                          id="rol"
                          name="rol"
                          value={usuarioForm.rol}
                          onChange={handleUsuarioChange}
                          required
                        >
                          <option value="">Seleccione un rol</option>
                          {roles.map((rol) => (
                            <option key={rol.rol_id} value={rol.rol_id}>
                              {rol.nombre} - {rol.descripcion}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Información Personal</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="persona.nombres">Nombres:</label>
                          <input
                            type="text"
                            id="persona.nombres"
                            name="persona.nombres"
                            value={usuarioForm.persona.nombres}
                            onChange={handleUsuarioChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="persona.apellido_paterno">
                            Apellido Paterno:
                          </label>
                          <input
                            type="text"
                            id="persona.apellido_paterno"
                            name="persona.apellido_paterno"
                            value={usuarioForm.persona.apellido_paterno}
                            onChange={handleUsuarioChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="persona.apellido_materno">
                            Apellido Materno:
                          </label>
                          <input
                            type="text"
                            id="persona.apellido_materno"
                            name="persona.apellido_materno"
                            value={usuarioForm.persona.apellido_materno}
                            onChange={handleUsuarioChange}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="persona.ci">
                            Carnet de Identidad:
                          </label>
                          <input
                            type="text"
                            id="persona.ci"
                            name="persona.ci"
                            value={usuarioForm.persona.ci}
                            onChange={handleUsuarioChange}
                            required
                            placeholder="Ej: 12345678 o 12345678-LP"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="persona.telefono">Teléfono:</label>
                          <input
                            type="text"
                            id="persona.telefono"
                            name="persona.telefono"
                            value={usuarioForm.persona.telefono}
                            onChange={handleUsuarioChange}
                            required
                            maxLength="8"
                            placeholder="8 dígitos"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="persona.email">
                            Correo Electrónico:
                          </label>
                          <input
                            type="email"
                            id="persona.email"
                            name="persona.email"
                            value={usuarioForm.persona.email}
                            onChange={handleUsuarioChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="persona.direccion">Dirección:</label>
                        <input
                          type="text"
                          id="persona.direccion"
                          name="persona.direccion"
                          value={usuarioForm.persona.direccion}
                          onChange={handleUsuarioChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {currentItem && (
                    <div className="form-group form-checkbox">
                      <label>
                        <input
                          type="checkbox"
                          name="estado"
                          checked={usuarioForm.estado}
                          onChange={handleUsuarioChange}
                        />
                        Usuario Activo
                      </label>
                    </div>
                  )}

                  <div className="form-buttons">
                    <button type="submit" className="submit-btn">
                      {modalType.includes("nuevo") ? "Crear" : "Actualizar"}
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={closeModal}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {modalType.includes("rol") && (
                <form className="form" onSubmit={handleSubmitRol}>
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={rolForm.nombre}
                      onChange={handleRolChange}
                      required
                      maxLength="20"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={rolForm.descripcion}
                      onChange={handleRolChange}
                      required
                      maxLength="100"
                    />
                  </div>

                  {currentItem && (
                    <div className="form-group form-checkbox">
                      <label>
                        <input
                          type="checkbox"
                          name="estado"
                          checked={rolForm.estado}
                          onChange={handleRolChange}
                        />
                        Rol Activo
                      </label>
                    </div>
                  )}

                  <div className="form-buttons">
                    <button type="submit" className="submit-btn">
                      {modalType.includes("nuevo") ? "Crear" : "Actualizar"}
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={closeModal}
                    >
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
            className="close-success-btn"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default UsuariosModule;
