import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CartProvider, useCart } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import MobileNav from "./components/MobileNav";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import RestaurantDetail from "./pages/RestaurantDetail";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Orders from "./pages/Orders";
import CartSheet from "./components/CartSheet";
import { FiShoppingBag } from "react-icons/fi";

const AppContent = () => {
  const { getCartItemsCount, setIsCartOpen, getCartTotal } = useCart();
  const itemCount = getCartItemsCount();
  const total = getCartTotal();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 transition-colors duration-500 overflow-x-hidden">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </AnimatePresence>

      <AnimatePresence>
        {itemCount > 0 && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-24 right-6 left-6 z-40 bg-primary text-white p-5 rounded-3xl shadow-2xl shadow-primary/40 flex items-center justify-between font-black transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <FiShoppingBag className="text-2xl" />
                <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-md">
                  {itemCount}
                </span>
              </div>
              <span className="uppercase tracking-widest text-xs">View Bag</span>
            </div>
            <span className="text-xl">${total.toFixed(2)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <CartSheet />
      <MobileNav />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
