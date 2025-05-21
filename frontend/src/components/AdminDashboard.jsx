import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUsers,
  FaShoppingCart,
  FaTruck,
  FaWarehouse,
  FaChartBar,
  FaSignOutAlt,
  FaTachometerAlt,
  FaCog,
  FaFileInvoiceDollar,
  FaUserTie,
  FaClipboardList,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";
import "./AdminDashboard.css";
import logoCircular from "../assets/distribuidora.png";
import ProductosModule from "./ProductosModule";
import UsuariosModule from "./UsuariosModule";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Datos de ejemplo para estadísticas (después se obtendrán del backend)
  const stats = {
    clientes: 56,
    ventas: 120,
    compras: 48,
    proveedores: 22,
    totalVentas: "Bs. 56,892.00",
    totalCompras: "Bs. 31,450.00",
    productosPopulares: [
      { id: 1, nombre: "Queso Fresco", ventas: 120 },
      { id: 2, nombre: "Queso Mozzarella", ventas: 95 },
      { id: 3, nombre: "Queso Cheddar", ventas: 87 },
      { id: 4, nombre: "Queso Gouda", ventas: 62 },
      { id: 5, nombre: "Queso Parmesano", ventas: 45 },
    ],
    actividadReciente: [
      {
        id: 1,
        tipo: "venta",
        descripcion: "Venta #1045",
        monto: "Bs. 650.00",
        fecha: "10:45 AM",
      },
      {
        id: 2,
        tipo: "cliente",
        descripcion: "Nuevo cliente registrado",
        cliente: "Juan Pérez",
        fecha: "09:30 AM",
      },
      {
        id: 3,
        tipo: "compra",
        descripcion: "Compra a proveedor #22",
        monto: "Bs. 1,200.00",
        fecha: "Ayer, 16:20 PM",
      },
      {
        id: 4,
        tipo: "venta",
        descripcion: "Venta #1044",
        monto: "Bs. 425.00",
        fecha: "Ayer, 14:15 PM",
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

        // Verificar que el usuario sea administrador
        if (response.data.rol.rol_id !== 1) {
          // Redirigir a usuarios no administradores
          if (response.data.rol.rol_id === 2) {
            navigate("/client-dashboard");
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
      <div className="admin-loading-container">
        <div className="admin-loading-spinner"></div>
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate("/login")}
          className="admin-btn-primary">
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className={`admin-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="admin-sidebar-header">
          <img
            src={logoCircular}
            alt="Distribuidora Carolina"
            className="admin-sidebar-logo"
          />
          {!sidebarCollapsed && <h2>Panel de Administrador</h2>}
        </div>

        <div className="admin-sidebar-toggle-container">
          <div className="admin-sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </div>
        </div>

        <div className="admin-user-info">
          <div className="admin-user-avatar">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          {!sidebarCollapsed && (
            <div className="admin-user-details">
              <p className="admin-user-name">
                {user?.persona.nombres} {user?.persona.apellido_paterno}
              </p>
              <p className="admin-user-role">{user?.rol.nombre}</p>
            </div>
          )}
        </div>

        <nav className="admin-sidebar-nav">
          <ul>
            <li className={activeModule === "dashboard" ? "active" : ""}>
              <button onClick={() => setActiveModule("dashboard")}>
                <FaTachometerAlt />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </button>
            </li>
            <li className={activeModule === "clientes" ? "active" : ""}>
              <button onClick={() => setActiveModule("clientes")}>
                <FaUsers />
                {!sidebarCollapsed && <span>Clientes</span>}
              </button>
            </li>
            <li className={activeModule === "productos" ? "active" : ""}>
              <button onClick={() => setActiveModule("productos")}>
                <FaWarehouse />
                {!sidebarCollapsed && <span>Productos</span>}
              </button>
            </li>
            <li className={activeModule === "ventas" ? "active" : ""}>
              <button onClick={() => setActiveModule("ventas")}>
                <FaShoppingCart />
                {!sidebarCollapsed && <span>Ventas</span>}
              </button>
            </li>
            <li className={activeModule === "compras" ? "active" : ""}>
              <button onClick={() => setActiveModule("compras")}>
                <FaClipboardList />
                {!sidebarCollapsed && <span>Compras</span>}
              </button>
            </li>
            <li className={activeModule === "proveedores" ? "active" : ""}>
              <button onClick={() => setActiveModule("proveedores")}>
                <FaTruck />
                {!sidebarCollapsed && <span>Proveedores</span>}
              </button>
            </li>
            <li className={activeModule === "reportes" ? "active" : ""}>
              <button onClick={() => setActiveModule("reportes")}>
                <FaChartBar />
                {!sidebarCollapsed && <span>Reportes</span>}
              </button>
            </li>
            <li className={activeModule === "facturas" ? "active" : ""}>
              <button onClick={() => setActiveModule("facturas")}>
                <FaFileInvoiceDollar />
                {!sidebarCollapsed && <span>Facturas</span>}
              </button>
            </li>
            <li className={activeModule === "usuarios" ? "active" : ""}>
              <button onClick={() => setActiveModule("usuarios")}>
                <FaUserTie />
                {!sidebarCollapsed && <span>Usuarios</span>}
              </button>
            </li>
            <li className={activeModule === "configuracion" ? "active" : ""}>
              <button onClick={() => setActiveModule("configuracion")}>
                <FaCog />
                {!sidebarCollapsed && <span>Configuración</span>}
              </button>
            </li>
          </ul>
        </nav>

        <div className="admin-logout">
          <button onClick={handleLogout}>
            <FaSignOutAlt />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      <div className={`admin-content ${sidebarCollapsed ? "expanded" : ""}`}>
        <div className="admin-content-header">
          <h1>
            {activeModule === "dashboard" && "Dashboard"}
            {activeModule === "clientes" && "Gestión de Clientes"}
            {activeModule === "productos" && <ProductosModule />}
            {activeModule === "ventas" && "Gestión de Ventas"}
            {activeModule === "compras" && "Gestión de Compras"}
            {activeModule === "proveedores" && "Gestión de Proveedores"}
            {activeModule === "reportes" && "Reportes y Estadísticas"}
            {activeModule === "facturas" && "Gestión de Facturas"}
            {activeModule === "usuarios" && <UsuariosModule />}
            {activeModule === "configuracion" && "Configuración del Sistema"}
          </h1>
        </div>

        {activeModule === "dashboard" && (
          <div className="admin-dashboard-content">
            <div className="admin-stats-container">
              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <FaUsers />
                </div>
                <div className="admin-stat-info">
                  <h3>Clientes</h3>
                  <p className="admin-stat-number">{stats.clientes}</p>
                  <p className="admin-stat-label">Clientes registrados</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <FaShoppingCart />
                </div>
                <div className="admin-stat-info">
                  <h3>Ventas</h3>
                  <p className="admin-stat-number">{stats.ventas}</p>
                  <p className="admin-stat-label">Ventas realizadas</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <FaClipboardList />
                </div>
                <div className="admin-stat-info">
                  <h3>Compras</h3>
                  <p className="admin-stat-number">{stats.compras}</p>
                  <p className="admin-stat-label">Compras realizadas</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <FaTruck />
                </div>
                <div className="admin-stat-info">
                  <h3>Proveedores</h3>
                  <p className="admin-stat-number">{stats.proveedores}</p>
                  <p className="admin-stat-label">Proveedores activos</p>
                </div>
              </div>
            </div>

            <div className="admin-charts-container">
              <div className="admin-chart-card">
                <h3>Resumen Financiero</h3>
                <div className="admin-financial-summary">
                  <div className="admin-financial-item">
                    <h4>Total Ventas</h4>
                    <p className="admin-financial-amount">
                      {stats.totalVentas}
                    </p>
                  </div>
                  <div className="admin-financial-item">
                    <h4>Total Compras</h4>
                    <p className="admin-financial-amount">
                      {stats.totalCompras}
                    </p>
                  </div>
                  <div className="admin-financial-item">
                    <h4>Ganancia</h4>
                    <p className="admin-financial-amount positive">
                      Bs. 25,442.00
                    </p>
                  </div>
                </div>
                <div className="admin-chart-placeholder">
                  {/* Aquí iría la gráfica de barras - se implementará con recharts */}
                  <div className="admin-placeholder-chart">
                    <div
                      className="admin-chart-bar"
                      style={{ height: "60%" }}></div>
                    <div
                      className="admin-chart-bar"
                      style={{ height: "80%" }}></div>
                    <div
                      className="admin-chart-bar"
                      style={{ height: "45%" }}></div>
                    <div
                      className="admin-chart-bar"
                      style={{ height: "70%" }}></div>
                    <div
                      className="admin-chart-bar"
                      style={{ height: "90%" }}></div>
                    <div
                      className="admin-chart-bar"
                      style={{ height: "65%" }}></div>
                  </div>
                </div>
              </div>

              <div className="admin-chart-card">
                <h3>Productos Más Vendidos</h3>
                <div className="admin-products-list">
                  {stats.productosPopulares.map((producto, index) => (
                    <div key={producto.id} className="admin-product-item">
                      <div className="admin-product-rank">{index + 1}</div>
                      <div className="admin-product-info">
                        <h4>{producto.nombre}</h4>
                        <p>{producto.ventas} unidades</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-activity-container">
              <h3>Actividad Reciente</h3>
              <div className="admin-activity-list">
                {stats.actividadReciente.map((actividad) => (
                  <div key={actividad.id} className="admin-activity-item">
                    <div className={`admin-activity-icon ${actividad.tipo}`}>
                      {actividad.tipo === "venta" && <FaShoppingCart />}
                      {actividad.tipo === "compra" && <FaClipboardList />}
                      {actividad.tipo === "cliente" && <FaUsers />}
                    </div>
                    <div className="admin-activity-details">
                      <h4>{actividad.descripcion}</h4>
                      {actividad.monto && (
                        <p className="admin-activity-amount">
                          {actividad.monto}
                        </p>
                      )}
                      {actividad.cliente && <p>Cliente: {actividad.cliente}</p>}
                      <p className="admin-activity-time">{actividad.fecha}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="admin-view-all-btn">
                Ver todas las actividades
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
