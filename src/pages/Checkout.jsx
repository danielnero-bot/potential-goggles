import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FiChevronLeft, FiCreditCard, FiMapPin, FiTruck, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { supabase } from "../supabase";

const Checkout = () => {
  const navigate = useNavigate();
  const { getCartTotal, getGroupedCart, clearCart, setIsCartOpen } = useCart();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [deliveryAddress, setDeliveryAddress] = useState("123 Emerald St, San Francisco, CA");
  const [paymentMethod, setPaymentMethod] = useState("apple_pay");

  const total = getCartTotal();
  const deliveryFee = 2.99;
  const grandTotal = total + deliveryFee;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [navigate]);

  const handlePlaceOrder = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const grouped = getGroupedCart();
    const createdOrderIds = [];

    try {
      // Create an order per restaurant group
      for (const group of grouped) {
        const { restaurant: rest, items, total: groupTotal } = group;

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert([
            {
              user_id: user.id,
              restaurant_id: rest?.id,
              total_amount: groupTotal + (deliveryFee / grouped.length), // Split delivery fee
              status: "pending",
              delivery_address: deliveryAddress,
              payment_method: paymentMethod,
            },
          ])
          .select()
          .single();

        if (orderError) throw orderError;
        createdOrderIds.push(orderData.id);

        const orderItems = items.map((item) => ({
          order_id: orderData.id,
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      setSuccess(true);
      setTimeout(() => {
        clearCart();
        setIsCartOpen(false);
        navigate("/orders");
      }, 3000);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to place order");
      
      // Cleanup partial orders
      if (createdOrderIds.length > 0) {
        await supabase.from("orders").delete().in("id", createdOrderIds);
      }
    } finally {
      setLoading(false);
    }
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
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold">
            <FiAlertCircle className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Delivery Address */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-[32px] border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black uppercase tracking-widest text-xs opacity-50">Delivery Address</h3>
            <button className="text-primary font-black text-xs">EDIT</button>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-3 rounded-xl text-primary"><FiMapPin /></div>
            <div className="flex-1">
              <input 
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full bg-transparent font-black focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-card-dark p-6 rounded-[32px] border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black uppercase tracking-widest text-xs opacity-50">Payment Method</h3>
          </div>
          <div className="space-y-3">
            {[
              { id: 'apple_pay', label: ' Pay', sub: 'Linked to Card •••• 4242' },
              { id: 'card', label: 'Credit Card', sub: 'Visa •••• 9999' }
            ].map(method => (
              <div 
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex gap-4 items-start p-3 rounded-2xl border transition-all cursor-pointer ${paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-transparent'}`}
              >
                <div className={`p-3 rounded-xl ${paymentMethod === method.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                  <FiCreditCard />
                </div>
                <div>
                  <p className="font-black">{method.label}</p>
                  <p className="text-sm opacity-60 font-medium">{method.sub}</p>
                </div>
              </div>
            ))}
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
          disabled={loading}
          className="w-full bg-primary text-white py-5 rounded-[24px] font-black text-lg shadow-2xl shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
             <span className="animate-pulse">PROCESSING...</span>
          ) : (
            <>
              <FiTruck className="text-xl" />
              PLACE ORDER • ${grandTotal.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
