import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css";
import logoCircular from "../assets/distribuidora.png";
import bannerFondo from "../assets/banner-mozzarella.png";
import carritoIcon from "../assets/carrito-compra.png";
import userIcon from "../assets/user-icon.png";
import iconoEntrega from "../assets/icons-entrega.png";
import iconoProductos from "../assets/icons-calidad.png";
import iconoHorario from "../assets/icons-horario.png";
import iconoWhatsapp from "../assets/icons-whatsapp.png";
// Importa las imágenes de categorías
import bolitaImg from "../assets/bolita.png";
import barraImg from "../assets/barra.png";
import laminadoImg from "../assets/laminado.png";
// Imagen de ejemplo para producto
import quesoImg from "../assets/cheddar.png";
// Imágenes para ofertas
import pizzaImg from "../assets/pizza.jpg"; // Necesitarás añadir estas imágenes
import hamburguesaImg from "../assets/hamburguesa.jpg";
import iconoOficina from "../assets/iconoOficina.png";
import iconoDistribucion from '../assets/iconoDistribucion.png';
import iconoTelefono from '../assets/Smartphone.png'; // Puedes cambiar esto por un icono apropiado
import iconoEmail from '../assets/Gmail.png'; // Puedes cambiar esto por un icono apropiado
import iconoFacebook from '../assets/Facebook.png';

