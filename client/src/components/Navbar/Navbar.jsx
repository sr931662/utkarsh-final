import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './Navbar.module.css';
import { gsap } from 'gsap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  // Example excerpt from inside Navbar
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  // const navigate = useNavigate();
  const toggleRef = React.useRef(null);
  const circleRef = React.useRef(null);
  const iconRef = React.useRef(null);

  // Get user details with fallbacks
  const firstName = user?.name?.split(' ')[0] || 'User';
  const userEmail = user?.email || '';
  const userRole = user?.role || 'guest';
  const lastLogin = user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never';

  // Class combinations
  const userButtonClasses = `${styles.userButton} ${darkMode ? styles.dark : ''}`;
  const dropdownMenuClasses = `${styles.dropdownMenu} ${darkMode ? styles.dark : ''}`;
  const dropdownItemClasses = `${styles.dropdownItem} ${darkMode ? styles.dark : ''}`;
  
  const isHomePage = location.pathname === '/';
  const isAdminPortal = location.pathname.startsWith('/admin');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownOpen && !event.target.closest(`.${styles.userDropdown}`)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  // Logout handler
const handleLogout = async () => {
  try {
    await logout();
  } catch (err) {
    console.error("Logout failed", err);
  }
};

  const handleThemeToggle = () => {
    gsap.to(toggleRef.current, {
      duration: 0.4,
      backgroundColor: !darkMode ? "#334155" : "#e2e8f0",
      ease: "power2.inOut"
    });
    
    gsap.to(circleRef.current, {
      duration: 0.4,
      x: !darkMode ? 24 : 0,
      backgroundColor: !darkMode ? "#1e293b" : "#f8fafc",
      ease: "power2.inOut"
    });
    
    gsap.to(iconRef.current, {
      duration: 0.3,
      rotate: !darkMode ? 90 : 0,
      ease: "power2.inOut"
    });

    toggleDarkMode();
  };

  const renderPublicNavItems = () => (
    <>
      <a href="/#interests" className={styles.navLink}>
        <span className={styles.linkText}>Interests</span>
        <span className={styles.linkHover}></span>
      </a>
      <a href="/#publications" className={styles.navLink}>
        <span className={styles.linkText}>Publications</span>
        <span className={styles.linkHover}></span>
      </a>
      <a href="/#cv" className={styles.navLink}>
        <span className={styles.linkText}>CV</span>
        <span className={styles.linkHover}></span>
      </a>
      <a href="/#contact" className={styles.navLink}>
        <span className={styles.linkText}>Get in touch</span>
        <span className={styles.linkHover}></span>
      </a>
    </>
  );

  const renderAdminNavItems = () => (
    <>
      <Link to="/admin/dashboard" className={styles.navLink}>
        <span className={styles.linkText}>Dashboard</span>
        <span className={styles.linkHover}></span>
      </Link>
    </>
  );

  return (
    <header className={`${styles.header} ${isAdminPortal ? styles.adminHeader : ''} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.container}>
        <Link to={'/'} className={styles.logo}>
          <span className={styles.logoText}>
            {isAdminPortal ? 'Admin' : 'Utkarsh Gupta'}
          </span>
          <span className={styles.logoDot}>.</span>
        </Link>
        
        <nav className={styles.desktopNav}>
          {isAuthenticated ? renderAdminNavItems() : 
           isHomePage ? renderPublicNavItems() : null}
        </nav>

        <div className={styles.controls}>
          {isAuthenticated ? (
            <>
              <div className={styles.userDropdown}>
                <button 
                  className={userButtonClasses}
                  onClick={toggleUserDropdown}
                  aria-expanded={userDropdownOpen}
                  aria-label="User menu"
                >
                  <span className={styles.userGreeting}>
                    Hi, {firstName}
                  </span>
                  <span className={styles.userRoleBadge}>
                    {userRole === 'admin' ? '👑' : '🛡️'}
                  </span>
                  <span className={styles.dropdownIcon}>
                    {userDropdownOpen ? '▲' : '▼'}
                  </span>
                </button>
                
                {userDropdownOpen && (
                  <div className={dropdownMenuClasses}>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>
                        {user?.name || 'User'}
                      </div>
                      <div className={styles.userEmail}>
                        {userEmail}
                      </div>
                      <div className={styles.userMeta}>
                        <span className={styles.userRole}>
                          Role: {userRole}
                        </span>
                        <span className={styles.userLastLogin}>
                          Last login: {lastLogin}
                        </span>
                      </div>
                    </div>
                    <button 
                      className={dropdownItemClasses}
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <Link to="/" className={styles.viewPublicSite}>
                View Public Site
              </Link>
            </>
          ) : isAdminPortal ? (
            <Link to="/" className={styles.viewPublicSite}>
              View Public Site
            </Link>
          ) : null}
          
          <div className={styles.themeToggleContainer}>
            <button 
              ref={toggleRef}
              className={styles.themeToggle}
              onClick={handleThemeToggle}
              aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            >
              <span ref={circleRef} className={styles.toggleCircle}>
                <span ref={iconRef} className={styles.toggleIcon}>
                  {darkMode ? '🌙' : '☀️'}
                </span>
              </span>
            </button>
          </div>
        </div>
        
        <div 
          className={`${styles.mobileMenuButton} ${mobileMenuOpen ? styles.open : ''}`} 
          onClick={toggleMobileMenu}
          aria-label="Mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </div>
      </div>
      
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuContainer}>
          {isAuthenticated ? (
            <>
              <div className={styles.mobileUserInfo}>
                <div className={styles.mobileUserName}>
                  {user?.name || 'User'}
                </div>
                <div className={styles.mobileUserEmail}>
                  {userEmail}
                </div>
                <div className={styles.mobileUserMeta}>
                  <span>Role: {userRole}</span>
                  <span>Last login: {lastLogin}</span>
                </div>
              </div>
              <Link to="/admin/dashboard" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
                <span className={styles.mobileLinkText}>Dashboard</span>
              </Link>
              <button 
                className={styles.mobileNavLink} 
                onClick={() => {
                  handleLogout();
                  toggleMobileMenu();
                }}
              >
                <span className={styles.mobileLinkText}>Logout</span>
              </button>
              <Link to="/" className={styles.mobileViewPublic} onClick={toggleMobileMenu}>
                <span className={styles.mobileLinkText}>View Public Site</span>
              </Link>
            </>
          ) : isHomePage ? (
            <>
              <a href="/#interests" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
                <span className={styles.mobileLinkText}>Interests</span>
              </a>
              <a href="/#publications" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
                <span className={styles.mobileLinkText}>Publications</span>
              </a>
              <a href="/#cv" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
                <span className={styles.mobileLinkText}>CV</span>
              </a>
              <a href="/#contact" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
                <span className={styles.mobileLinkText}>Get in touch</span>
              </a>
            </>
          ) : null}

          <button 
            className={styles.mobileThemeToggle}
            onClick={() => {
              handleThemeToggle();
              toggleMobileMenu();
            }}
          >
            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
