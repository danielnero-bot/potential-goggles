import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FiChevronLeft, FiPlus, FiStar, FiClock, FiInfo, FiMessageSquare, FiSend } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("menu"); // "menu" or "reviews"
  
  // Review Form State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

    const fetchData = async () => {
      try {
        setLoading(true);
        const [resData, menuData, reviewsData] = await Promise.all([
          supabase.from("restaurants").select("*").eq("id", id).single(),
          supabase.from("menu_items").select("*").eq("restaurant_id", id),
          supabase.from("reviews").select("*, user_details(full_name)").eq("restaurant_id", id).order("created_at", { ascending: false })
        ]);

        if (resData.error) throw resData.error;
        
        const logoUrl = await loadRestaurantLogo(resData.data.id);
        setRestaurant({
          ...resData.data,
          logo_url: logoUrl || resData.data.logo_url
        });
        
        setMenuItems(menuData.data || []);
        setReviews(reviewsData.data || []);
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert([
        {
          restaurant_id: id,
          user_id: user.id,
          rating,
          comment,
        }
      ]);

      if (error) throw error;
      
      // Refresh reviews
      const { data } = await supabase
        .from("reviews")
        .select("*, user_details(full_name)")
        .eq("restaurant_id", id)
        .order("created_at", { ascending: false });
      
      setReviews(data || []);
      setShowReviewModal(false);
      setComment("");
    } catch (err) {
      console.error("Review error:", err);
      alert("Failed to post review. Have you already reviewed this spot?");
    } finally {
      setSubmitting(false);
    }
  };

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
            <span className="flex items-center gap-1"><FiStar className="text-primary fill-primary" /> {restaurant?.rating || 4.5} ({reviews.length})</span>
            <span className="flex items-center gap-1"><FiClock className="text-primary" /> 20-30 min</span>
            <span className="flex items-center gap-1"><FiInfo className="text-primary" /> {restaurant?.cuisine || "Gourmet"}</span>
          </div>
          <p className="text-sm font-medium leading-relaxed opacity-60 line-clamp-2">
            {restaurant?.description || "Experience the finest culinary delights at our restaurant. Fresh ingredients, expertly prepared for your enjoyment."}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-white/5 p-1.5 rounded-[20px]">
          <button 
            onClick={() => setActiveTab("menu")}
            className={`flex-1 py-3 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === "menu" ? "bg-white dark:bg-card-dark text-primary shadow-sm" : "opacity-40"}`}
          >
            Menu
          </button>
          <button 
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 py-3 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === "reviews" ? "bg-white dark:bg-card-dark text-primary shadow-sm" : "opacity-40"}`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "menu" ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-6"
            >
              <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter flex items-center gap-2">
                Menu <div className="h-0.5 bg-primary/20 flex-1" />
              </h2>
              {menuItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex gap-4 p-4 bg-white dark:bg-card-dark rounded-3xl border border-border-light dark:border-border-dark group active:scale-[0.98] transition-transform"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                    {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" alt={item.name} />}
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
                        className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/20 active:scale-90 transition-transform"
                      >
                        <FiPlus className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                  Customer Tales <div className="h-0.5 bg-primary/20 flex-1" />
                </h2>
                <button 
                  onClick={() => user ? setShowReviewModal(true) : navigate("/login")}
                  className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Review
                </button>
              </div>

              {reviews.length === 0 ? (
                <div className="py-12 text-center opacity-30">
                  <div className="text-5xl mb-4">✍️</div>
                  <h3 className="text-lg font-black uppercase tracking-tighter">No reviews yet</h3>
                  <p className="font-bold text-xs mt-1">Be the first to share your experience!</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-white dark:bg-card-dark p-6 rounded-[32px] border border-border-light dark:border-border-dark relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                          {rev.user_details?.full_name?.slice(0, 2).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-black text-sm leading-tight">{rev.user_details?.full_name || "Anonymous"}</p>
                          <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar key={s} className={`text-[10px] ${s <= rev.rating ? "text-primary fill-primary" : "opacity-20"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-medium leading-relaxed opacity-70 italic">"{rev.comment}"</p>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-6 pb-8 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full bg-white dark:bg-card-dark rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Share Experience</h3>
                <button onClick={() => setShowReviewModal(false)} className="text-sm font-bold opacity-40">CLOSE</button>
              </div>

              <div className="flex justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)} className="active:scale-90 transition-transform">
                    <FiStar className={`text-3xl ${s <= rating ? "text-primary fill-primary" : "opacity-20"}`} />
                  </button>
                ))}
              </div>

              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the food and service?"
                className="w-full h-32 bg-gray-100 dark:bg-white/5 border-none rounded-[24px] p-5 text-sm font-medium focus:ring-2 focus:ring-primary mb-6"
              />

              <button 
                onClick={handleSubmitReview}
                disabled={submitting || !comment}
                className="w-full bg-primary text-white py-4 rounded-[20px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? "POSTING..." : (
                  <>
                    <FiSend /> POST REVIEW
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RestaurantDetail;
