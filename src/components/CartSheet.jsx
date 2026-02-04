import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from "react-icons/fi";

const CartSheet = () => {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  const total = getCartTotal();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card-dark rounded-t-[40px] z-70 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="p-8 flex items-center justify-between border-b border-border-light dark:border-border-dark shrink-0">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Your Bag</h2>
                <p className="text-xs font-bold text-primary">{cartItems.length} ITEMS SELECTED</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="bg-gray-100 dark:bg-white/5 p-3 rounded-2xl active:scale-90 transition-transform"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 hide-scrollbar">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <FiShoppingBag className="text-6xl mb-4" />
                  <p className="font-black uppercase tracking-widest text-sm">Bag is Empty</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-6 items-center">
                      <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-border-light dark:border-border-dark">
                        {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" alt={item.name} />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-lg mb-1 leading-tight">{item.name}</h3>
                        <p className="text-primary font-black text-sm mb-2">${Number(item.price).toFixed(2)}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-xl p-1 px-2 border border-border-light dark:border-border-dark">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 active:scale-75 transition-transform"
                            >
                              <FiMinus className="text-xs" />
                            </button>
                            <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 active:scale-75 transition-transform"
                            >
                              <FiPlus className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500/40 hover:text-red-500 p-2 active:scale-90 transition-all"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 pb-12 bg-gray-50 dark:bg-black/20 border-t border-border-light dark:border-border-dark shrink-0">
              <div className="flex justify-between items-center mb-6">
                <span className="text-text-secondary-light font-black uppercase tracking-widest text-xs">Total Amount</span>
                <span className="text-3xl font-black text-primary">${total.toFixed(2)}</span>
              </div>
              <button 
                disabled={cartItems.length === 0}
                onClick={() => {
                  setIsCartOpen(false);
                  navigate("/checkout");
                }}
                className="w-full bg-primary text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              >
                CHECKOUT NOW
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSheet;
