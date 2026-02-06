import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CartProvider, useCart } from "./context/CartContext";
import MobileNav from "./components/MobileNav";
import Explore from "./pages/Explore";
import RestaurantDetail from "./pages/RestaurantDetail";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";
import Checkout from "./pages/Checkout";
import CartSheet from "./components/CartSheet";
import { FiShoppingBag } from "react-icons/fi";

// Simple Home Page with Category Pills
const Home = () => {
  const [restaurants, setRestaurants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const categories = ["All", "Pizza", "Sushi", "Burgers", "Asian", "Dessert", "Veggies"];
  const navigate = useNavigate();

  React.useEffect(() => {
    const loadRestaurantLogo = async (restaurantId) => {
      try {
        const { data, error } = await supabase.storage
          .from("restaurant-logos")
          .list(restaurantId, { limit: 1 });
        if (error || !data || data.length === 0) return null;
        const { data: urlData } = supabase.storage
          .from("restaurant-logos")
          .getPublicUrl(`${restaurantId}/${data[0].name}`);
        return urlData?.publicUrl;
      } catch { return null; }
    };

    const fetchTopRestaurants = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("restaurants")
          .select("*")
          .order("rating", { ascending: false })
          .limit(5);

        if (error) throw error;
        
        const withLogos = await Promise.all(
          (data || []).map(async (res) => ({
            ...res,
            logo_url: (await loadRestaurantLogo(res.id)) || res.logo_url
          }))
        );
        setRestaurants(withLogos);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopRestaurants();
  }, []);
  
  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h2 className="text-text-secondary-light dark:text-text-secondary-dark font-black text-xs uppercase tracking-widest mb-1 opacity-50">Quick Plate</h2>
          <h1 className="text-2xl font-black flex items-center gap-2">
            San Francisco <span className="text-primary text-[10px] bg-primary/10 px-2 py-1 rounded-full">CHANGE</span>
          </h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-green-600 flex items-center justify-center p-0.5 shadow-lg shadow-primary/20">
          <div className="w-full h-full bg-background-light dark:bg-background-dark rounded-[14px] flex items-center justify-center overflow-hidden">
            <span className="text-primary font-black text-xs">UN</span>
          </div>
        </div>
      </header>

      <section className="mb-10">
        <div className="bg-linear-to-br from-primary to-green-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative z-10">
            <div className="bg-white/20 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 backdrop-blur-md">PROMO CODE: FOUNDER</div>
            <h3 className="text-4xl font-black mb-2 leading-none">FREE<br/>DELIVERY</h3>
            <p className="text-white/80 font-bold text-sm mb-6 max-w-[180px]">Enjoy unlimited free delivery for 30 days.</p>
            <button className="bg-white text-primary px-8 py-3 rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-xl shadow-black/10">
              Claim Now
            </button>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
      </section>

      <section className="mb-10">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-6 px-6">
          {categories.map((cat, i) => (
            <button key={cat} className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-sm transition-all border ${i === 0 ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white dark:bg-card-dark border-border-light dark:border-border-dark"}`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Chef's Choice</h2>
          <span className="text-primary text-xs font-black mb-1 cursor-pointer" onClick={() => navigate('/explore')}>VIEW ALL</span>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-8 -mx-6 px-6 hide-scrollbar">
          {loading ? (
             [1,2].map(i => <div key={i} className="min-w-[300px] h-72 bg-gray-100 dark:bg-white/5 animate-pulse rounded-[40px]" />)
          ) : (
            restaurants.map((res) => (
              <div 
                key={res.id} 
                onClick={() => navigate(`/restaurant/${res.id}`)}
                className="min-w-[300px] bg-white dark:bg-card-dark rounded-[40px] overflow-hidden border border-border-light dark:border-border-dark shadow-sm group active:scale-[0.98] transition-all"
              >
                <div className="h-52 bg-gray-200 dark:bg-gray-800 relative">
                  {res.logo_url && <img src={res.logo_url} className="w-full h-full object-cover" alt={res.name} />}
                  <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black">
                    ★ {res.rating || 4.5}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-black text-2xl mb-1 flex items-center justify-between">
                    {res.name} <span className="text-primary text-sm">$$</span>
                  </h3>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-bold">{res.cuisine || "Gourmet"} • 15-25 min</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

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
          <Route path="/favorites" element={<div className="p-8 text-center pt-32"><div className="text-primary text-5xl mb-6">♥</div><h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">Saved Places</h1><p className="opacity-60 font-medium">Keep track of your favorites here.</p></div>} />
          <Route path="/orders" element={<div className="p-8 text-center pt-32"><div className="text-primary text-5xl mb-6">📦</div><h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">Your Orders</h1><p className="opacity-60 font-medium">No active orders yet.</p></div>} />
          <Route path="/profile" element={<div className="p-8 text-center pt-32"><div className="text-primary text-4xl mb-6 ring-2 ring-primary ring-offset-4 ring-offset-background-light dark:ring-offset-background-dark rounded-full w-20 h-20 flex items-center justify-center mx-auto transition-all">UN</div><h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">User Name</h1><p className="opacity-60 font-medium mb-8 text-sm">premium@membership.com</p><button className="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark py-4 rounded-2xl font-black text-sm hover:bg-gray-100 active:scale-[0.98] transition-all">ACCOUNT SETTINGS</button></div>} />
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
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
};

export default App;
