import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
  FaChevronRight,
  FaChevronLeft,
  FaBox,
  FaHistory,
  FaHeart,
  FaTag,
  FaBars,
} from "react-icons/fa";
import "./DashboardClient.css";
import logoCircular from "../assets/distribuidora.png";
import ProductosModule from "./ProductosModule";
import ProductosCliente from "./ProductosCliente";

const DashboardClient = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModule, setActiveModule] = useState("inicio");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Datos de ejemplo (en el futuro se obtendrán del backend)
  const clientData = {
    pedidosRecientes: [
      { id: 1, fecha: "15/04/2025", estado: "Entregado", total: "Bs. 320.00" },
      { id: 2, fecha: "28/04/2025", estado: "En proceso", total: "Bs. 155.50" },
    ],
    productosDestacados: [
      { id: 1, nombre: "Queso Fresco", precio: "Bs. 25.00/kg", imagen: null },
      {
        id: 2,
        nombre: "Queso Mozzarella",
        precio: "Bs. 30.00/kg",
        imagen: null,
      },
      { id: 3, nombre: "Queso Cheddar", precio: "Bs. 35.00/kg", imagen: null },
      { id: 4, nombre: "Queso Gouda", precio: "Bs. 32.00/kg", imagen: null },
    ],
    ofertas: [
      {
        id: 1,
        titulo: "10% de descuento",
        descripcion: "En compras mayores a Bs. 200.00",
      },
      {
        id: 2,
        titulo: "2x1 en queso fresco",
        descripcion: "Válido hasta el 15 de mayo",
      },
    ],
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Verificar si hay un token
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }

        // Configurar el encabezado de autorización
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Obtener datos del usuario
        const response = await axios.get(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:8000"
          }/api/usuarios/usuarios/perfil/`
        );

        setUser(response.data);

        // Verificar que el usuario sea cliente
        if (response.data.rol.rol_id !== 2) {
          // Redirigir a usuarios no clientes
          if (response.data.rol.rol_id === 1) {
            navigate("/admin-dashboard");
          } else {
            navigate("/");
          }
        }
      } catch (err) {
        console.error("Error al obtener datos del usuario:", err);
        if (err.response?.status === 401) {
          // Token expirado o inválido
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/login");
        } else {
          setError("Error al cargar datos del usuario");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    // Llamar a la API de cierre de sesión
    axios
      .post(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:8000"
        }/api/usuarios/auth/logout/`
      )
      .catch((err) => {
        console.error("Error durante el cierre de sesión:", err);
      })
      .finally(() => {
        // Eliminar tokens independientemente de la respuesta de la API
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];
        navigate("/login");
      });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="client-loading-container">
        <div className="client-loading-spinner"></div>
        <p>Cargando portal de cliente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate("/login")}
          className="client-btn-primary">
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <div className="client-dashboard">
      <div className={`client-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="client-sidebar-header">
          <img
            src={logoCircular}
            alt="Distribuidora Carolina"
            className="client-sidebar-logo"
          />
          {!sidebarCollapsed && <h2>Portal de Cliente</h2>}
        </div>

        <div className="client-sidebar-toggle-container">
          <div className="client-sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </div>
        </div>

        <div className="client-user-info">
          <div className="client-user-avatar">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          {!sidebarCollapsed && (
            <div className="client-user-details">
              <p className="client-user-name">
                {user?.persona.nombres} {user?.persona.apellido_paterno}
              </p>
              <p className="client-user-role">{user?.rol.nombre}</p>
            </div>
          )}
        </div>

        <nav className="client-sidebar-nav">
          <ul>
            <li className={activeModule === "inicio" ? "active" : ""}>
              <button onClick={() => setActiveModule("inicio")}>
                <FaHome />
                {!sidebarCollapsed && <span>Inicio</span>}
              </button>
            </li>
            <li className={activeModule === "productos" ? "active" : ""}>
              <button onClick={() => setActiveModule("productos")}>
                <FaBox />
                {!sidebarCollapsed && <span>Productos</span>}
              </button>
            </li>
            <li className={activeModule === "pedidos" ? "active" : ""}>
              <button onClick={() => setActiveModule("pedidos")}>
                <FaShoppingCart />
                {!sidebarCollapsed && <span>Mis Pedidos</span>}
              </button>
            </li>
            <li className={activeModule === "historial" ? "active" : ""}>
              <button onClick={() => setActiveModule("historial")}>
                <FaHistory />
                {!sidebarCollapsed && <span>Historial</span>}
              </button>
            </li>
            <li className={activeModule === "favoritos" ? "active" : ""}>
              <button onClick={() => setActiveModule("favoritos")}>
                <FaHeart />
                {!sidebarCollapsed && <span>Favoritos</span>}
              </button>
            </li>
            <li className={activeModule === "ofertas" ? "active" : ""}>
              <button onClick={() => setActiveModule("ofertas")}>
                <FaTag />
                {!sidebarCollapsed && <span>Ofertas</span>}
              </button>
            </li>
            <li className={activeModule === "perfil" ? "active" : ""}>
              <button onClick={() => setActiveModule("perfil")}>
                <FaUser />
                {!sidebarCollapsed && <span>Mi Perfil</span>}
              </button>
            </li>
          </ul>
        </nav>

        <div className="client-logout">
          <button onClick={handleLogout}>
            <FaSignOutAlt />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      <div className={`client-content ${sidebarCollapsed ? "expanded" : ""}`}>
        <div className="client-content-header">
          <h1>
            {activeModule === "inicio" && "Bienvenido a Distribuidora Carolina"}
            {activeModule === "productos" && <ProductosCliente />}
            {activeModule === "pedidos" && "Mis Pedidos"}
            {activeModule === "historial" && "Historial de Compras"}
            {activeModule === "favoritos" && "Mis Productos Favoritos"}
            {activeModule === "ofertas" && "Ofertas Especiales"}
            {activeModule === "perfil" && "Mi Perfil"}
          </h1>
          <div className="client-header-date">
            {new Date().toLocaleDateString("es-BO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {activeModule === "inicio" && (
          <div className="client-dashboard-content">
            <div className="client-welcome-banner">
              <div className="client-welcome-message">
                <h2>Hola, {user?.persona.nombres}!</h2>
                <p>
                  Bienvenido a tu portal de cliente de Distribuidora Carolina.
                  Aquí puedes explorar nuestros productos, hacer pedidos y
                  revisar tu historial de compras.
                </p>
              </div>
            </div>

            <div className="client-dashboard-sections">
              <div className="client-section client-orders-section">
                <div className="client-section-header">
                  <h3>Pedidos Recientes</h3>
                  <button
                    className="client-section-more"
                    onClick={() => setActiveModule("pedidos")}>
                    Ver todos <FaChevronRight />
                  </button>
                </div>
                <div className="client-section-content">
                  {clientData.pedidosRecientes.length > 0 ? (
                    <div className="client-orders-list">
                      {clientData.pedidosRecientes.map((pedido) => (
                        <div key={pedido.id} className="client-order-item">
                          <div className="client-order-info">
                            <h4>Pedido #{pedido.id}</h4>
                            <p>Fecha: {pedido.fecha}</p>
                            <p>Total: {pedido.total}</p>
                          </div>
                          <div
                            className={`client-order-status ${pedido.estado
                              .toLowerCase()
                              .replace(" ", "-")}`}>
                            {pedido.estado}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="client-empty-state">
                      No tienes pedidos recientes
                    </p>
                  )}
                </div>
              </div>

              <div className="client-section client-featured-section">
                <div className="client-section-header">
                  <h3>Productos Destacados</h3>
                  <button
                    className="client-section-more"
                    onClick={() => setActiveModule("productos")}>
                    Ver todos <FaChevronRight />
                  </button>
                </div>
                <div className="client-section-content">
                  <div className="client-products-grid">
                    {clientData.productosDestacados.map((producto) => (
                      <div key={producto.id} className="client-product-card">
                        <div className="client-product-image">
                          {producto.imagen ? (
                            <img src={producto.imagen} alt={producto.nombre} />
                          ) : (
                            <div className="client-product-placeholder"></div>
                          )}
                        </div>
                        <div className="client-product-info">
                          <h4>{producto.nombre}</h4>
                          <p className="client-product-price">
                            {producto.precio}
                          </p>
                          <button className="client-btn-primary">
                            Ver Detalles
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="client-offers-section">
              <div className="client-section-header">
                <h3>Ofertas Especiales</h3>
                <button
                  className="client-section-more"
                  onClick={() => setActiveModule("ofertas")}>
                  Ver todas <FaChevronRight />
                </button>
              </div>
              <div className="client-offers-grid">
                {clientData.ofertas.map((oferta) => (
                  <div key={oferta.id} className="client-offer-card">
                    <h4>{oferta.titulo}</h4>
                    <p>{oferta.descripcion}</p>
                    <button className="client-btn-secondary">Aprovechar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeModule === "perfil" && (
          <div className="client-profile-content">
            <div className="client-profile-card">
              <div className="client-profile-header">
                <div className="client-profile-avatar">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="client-profile-titles">
                  <h2>
                    {user?.persona.nombres} {user?.persona.apellido_paterno}{" "}
                    {user?.persona.apellido_materno}
                  </h2>
                  <p>
                    Cliente desde{" "}
                    {new Date(user?.persona.fecha_registro).toLocaleDateString(
                      "es-BO"
                    )}
                  </p>
                </div>
              </div>

              <div className="client-profile-sections">
                <div className="client-profile-section">
                  <h3>Información Personal</h3>
                  <div className="client-profile-fields">
                    <div className="client-profile-field">
                      <div className="client-profile-label">
                        Nombre completo:
                      </div>
                      <div className="client-profile-value">
                        {user?.persona.nombres} {user?.persona.apellido_paterno}{" "}
                        {user?.persona.apellido_materno}
                      </div>
                    </div>
                    <div className="client-profile-field">
                      <div className="client-profile-label">CI:</div>
                      <div className="client-profile-value">
                        {user?.persona.ci}
                      </div>
                    </div>
                    <div className="client-profile-field">
                      <div className="client-profile-label">
                        Correo electrónico:
                      </div>
                      <div className="client-profile-value">
                        {user?.persona.email}
                      </div>
                    </div>
                    <div className="client-profile-field">
                      <div className="client-profile-label">Teléfono:</div>
                      <div className="client-profile-value">
                        {user?.persona.telefono}
                      </div>
                    </div>
                    <div className="client-profile-field">
                      <div className="client-profile-label">Dirección:</div>
                      <div className="client-profile-value">
                        {user?.persona.direccion}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="client-profile-section">
                  <h3>Información de Cuenta</h3>
                  <div className="client-profile-fields">
                    <div className="client-profile-field">
                      <div className="client-profile-label">
                        Nombre de usuario:
                      </div>
                      <div className="client-profile-value">
                        {user?.username}
                      </div>
                    </div>
                    <div className="client-profile-field">
                      <div className="client-profile-label">Último acceso:</div>
                      <div className="client-profile-value">
                        {user?.ultimo_login
                          ? new Date(user.ultimo_login).toLocaleString("es-BO")
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="client-profile-actions">
                <button className="client-btn-primary">Editar Perfil</button>
                <button className="client-btn-secondary">
                  Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>
        )}

        {activeModule !== "inicio" && activeModule !== "perfil" && (
          <div className="client-module-placeholder">
            <h2>Módulo de {activeModule}</h2>
            <p>Esta sección está en desarrollo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardClient;
