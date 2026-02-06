import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiChevronLeft, FiStar, FiMapPin } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          restaurant:restaurants (*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      // Handle logos for favorites
      const favoritesWithLogos = await Promise.all(
        (data || []).map(async (item) => {
          if (!item.restaurant) return null;
          const logoUrl = await loadRestaurantLogo(item.restaurant.id);
          return {
            ...item,
            restaurant: {
              ...item.restaurant,
              logo_url: logoUrl || item.restaurant.logo_url
            }
          };
        })
      );

      setFavorites(favoritesWithLogos.filter(f => f !== null));
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleRemoveFavorite = async (e, favoriteId) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId);
      if (error) throw error;
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    } catch (err) {
      console.error("Error removing favorite:", err);
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
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Saved<br/>Places</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark font-bold text-sm">Your all-time favorites</p>
      </header>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-white/5 animate-pulse rounded-[32px]" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-20 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl mb-6">
            <FiHeart />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight mb-2">No Favorites Yet</h3>
          <p className="text-sm font-medium opacity-50 max-w-[200px] mb-8">Tap the heart icon on any restaurant to save it here.</p>
          <button 
            onClick={() => navigate("/explore")}
            className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
          >
            Explore Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {favorites.map((fav) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => navigate(`/restaurant/${fav.restaurant.id}`)}
                className="bg-white dark:bg-card-dark border border-border-light dark:border-border-dark p-4 rounded-[32px] flex gap-4 active:scale-[0.98] transition-all relative overflow-hidden group"
              >
                <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden">
                  {fav.restaurant.logo_url ? (
                    <img src={fav.restaurant.logo_url} className="w-full h-full object-cover" alt={fav.restaurant.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">🍴</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center py-1">
                  <h3 className="font-black text-lg leading-tight mb-1">{fav.restaurant.name}</h3>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-60">
                    <span className="flex items-center gap-1"><FiStar className="text-primary fill-primary" /> {fav.restaurant.rating || 4.5}</span>
                    <span className="flex items-center gap-1"><FiMapPin /> {fav.restaurant.cuisine || "Gourmet"}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleRemoveFavorite(e, fav.id)}
                  className="absolute top-4 right-4 text-red-500 p-2 rounded-xl bg-red-500/10 active:scale-90 transition-transform"
                >
                  <FiHeart className="fill-red-500" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Favorites;
