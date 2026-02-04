import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FiChevronLeft, FiCreditCard, FiMapPin, FiTruck } from "react-icons/fi";
import { motion } from "framer-motion";

const Checkout = () => {
  const navigate = useNavigate();
  const { getCartTotal, clearCart, setIsCartOpen } = useCart();
  const [success, setSuccess] = useState(false);

  const total = getCartTotal();
  const deliveryFee = 2.99;
  const grandTotal = total + deliveryFee;

  const handlePlaceOrder = () => {
    setSuccess(true);
    setTimeout(() => {
      clearCart();
      setIsCartOpen(false);
      navigate("/");
    }, 3000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background-light dark:bg-background-dark p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-5xl mb-8 shadow-2xl shadow-primary/40"
        >
          ✓
        </motion.div>
        <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">Order Success!</h1>
        <p className="opacity-60 font-medium mb-12">Your delicious meal is being prepared and will be with you shortly.</p>
        <div className="w-full bg-primary/10 border border-primary/20 p-6 rounded-3xl">
          <p className="text-primary font-black uppercase tracking-widest text-xs">Estimated Delivery</p>
          <p className="text-2xl font-black">25 - 35 MINS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32">
      <div className="px-6 pt-12 flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="bg-white dark:bg-card-dark p-3 rounded-2xl border border-border-light dark:border-border-dark active:scale-90 transition-transform">
          <FiChevronLeft className="text-xl" />
        </button>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Checkout</h1>
      </div>

      <div className="px-6 space-y-6">
        {/* Delivery Address */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-[32px] border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black uppercase tracking-widest text-xs opacity-50">Delivery Address</h3>
            <button className="text-primary font-black text-xs">EDIT</button>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-3 rounded-xl text-primary"><FiMapPin /></div>
            <div>
              <p className="font-black">Home</p>
              <p className="text-sm opacity-60 font-medium">123 Emerald St, San Francisco, CA</p>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-[32px] border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black uppercase tracking-widest text-xs opacity-50">Payment Method</h3>
            <button className="text-primary font-black text-xs">EDIT</button>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-3 rounded-xl text-primary"><FiCreditCard /></div>
            <div>
              <p className="font-black"> Pay</p>
              <p className="text-sm opacity-60 font-medium">Linked to Card •••• 4242</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-[32px] border border-border-light dark:border-border-dark">
          <h3 className="font-black uppercase tracking-widest text-xs opacity-50 mb-6">Order Summary</h3>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between font-bold text-sm">
              <span className="opacity-60">Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm">
              <span className="opacity-60">Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-border-light dark:border-border-dark pt-4 flex justify-between">
              <span className="font-black text-lg">Total</span>
              <span className="font-black text-2xl text-primary">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-8 pt-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl">
        <button 
          onClick={handlePlaceOrder}
          className="w-full bg-primary text-white py-5 rounded-[24px] font-black text-lg shadow-2xl shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <FiTruck className="text-xl" />
          PLACE ORDER • ${grandTotal.toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
