import React, { useState, useEffect } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useLocation, Link } from 'react-router-dom';
import {
  MdMenu,
  MdClose,
  MdDashboard,
  MdPeople,
  MdCellTower,
  MdEventSeat,
  MdAnalytics,
  MdContactless,
  MdSettings
} from 'react-icons/md';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}

const NavBar: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(!isMobile); // Open on desktop, closed on mobile
  const location = useLocation();
  const backgroundColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'secondary');

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: MdDashboard },
    { label: 'Users', path: '/users', icon: MdPeople },
    { label: 'Alerts', path: '/alerts', icon: MdCellTower },
    { label: 'Events', path: '/events', icon: MdEventSeat },
    { label: 'Content', path: '/content', icon: MdContactless },
    { label: 'Analytics', path: '/analytics', icon: MdAnalytics },
    { label: 'System', path: '/system', icon: MdSettings },
  ];

  const isActive = (path: string) => {
    if (path === '/users') {
      return location.pathname.startsWith('/users');
    }
    if (path === '/alerts') {
      return location.pathname.startsWith('/alerts');
    }
    if (path === '/events') {
      return location.pathname.startsWith('/events');
    }
    if (path === '/content') {
      return location.pathname.startsWith('/content');
    }
    if (path === '/analytics') {
      return location.pathname.startsWith('/analytics');
    }
    if (path === '/system') {
      return location.pathname.startsWith('/system');
    }
    return location.pathname === path;
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Don't change isOpen state automatically on resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Menu Toggle Button - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 left-4 z-50 p-2 rounded-lg transition-colors backdrop-blur-md border border-white border-opacity-20"
        style={{ backgroundColor: `${backgroundColor}40`}}
        aria-label="Toggle menu"
      >
        {isOpen ? <MdClose size={24} color={textColor} /> : <MdMenu size={24} color={textColor}/>}
      </button>

      {/* Mobile Overlay - Only on mobile when open */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30"
          style={{ backgroundColor: `${backgroundColor}60` }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        style={{
          width: isOpen ? '240px' : '76px',
          backgroundColor: `${backgroundColor}`,
        }}
        className={`
          ${isMobile ? 'fixed' : 'static'}
          ${isMobile ? 'left-0 top-0' : ''}
          h-screen
          z-40
          transition-all duration-300 ease-in-out
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}
          pt-4
          px-3
          flex flex-col
          overflow-hidden
        `}
      >
        {/* Logo/Title - Hide on collapsed desktop */}
        {(!isMobile && isOpen) || isMobile ? (
          <div className="mb-4 ml-12 mt-3 items-center">
            <h1 style={{ color: secondaryColor }} className="text-l font-bold font-poppins text-nowrap">
            TaraG Admin
            </h1>
          </div>
        ) : (
          <div className="mb-4 h-10" />
        )}
        
        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setIsOpen(false)}
                title={!isOpen && !isMobile ? item.label : ''}
                style={{
                  backgroundColor: active ? `${secondaryColor}40` : 'transparent',
                  borderColor: active ? `${secondaryColor}60` : 'transparent',
                  color: active ? secondaryColor : textColor,
                }}
                className={`
                  flex items-center gap-3
                  px-3 py-3
                  rounded-lg
                  text-nowrap
                  transition-all duration-200
                  hover:opacity-80
                  font-poppins text-sm
                  ${!isOpen && !isMobile ? 'justify-center' : ''}
                  backdrop-blur-sm border border-white border-opacity-10
                `}
              >
                <Icon size={22} color={active ? secondaryColor : textColor} />
                {(isOpen || isMobile) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default NavBar;
