import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} role="navigation">
      <div className="container nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo" aria-label="KarKora Shop Home">
          <span className="nav-logo-accent">KarKora</span>
          <span className="nav-logo-text"> Shop</span>
        </Link>

        {/* Desktop Links */}
        <ul className="nav-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/shop" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              All Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/shop?category=makeup" className="nav-link">
              Make-up
            </NavLink>
          </li>
          <li>
            <NavLink to="/shop?category=accessories" className="nav-link">
              Accessories
            </NavLink>
          </li>
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="nav-search-form animate-fade-in">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="nav-search-input"
                autoFocus
              />
              <button type="button" className="nav-icon-btn" onClick={() => setSearchOpen(false)} aria-label="Close search">
                ✕
              </button>
            </form>
          ) : (
            <button className="nav-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          )}

          {/* Theme Toggle */}
          <button className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Cart */}
          <Link to="/cart" className="nav-cart-btn" aria-label={`Cart (${cartCount} items)`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="nav-cart-count">{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="nav-mobile-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`hamburger ${menuOpen ? 'open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/shop" onClick={() => setMenuOpen(false)}>All Products</Link></li>
          <li><Link to="/shop?category=makeup" onClick={() => setMenuOpen(false)}>Make-up</Link></li>
          <li><Link to="/shop?category=accessories" onClick={() => setMenuOpen(false)}>Accessories</Link></li>
          <li><Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link></li>
        </ul>
      </div>
    </nav>
  );
}
