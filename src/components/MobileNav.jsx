import React from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiSearch, FiHeart, FiShoppingBag, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

const MobileNav = () => {
  const navItems = [
    { icon: <FiHome />, label: "Home", path: "/" },
    { icon: <FiSearch />, label: "Explore", path: "/explore" },
    { icon: <FiHeart />, label: "Liked", path: "/favorites" },
    { icon: <FiShoppingBag />, label: "Orders", path: "/orders" },
    { icon: <FiUser />, label: "Me", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-card-dark/95 backdrop-blur-xl border-t border-border-light dark:border-border-dark pb-[env(safe-area-inset-bottom)] pt-2 z-50">
      <div className="flex justify-around items-center px-4 h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `relative flex flex-col items-center justify-center w-full min-w-[64px] transition-all duration-300 ${
                isActive ? "text-primary" : "text-text-secondary-light dark:text-text-secondary-dark"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  className="text-2xl mb-1"
                >
                  {item.icon}
                </motion.div>
                <span className={`text-[10px] font-extrabold tracking-tight ${isActive ? "opacity-100" : "opacity-60"}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute -top-3 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(56,224,123,0.5)]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
