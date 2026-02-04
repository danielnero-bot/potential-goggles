import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { FiSearch, FiFilter } from "react-icons/fi";
import { motion } from "framer-motion";

const Explore = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("rating", { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.cuisine && r.cuisine.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">Explore</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark font-bold text-sm">Find the best food near you.</p>
      </div>

      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-light" />
          <input
            type="text"
            placeholder="Search restaurants, cuisines..."
            className="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-primary/10 text-primary p-4 rounded-2xl flex items-center justify-center border border-primary/20">
          <FiFilter />
        </button>
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-gray-100 dark:bg-white/5 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRestaurants.map((res) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(`/restaurant/${res.id}`)}
              className="bg-white dark:bg-card-dark rounded-3xl overflow-hidden border border-border-light dark:border-border-dark shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="h-44 bg-gray-200 dark:bg-gray-800 relative">
                {res.logo_url && (
                  <img src={res.logo_url} alt={res.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black shadow-lg">
                  ★ {res.rating || 4.5}
                </div>
                {res.is_open === false && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-black uppercase">Closed</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-black text-xl leading-tight">{res.name}</h3>
                  <span className="text-primary font-black text-xs">$$$</span>
                </div>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-bold mb-3">
                  {res.cuisine || "International"} • 20-30 min • Free Delivery
                </p>
                <div className="flex gap-2">
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">Best Seller</span>
                  <span className="bg-orange-500/10 text-orange-500 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">Deal</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
