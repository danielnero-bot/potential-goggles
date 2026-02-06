import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { FiChevronLeft, FiPlus, FiStar, FiClock, FiInfo } from "react-icons/fi";
import { motion } from "framer-motion";

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRestaurantLogo = async (restaurantId) => {
      try {
        const { data, error } = await supabase.storage
          .from("restaurant-logos")
          .list(restaurantId, {
            limit: 1,
          });

        if (error) return null;

        if (data && data.length > 0) {
          const { data: urlData } = supabase.storage
            .from("restaurant-logos")
            .getPublicUrl(`${restaurantId}/${data[0].name}`);

          return urlData?.publicUrl;
        }
        return null;
      } catch {
        return null;
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const [resData, menuData] = await Promise.all([
          supabase.from("restaurants").select("*").eq("id", id).single(),
          supabase.from("menu_items").select("*").eq("restaurant_id", id)
        ]);

        if (resData.error) throw resData.error;
        
        const logoUrl = await loadRestaurantLogo(resData.data.id);
        setRestaurant({
          ...resData.data,
          logo_url: logoUrl || resData.data.logo_url
        });
        
        setMenuItems(menuData.data || []);
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* Header / Hero */}
      <div className="relative h-72">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-12 left-6 z-10 bg-white/90 dark:bg-black/60 backdrop-blur-md p-3 rounded-2xl shadow-xl active:scale-90 transition-transform"
        >
          <FiChevronLeft className="text-xl" />
        </button>
        <img 
          src={restaurant?.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"} 
          className="w-full h-full object-cover" 
          alt={restaurant?.name}
        />
        <div className="absolute inset-0 bg-linear-to-t from-background-light dark:from-background-dark via-transparent to-transparent" />
      </div>

      <div className="px-6 -mt-16 relative z-10 pb-32">
        <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-2xl shadow-black/5 border border-border-light dark:border-border-dark mb-8">
          <h1 className="text-3xl font-black mb-2 leading-tight uppercase tracking-tighter">{restaurant?.name}</h1>
          <div className="flex items-center gap-4 text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark mb-4">
            <span className="flex items-center gap-1"><FiStar className="text-primary fill-primary" /> {restaurant?.rating || 4.5}</span>
            <span className="flex items-center gap-1"><FiClock className="text-primary" /> 20-30 min</span>
            <span className="flex items-center gap-1"><FiInfo className="text-primary" /> Info</span>
          </div>
          <p className="text-sm font-medium leading-relaxed opacity-80 line-clamp-2">
            {restaurant?.description || "Experience the finest culinary delights at our restaurant. Fresh ingredients, expertly prepared for your enjoyment."}
          </p>
        </div>

        <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter flex items-center gap-2">
          Menu <div className="h-0.5 bg-primary/20 flex-1" />
        </h2>

        <div className="grid gap-6">
          {menuItems.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 p-4 bg-white dark:bg-card-dark rounded-3xl border border-border-light dark:border-border-dark group"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                {item.image_url && <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />}
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-black text-lg mb-1 leading-tight">{item.name}</h3>
                  <p className="text-xs font-medium opacity-60 line-clamp-1">{item.description}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-black text-primary">${Number(item.price).toFixed(2)}</span>
                  <button 
                    onClick={() => addToCart(item, restaurant)}
                    className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/20 active:scale-90 transition-transform flex items-center justify-center"
                  >
                    <FiPlus className="text-lg font-bold" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
