import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const categories = ["All", "Pizza", "Sushi", "Burgers", "Asian", "Dessert", "Veggies"];
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

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
  
  const getInitials = (name) => {
    if (!name) return "UN";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getFirstName = (fullName) => {
    if (!fullName) return "Foodie";
    return fullName.split(" ")[0];
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h2 className="text-text-secondary-light dark:text-text-secondary-dark font-black text-xs uppercase tracking-widest mb-1 opacity-50">Quick Plate</h2>
          <h1 className="text-2xl font-black flex flex-col leading-none">
            {user ? (
               <>
                 <span className="text-sm opacity-60 font-bold mb-1">Welcome back,</span>
                 <span className="text-3xl tracking-tighter uppercase">{getFirstName(user.user_metadata?.full_name)}!</span>
               </>
            ) : "Founder Food"}
          </h1>
        </div>
        <div 
          onClick={() => navigate(user ? "/profile" : "/login")}
          className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-green-600 flex items-center justify-center p-0.5 shadow-lg shadow-primary/20 cursor-pointer active:scale-90 transition-transform"
        >
          <div className="w-full h-full bg-background-light dark:bg-background-dark rounded-[14px] flex items-center justify-center overflow-hidden">
            <span className="text-primary font-black text-xs">
              {user ? getInitials(user.user_metadata?.full_name || user.email) : "LOGIN"}
            </span>
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

export default Home;
