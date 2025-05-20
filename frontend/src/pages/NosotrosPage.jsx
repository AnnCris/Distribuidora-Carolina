import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NosotrosPage.css';
import logoCircular from '../assets/distribuidora.png';
import carritoIcon from '../assets/carrito-compra.png';
import userIcon from '../assets/user-icon.png';
import fabrica from '../assets/FABRICA.png';
import equipo from '../assets/EQUIPO.png';

const NosotrosPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="nosotros-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-title-container">
            <img src={logoCircular} alt="Distribuidora Carolina" className="header-logo" />
            <div className="header-title">
              <h1>DISTRIBUIDORA</h1>
              <h2>DE QUESOS</h2>
              <h3>"CAROLINA"</h3>
            </div>
          </div>
          
          <div className="search-container">
            <span className="search-label">Categorías</span>
            <div className="dropdown-icon">▼</div>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar..." 
            />
            <button className="search-button">
              <i className="fa fa-search"></i>
            </button>
          </div>
          
          <div className="header-actions">
            <button className="cart-button">
              <img src={carritoIcon} alt="Carrito" className="cart-icon" />
            </button>
            <div className="user-container" onClick={handleLoginClick}>
              <img src={userIcon} alt="Usuario" className="user-icon" />
              <span className="user-label">Admin</span>
              <div className="dropdown-icon">▼</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="main-nav">
        <ul className="nav-links">
          <li><Link to="/">INICIO</Link></li>
          <li><Link to="/nosotros" className="active">NOSOTROS</Link></li>
          <li><Link to="/productos">PRODUCTOS</Link></li>
          <li><Link to="/ofertas">OFERTAS</Link></li>
          <li><Link to="/contactos">CONTACTOS</Link></li>
        </ul>
      </nav>

      {/* Contenido de la sección Nosotros */}
      <section className="nosotros-content">
        <div className="title-container">
          <h1>NOSOTROS</h1>
          <div className="title-underline"></div>
        </div>
        
        <div className="historia-section">
          <div className="section-image">
            <img src={fabrica} alt="Nuestra distribuidora" />
          </div>
          <div className="section-text">
            <h2>¿Quiénes Somos?</h2>
            <p>
              La Distribuidora de Quesos "Carolina", establecida en la ciudad de El Alto, Urbanización Jaime Paz Zamora, 
              es una empresa familiar especializada en la distribución mayorista de productos queseros, con énfasis en 
              queso mozzarella y sus diversas presentaciones.
            </p>
            <p>
              Hemos consolidado nuestra presencia en el mercado gastronómico de las ciudades de El Alto y La Paz, 
              atendiendo a una diversificada cartera de clientes del sector alimenticio incluyendo pizzerías, 
              restaurantes, hamburgueserías, salchipaperas y mercados informales.
            </p>
            <p>
              Nuestra cadena de suministro se sostiene mediante alianzas estratégicas con 7 proveedores de productos 
              lácteos, permitiéndonos ofrecer aproximadamente 10 diferentes productos queseros en diversas presentaciones, 
              adaptados a las necesidades específicas del sector gastronómico.
            </p>
          </div>
        </div>
        
        <div className="mision-vision-section">
          <div className="mision-container">
            <h2>Misión</h2>
            <p>
              Proveer productos queseros de excelencia al mercado gastronómico paceño, garantizando estándares 
              superiores de calidad a precios competitivos. Nos distinguimos por una distribución estratégicamente 
              optimizada que asegura la frescura de nuestros productos, acompañada de un servicio personalizado 
              que atiende las necesidades específicas de cada cliente, contribuyendo así al fortalecimiento de sus 
              proyectos culinarios y al desarrollo gastronómico de la región.
            </p>
          </div>
          <div className="vision-container">
            <h2>Visión</h2>
            <p>
              Consolidarnos como la empresa líder en distribución y comercialización de queso mozzarella en el 
              departamento de La Paz, reconocida por la excelencia en nuestros productos, la innovación constante 
              en nuestros procesos y la integridad en nuestras relaciones comerciales. Aspiramos a expandir nuestra 
              presencia en el mercado boliviano mediante la diversificación de productos, manteniendo el compromiso 
              inquebrantable con la calidad superior y un servicio al cliente que exceda todas las expectativas.
            </p>
          </div>
        </div>
        
        <div className="logistica-section">
          <div className="section-text">
            <h2>Nuestra Logística</h2>
            <p>
              Hemos implementado un sistema de distribución cronológicamente optimizado:
            </p>
            <ul className="logistica-list">
              <li><span>Lunes y Jueves:</span> Atención de clientes en la ciudad de La Paz</li>
              <li><span>Martes y Viernes:</span> Atención en la ciudad de El Alto</li>
              <li><span>Miércoles:</span> Envíos a destinos turísticos como Caranavi y Copacabana</li>
            </ul>
            <p>
              Además, hemos modernizado nuestras operaciones implementando sistemas de preventa a través de 
              telefonía móvil y WhatsApp, optimizando la planificación de entregas y mejorando la comunicación 
              con nuestros clientes.
            </p>
          </div>
          <div className="section-image">
            <img src={equipo} alt="Nuestro equipo" />
          </div>
        </div>
        
        <div className="valores-section">
          <h2>Nuestros Valores</h2>
          <div className="valores-container">
            <div className="valor-card">
              <h3>Respeto</h3>
              <p>Cultivamos relaciones comerciales fundamentadas en el trato digno y considerado hacia nuestros clientes, proveedores y colaboradores.</p>
            </div>
            <div className="valor-card">
              <h3>Responsabilidad</h3>
              <p>Asumimos el compromiso integral con la excelencia en cada aspecto de nuestra operación, desde la selección hasta la entrega final.</p>
            </div>
            <div className="valor-card">
              <h3>Confianza</h3>
              <p>Construimos vínculos sólidos y duraderos basados en la transparencia y cumplimiento consistente de nuestros compromisos.</p>
            </div>
            <div className="valor-card">
              <h3>Compromiso</h3>
              <p>Nos dedicamos con determinación a superar constantemente las expectativas de nuestros clientes, adaptándonos a sus necesidades.</p>
            </div>
            <div className="valor-card">
              <h3>Calidad</h3>
              <p>Mantenemos estándares rigurosos en la selección y distribución de nuestros productos, garantizando la excelencia.</p>
            </div>
            <div className="valor-card">
              <h3>Servicio</h3>
              <p>Ofrecemos una atención personalizada y proactiva, anticipándonos a las necesidades de nuestros clientes.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NosotrosPage;