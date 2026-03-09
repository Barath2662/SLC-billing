import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiPlusCircle, FiSearch, FiLogOut, FiUser } from 'react-icons/fi';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { to: '/create-bill', label: 'Create Bill', icon: <FiPlusCircle /> },
    { to: '/search-bills', label: 'Search Bills', icon: <FiSearch /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-primary-900 text-white shadow-lg no-print">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary-900 font-bold text-xs">SLC</span>
            </div>
            <span className="font-bold text-lg hidden sm:block">Srii Lakshmi Cab</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to) ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User & Logout */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-white/80 text-sm">
              <FiUser />
              <span>{user.name || 'Admin'}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center space-x-1 text-white/80 hover:text-white text-sm transition-colors">
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to) ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="flex items-center space-x-1 px-3 py-1 text-white/60 text-sm">
                <FiUser />
                <span>{user.name || 'Admin'}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center space-x-2 px-3 py-2 text-white/80 hover:text-white text-sm w-full">
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
