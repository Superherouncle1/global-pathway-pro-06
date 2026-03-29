import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Globe, LogIn, LogOut, User, Shield, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import { hapticFeedback } from "@/hooks/use-native";

const navItems = [
  { label: "Home", path: "/" },
  { label: "My Space", path: "/your-space" },
  { label: "Community", path: "/community" },
  { label: "Pricing", path: "/pricing" },
  { label: "About Us", path: "/about" },
];


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">GlobalGenie</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            if (item.path === "/your-space") {
              return (
                <React.Fragment key={item.path}>
                  <Link
                    to="/gini"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      location.pathname === "/gini"
                        ? "bg-primary text-primary-foreground"
                        : "gradient-hero text-primary-foreground shadow-soft hover:shadow-hover"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" /> GINIE
                  </Link>
                  <Link
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                </React.Fragment>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === "/admin"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Shield className="w-4 h-4" /> Admin
            </Link>
          )}

          {user ? (
            <button
              onClick={handleSignOut}
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          ) : (
            <Link
              to="/auth"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium gradient-hero text-primary-foreground flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => { hapticFeedback("light"); setIsOpen(!isOpen); }}
          className="md:hidden p-2 rounded-lg hover:bg-muted text-foreground"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => {
                if (item.path === "/your-space") {
                  return (
                    <React.Fragment key={item.path}>
                      <Link
                        to="/gini"
                        onClick={() => { hapticFeedback("light"); setIsOpen(false); }}
                        className={`px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                          location.pathname === "/gini"
                            ? "bg-primary text-primary-foreground"
                            : "gradient-hero text-primary-foreground"
                        }`}
                      >
                        <Sparkles className="w-4 h-4" /> GINIE — AI Genius
                      </Link>
                      <Link
                        to={item.path}
                        onClick={() => { hapticFeedback("light"); setIsOpen(false); }}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          location.pathname === item.path
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </React.Fragment>
                  );
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    location.pathname === "/admin"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}

              {user ? (
                <button
                  onClick={() => { handleSignOut(); setIsOpen(false); }}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium gradient-hero text-primary-foreground text-center flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
