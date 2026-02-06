import React, { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiChevronLeft, FiAlertCircle, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signupError) throw signupError;
      
      // Auto-create user_details entry
      if (data?.user) {
        await supabase.from("user_details").insert([
          { user_id: data.user.id, full_name: fullName }
        ]);
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 flex flex-col">
      <header className="pt-8 mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="bg-white dark:bg-card-dark border border-border-light dark:border-border-dark p-3 rounded-2xl shadow-sm active:scale-90 transition-transform mb-8"
        >
          <FiChevronLeft className="text-xl" />
        </button>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Create<br/>Account</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark font-bold text-sm">Join the Founder community</p>
      </header>

      <form onSubmit={handleSignup} className="space-y-4 flex-1">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold"
          >
            <FiAlertCircle className="shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Full Name</label>
          <div className="relative">
            <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
            <input
              type="text"
              placeholder="Your Name"
              className="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Email Address</label>
          <div className="relative">
            <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Password</label>
          <div className="relative">
            <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-2xl shadow-primary/20 hover:bg-green-600 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 uppercase tracking-widest text-xs"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-8 text-center pb-8 text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark">
        Already have an account? <Link to="/login" className="text-primary uppercase tracking-widest text-xs ml-1">Sign In</Link>
      </div>
    </div>
  );
};

export default Signup;
