import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiPackage, FiHeart, FiSettings, FiChevronRight, FiCreditCard } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const MenuItem = ({ icon: Icon, label, onClick, color = "text-text-light dark:text-text-dark" }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-[24px] active:scale-[0.98] transition-all"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center ${color}`}>
          <Icon className="text-lg" />
        </div>
        <span className="font-bold text-sm tracking-tight">{label}</span>
      </div>
      <FiChevronRight className="opacity-30" />
    </button>
  );

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 pb-24">
      <header className="pt-12 mb-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-[32px] bg-linear-to-br from-primary to-green-600 p-1 mb-6 shadow-2xl shadow-primary/30">
          <div className="w-full h-full bg-background-light dark:bg-background-dark rounded-[28px] flex items-center justify-center overflow-hidden">
            <span className="text-primary font-black text-2xl uppercase">
              {user?.user_metadata?.full_name?.slice(0, 2) || user?.email?.slice(0, 2) || "U"}
            </span>
          </div>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">
          {user?.user_metadata?.full_name || "Foodie"}
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark font-bold text-xs opacity-50 uppercase tracking-widest leading-none">
          {user?.email}
        </p>
      </header>

      <div className="space-y-3">
        <MenuItem icon={FiPackage} label="Order History" onClick={() => navigate("/orders")} />
        <MenuItem icon={FiHeart} label="Favorite Places" onClick={() => navigate("/favorites")} />
        <MenuItem icon={FiCreditCard} label="Payment Methods" onClick={() => {}} />
        <MenuItem icon={FiSettings} label="Settings" onClick={() => {}} />
        <div className="pt-4">
          <MenuItem 
            icon={FiLogOut} 
            label="Log Out" 
            onClick={handleLogout} 
            color="text-red-500"
          />
        </div>
      </div>

      <div className="mt-12 text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
        Quick Plate Mobile App v1.0
      </div>
    </div>
  );
};

export default Profile;