const HomePage = () => {
  const navigate = useNavigate();

  // Referencias y estados para los carruseles
  const categoryCarouselRef = useRef(null);
  const productCarouselRef = useRef(null);
  const [categoryPosition, setCategoryPosition] = useState(0);
  const [productPosition, setProductPosition] = useState(0);

  // Datos para categorías
  const categories = [
    { id: 1, name: "Bolitas", image: bolitaImg, color: "category-bolitas" },
    { id: 2, name: "Barras", image: barraImg, color: "category-barras" },
    {
      id: 3,
      name: "Laminados",
      image: laminadoImg,
      color: "category-laminados",
    },
    // Puedes añadir más categorías si es necesario
  ];

  // Datos para productos
  const products = [
    {
      id: 1,
      name: "Queso 1",
      brand: "Marca 1",
      image: quesoImg,
      description:
        "Queso cremoso y lleno de sabor, ideal para pastas, pizzas y ensaladas",
      rating: 5,
    },
    {
      id: 2,
      name: "Queso 1",
      brand: "Marca 1",
      image: quesoImg,
      description:
        "Queso cremoso y lleno de sabor, ideal para pastas, pizzas y ensaladas",
      rating: 5,
    },
    {
      id: 3,
      name: "Queso 1",
      brand: "Marca 1",
      image: quesoImg,
      description:
        "Queso cremoso y lleno de sabor, ideal para pastas, pizzas y ensaladas",
      rating: 5,
    },
    // Puedes añadir más productos si es necesario
  ];

  
  // Funciones para mover los carruseles
  const moveCategory = (direction) => {
    const container = categoryCarouselRef.current;
    if (!container) return;

    const itemWidth = 250; // Ancho del item + margen
    const maxPos = -(categories.length * itemWidth - container.clientWidth);

    let newPos =
      categoryPosition + (direction === "left" ? itemWidth : -itemWidth);

    // Límites para que no se desplace más allá del principio o final
    if (newPos > 0) newPos = 0;
    if (newPos < maxPos) newPos = maxPos;

    setCategoryPosition(newPos);
    container.style.transform = `translateX(${newPos}px)`;
  };

  const moveProduct = (direction) => {
    const container = productCarouselRef.current;
    if (!container) return;

    const itemWidth = 300; // Ancho del item + margen
    const maxPos = -(products.length * itemWidth - container.clientWidth);

    let newPos =
      productPosition + (direction === "left" ? itemWidth : -itemWidth);

    // Límites para que no se desplace más allá del principio o final
    if (newPos > 0) newPos = 0;
    if (newPos < maxPos) newPos = maxPos;

    setProductPosition(newPos);
    container.style.transform = `translateX(${newPos}px)`;
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  // Función para generar estrellas de calificación
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className="star">
          {i < rating ? "★" : "☆"}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-title-container">
            <img
              src={logoCircular}
              alt="Distribuidora Carolina"
              className="header-logo"
            />
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
          <li>
            <Link to="/" className="active">
              INICIO
            </Link>
          </li>
          <li>
            <Link to="/nosotros">NOSOTROS</Link>
          </li>
          <li>
            <Link to="/productos">PRODUCTOS</Link>
          </li>
          <li>
            <Link to="/ofertas">OFERTAS</Link>
          </li>
          <li>
            <Link to="/contactos">CONTACTOS</Link>
          </li>
        </ul>
      </nav>

      {/* Banner Principal */}
      <section className="banner-section">
        <div className="banner-container">
          <img
            src={bannerFondo}
            alt="Mozzarella y productos de queso"
            className="banner-image"
          />
          <div className="banner-overlay">
            <div className="banner-content">
              <button className="comprar-button">¡COMPRE AHORA!</button>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Información con Logo y Características */}
      <section className="info-section">
        <div className="info-container">
          <img
            src={logoCircular}
            alt="Logo Distribuidora Carolina"
            className="info-logo"
          />
          <p className="info-description">
            Somos Distribuidora Carolina, tu aliado confiable en la distribución
            de quesos de alta calidad en La Paz y El Alto. Con más de 10
            variedades de productos, atendemos a restaurantes, pizzerías y
            negocios gastronómicos
          </p>

          <div className="info-features">
            <div className="info-feature">
              <img
                src={iconoEntrega}
                alt="Entregas Puntuales"
                className="info-feature-icon"
              />
              <div className="info-feature-text">
                <h3 className="info-feature-title">Entregas Puntuales</h3>
                <p className="info-feature-description">
                  Directamente a tu negocio
                </p>
              </div>
            </div>

            <div className="info-feature">
              <img
                src={iconoProductos}
                alt="Variedad de Productos"
                className="info-feature-icon"
              />
              <div className="info-feature-text">
                <h3 className="info-feature-title">Variedad de Productos</h3>
                <p className="info-feature-description">
                  Quesos Mozzarella, Cheddar, San Javier, etc.
                </p>
              </div>
            </div>

            <div className="info-feature">
              <img
                src={iconoHorario}
                alt="Horarios por Ciudad"
                className="info-feature-icon"
              />
              <div className="info-feature-text">
                <h3 className="info-feature-title">Horarios por Ciudad</h3>
                <p className="info-feature-description">
                  El Alto: Martes y Viernes
                  <br />
                  La Paz: Lunes y Jueves
                </p>
              </div>
            </div>

            <div className="info-feature">
              <img
                src={iconoWhatsapp}
                alt="Preventa WhatsApp"
                className="info-feature-icon"
              />
              <div className="info-feature-text">
                <h3 className="info-feature-title">Preventa WhatsApp</h3>
                <p className="info-feature-description">Pedidos fáciles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrusel de Categorías */}
      <section className="carousel-section">
        <h2 className="carousel-title">Categorías</h2>
        <div className="carousel-container">
          <div
            className="carousel-arrow carousel-arrow-left"
            onClick={() => moveCategory("left")}>
            &lt;
          </div>

          <div className="carousel-items" ref={categoryCarouselRef}>
            {categories.map((category) => (
              <div
                key={category.id}
                className={`category-item ${category.color}`}>
                <div className="category-img">
                  <img src={category.image} alt={category.name} />
                </div>
                <div className="category-name">{category.name}</div>
              </div>
            ))}
          </div>

          <div
            className="carousel-arrow carousel-arrow-right"
            onClick={() => moveCategory("right")}>
            &gt;
          </div>
        </div>

        <div className="separator"></div>

        {/* Carrusel de Productos */}
        <h2 className="carousel-title">Nuestros Productos</h2>
        <div className="carousel-container">
          <div
            className="carousel-arrow carousel-arrow-left"
            onClick={() => moveProduct("left")}>
            &lt;
          </div>

          <div className="carousel-items" ref={productCarouselRef}>
            {products.map((product) => (
              <div key={product.id} className="product-item">
                <div className="product-img">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-brand">{product.brand}</div>
                  <div className="product-description">
                    {product.description}
                  </div>
                  <div className="product-rating">
                    {renderStars(product.rating)}
                  </div>
                </div>
                <div className="product-buttons">
                  <button className="product-btn view-btn">
                    Ver Descripción
                  </button>
                  <button className="product-btn cart-btn">
                    Agregar Al Carrito
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            className="carousel-arrow carousel-arrow-right"
            onClick={() => moveProduct("right")}>
            &gt;
          </div>
        </div>
      </section>

      {/* Sección de Ofertas */}
      <section className="ofertas-section">
        <h2 className="ofertas-title">¡Ofertas!</h2>
        <div className="ofertas-container">
          <div className="oferta-card">
            <div className="oferta-img">
              <img src={pizzaImg} alt="Promoción Pizza" />
            </div>
            <div className="oferta-content oferta-pizza">
              <h3 className="oferta-title">¡Atención!</h3>
              <h4 className="oferta-subtitle">Super Promo</h4>
              <p className="oferta-description">
                Compra 75 unidades de Bolitas, y recibe 1 de regalo
              </p>
              <p className="oferta-valid">Válido hasta el 17 de marzo</p>
              <button className="oferta-btn">Ver más</button>
            </div>
          </div>

          <div className="oferta-card">
            <div className="oferta-img">
              <img src={hamburguesaImg} alt="Promoción Hamburguesa" />
            </div>
            <div className="oferta-content oferta-hamburguesa">
              <h3 className="oferta-title">Promo Hamburguesera</h3>
              <h4 className="oferta-subtitle">Por el mes de Papá</h4>
              <p className="oferta-description">
                Compra 36 unidades de Sandwichero, y recibe 1 de regalo
              </p>
              <p className="oferta-valid">Válido hasta el 30 de marzo</p>
              <button className="oferta-btn">Ver más</button>
            </div>
          </div>
        </div>
      </section>

      <section className="contactos-section" id="contactos">
        <h2 className="contactos-title">Contactos</h2>
        <div className="contactos-container">
          <div className="contactos-logo-container">
            <img
              src={logoCircular}
              alt="Logo Distribuidora Carolina"
              className="contactos-logo"
            />
            <div className="contactos-logo-text">
              DISTRIBUIDORA DE QUESOS CAROLINA
            </div>
          </div>

          <div className="contactos-details">
            <div className="contacto-item">
              <div className="contacto-icon">
                <img src={iconoOficina} alt="Horario" />
              </div>
              <div className="contacto-text">
                <div className="contacto-label">Horario de Atención:</div>
                <div className="contacto-value">08:00 am a 18:00 pm</div>
              </div>
            </div>

            <div className="contacto-item">
              <div className="contacto-icon">
                <img src={iconoDistribucion} alt="Distribución" />
              </div>
              <div className="contacto-text">
                <div className="contacto-label">Días de Distribución:</div>
                <div className="contacto-value">
                  La Paz: Lunes y Jueves
                  <br />
                  El Alto: Martes y Viernes
                </div>
              </div>
            </div>

            <div className="contacto-item">
              <div className="contacto-icon">
                <img src={iconoTelefono} alt="Teléfono" />
              </div>
              <div className="contacto-text">
                <div className="contacto-label">Teléf:</div>
                <div className="contacto-value">
                  +591 76218335
                  <br />
                  +591 77529102
                </div>
              </div>
            </div>

            <div className="contacto-item">
              <div className="contacto-icon">
                <img src={iconoEmail} alt="Email" />
              </div>
              <div className="contacto-text">
                <div className="contacto-label">Correo Electrónico:</div>
                <div className="contacto-value">
                  carloscelsocalderonarroyo@gmail.com
                </div>
              </div>
            </div>
          </div>

          <div className="contactos-sociales-container">
            <div className="seguinos-label">
              Síguenos en nuestras redes sociales
            </div>
            <div className="contactos-sociales">
              <a
                href="https://wa.me/59176218335"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link">
                <img
                  src={iconoWhatsapp}
                  alt="WhatsApp"
                  className="social-icon"
                />
                <span className="social-name">WhatsApp</span>
              </a>
              <a
                href="https://facebook.com/distribuidoracarolina"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link">
                <img
                  src={iconoFacebook}
                  alt="Facebook"
                  className="social-icon"
                />
                <span className="social-name">Facebook</span>
              </a>
            </div>
          </div>

          <div className="contactos-direccion">
            <div
              className="contacto-item"
              style={{ marginTop: "30px", width: "100%" }}>
              <div className="contacto-icon">
                <i
                  className="fas fa-map-marker-alt"
                  style={{ fontSize: "24px", color: "#FFC107" }}></i>
              </div>
              <div className="contacto-text">
                <div className="contacto-label">Dirección:</div>
                <div className="contacto-value">
                  Urb. Jaime Paz Zamora, calle Pantaleón Dalence #114
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
