import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { FiPackage, FiChevronLeft, FiClock, FiCheckCircle, FiXCircle, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        const { data: ordersData, error } = await supabase
          .from("orders")
          .select(`
            *,
            restaurant:restaurants (name, logo_url)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(ordersData || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Set up real-time subscription
    let channel;
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel("mobile-orders")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
          (payload) => {
            setOrders(prev => prev.map(order => 
              order.id === payload.new.id ? { ...order, status: payload.new.status } : order
            ));
          }
        )
        .subscribe();
    };

    setupRealtime();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [navigate]);

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return { icon: FiCheckCircle, color: "text-green-500", bg: "bg-green-500/10", label: "Delivered" };
      case "cancelled": return { icon: FiXCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Cancelled" };
      case "preparing": return { icon: FiTrendingUp, color: "text-orange-500", bg: "bg-orange-500/10", label: "Preparing" };
      case "pending": return { icon: FiClock, color: "text-blue-500", bg: "bg-blue-500/10", label: "Pending" };
      default: return { icon: FiPackage, color: "text-primary", bg: "bg-primary/10", label: status || "Unknown" };
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 pb-24">
      <header className="pt-8 mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="bg-white dark:bg-card-dark border border-border-light dark:border-border-dark p-3 rounded-2xl shadow-sm active:scale-90 transition-transform mb-8"
        >
          <FiChevronLeft className="text-xl" />
        </button>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Order<br/>History</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark font-bold text-sm">Everything you've enjoyed</p>
      </header>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-white/5 animate-pulse rounded-[32px]" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-20 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl mb-6">
            <FiPackage />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight mb-2">No Orders Yet</h3>
          <p className="text-sm font-medium opacity-50 max-w-[200px] mb-8">Hungry? Explore our restaurants and place your first order.</p>
          <button 
            onClick={() => navigate("/explore")}
            className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
          >
            Start Ordering
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = getStatusInfo(order.status);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-card-dark border border-border-light dark:border-border-dark p-6 rounded-[32px] shadow-sm relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-xl mb-1">{order.restaurant?.name || "Unknown"}</h3>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                      {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={`${status.bg} ${status.color} px-4 py-2 rounded-2xl flex items-center gap-2`}>
                    <status.icon className="text-sm" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-dashed border-border-light dark:border-border-dark">
                  <div>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-2xl font-black text-primary">${Number(order.total_amount).toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/restaurant/${order.restaurant_id}`)}
                    className="bg-gray-100 dark:bg-white/5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    Reorder
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
