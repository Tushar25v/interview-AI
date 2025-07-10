import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Bot, BarChart3, Code, Github, LogOut, User, UserPlus, LogIn, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import AuthModal from './AuthModal';

interface HeaderProps {
  onReset?: () => void;
  showReset?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onReset, showReset = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignInClick = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleTitleClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
  };

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent py-4 sm:py-6">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-none">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:scale-105 transition-transform duration-200" onClick={handleTitleClick}>
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 opacity-50 blur-sm"></div>
              <div className="relative p-1 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500">
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-purple-400" />
                </div>
              </div>
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300 bg-clip-text text-transparent font-display tracking-tight hover:from-cyan-200 hover:via-purple-300 hover:to-pink-200 transition-all duration-200">AI Interviewer</h1>
          </div>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center gap-4 lg:gap-6 xl:gap-8">
              {/* Social Links */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <a 
                  href="https://github.com/Ranjit2111" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/20 group"
                >
                  <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/ranjit-n/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:shadow-blue-500/20 group"
                >
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
              
              {/* Authentication Section */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* User info and logout */}
                {user ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="glass-effect rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-300 truncate max-w-24 sm:max-w-none">{user.name || user.email}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleLogout}
                      className="border-white/10 bg-black/20 hover:bg-red-900/20 hover:border-red-500/50 text-gray-300 hover:text-red-300 transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                    <button
                      onClick={handleSignInClick}
                      className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 text-white/80 hover:text-white bg-transparent hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-lg transition-all duration-300 text-xs sm:text-sm"
                    >
                      <LogIn size={14} className="sm:w-4 sm:h-4" />
                      <span className="font-medium">Sign In</span>
                    </button>
                    <button
                      onClick={handleSignUpClick}
                      className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                    >
                      <UserPlus size={14} className="sm:w-4 sm:h-4" />
                      <span>Sign Up</span>
                    </button>
                  </div>
                )}
                
                {showReset && (
                  <Button 
                    variant="outline" 
                    onClick={onReset}
                    className="border-white/10 bg-black/20 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all duration-300 font-medium text-xs sm:text-sm px-2 sm:px-4"
                  >
                    New Interview
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-black/30 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/20 z-50"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300" />
              )}
            </button>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {isMobile && isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-40 min-h-screen sm:min-h-0">
            <div className="container mx-auto p-4 sm:p-6 space-y-6">
              {/* Mobile Auth Section */}
              <div className="space-y-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="glass-effect rounded-xl px-4 py-3 flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-300 truncate">{user.name || user.email}</span>
                    </div>
                    {showReset && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          onReset?.();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full border-white/10 bg-black/20 hover:bg-white/10 hover:border-purple-500/50 text-gray-300 hover:text-purple-300 transition-all duration-300"
                      >
                        New Interview
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full border-white/10 bg-black/20 hover:bg-red-900/20 hover:border-red-500/50 text-gray-300 hover:text-red-300 transition-all duration-300"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        handleSignInClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-3 px-6 py-4 text-gray-300 hover:text-white bg-black/30 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-cyan-500/30 rounded-xl transition-all duration-300"
                    >
                      <LogIn size={18} />
                      <span className="font-medium">Sign In</span>
                    </button>
                    <button
                      onClick={() => {
                        handleSignUpClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg transition-all duration-300"
                    >
                      <UserPlus size={18} />
                      <span>Sign Up</span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile Social Links */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400 mb-3 text-center">Connect with us</p>
                <div className="flex justify-center space-x-4">
                  <a 
                    href="https://github.com/Ranjit2111" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 rounded-full bg-black/30 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Github className="h-5 w-5 text-gray-400 hover:text-cyan-400 transition-colors" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/ranjit-n/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 rounded-full bg-black/30 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};

export default Header;
