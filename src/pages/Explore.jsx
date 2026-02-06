import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import { FiSearch, FiFilter, FiChevronLeft } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Explore = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get category from query string
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const categories = ["All", "Pizza", "Sushi", "Burgers", "Asian", "Dessert", "Veggies"];

  useEffect(() => {
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

    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("restaurants")
          .select("*")
          .order("rating", { ascending: false });

        if (error) throw error;
        
        const restaurantsWithLogos = await Promise.all(
          (data || []).map(async (restaurant) => {
            const logoUrl = await loadRestaurantLogo(restaurant.id);
            return {
              ...restaurant,
              logo_url: logoUrl || restaurant.logo_url,
            };
          })
        );
        setRestaurants(restaurantsWithLogos);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(r => {
    const query = searchTerm.toLowerCase();
    const isMatchedSearch = (
      r.name.toLowerCase().includes(query) ||
      (r.cuisine && r.cuisine.toLowerCase().includes(query))
    );
    
    const isMatchedCategory = selectedCategory === "All" || 
      (r.cuisine && r.cuisine.toLowerCase().includes(selectedCategory.toLowerCase()));

    return isMatchedSearch && isMatchedCategory;
  });

  return (
    <div className="p-6 pb-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black mb-1 uppercase tracking-tighter">Explore</h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark font-bold text-sm">Discover great eats</p>
        </div>
        {selectedCategory !== "All" && (
          <button 
            onClick={() => setSelectedCategory("All")}
            className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-light" />
          <input
            type="text"
            placeholder="Search restaurants..."
            className="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-6 px-6 mb-8">
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${selectedCategory === cat ? "bg-primary text-white border-primary" : "bg-white dark:bg-card-dark border-border-light dark:border-border-dark"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 dark:bg-white/5 animate-pulse rounded-[40px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((res) => (
                <motion.div
                  key={res.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => navigate(`/restaurant/${res.id}`)}
                  className="bg-white dark:bg-card-dark rounded-[40px] overflow-hidden border border-border-light dark:border-border-dark shadow-sm active:scale-[0.98] transition-all"
                >
                  <div className="h-44 bg-gray-200 dark:bg-gray-800 relative">
                    {res.logo_url && (
                      <img src={res.logo_url} alt={res.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black">
                      ★ {res.rating || 4.5}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-black text-xl leading-tight">{res.name}</h3>
                      <span className="text-primary font-black text-sm">$$</span>
                    </div>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-bold leading-none">
                      {res.cuisine || "International"} • 20-30 min
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center opacity-30">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-black uppercase tracking-tighter">No results found</h3>
                <p className="font-bold text-sm mt-1">Try adjusting your search or category.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Explore;
