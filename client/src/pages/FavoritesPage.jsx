import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { authFetch } from "../lib/authFetch";
import { photoUrl } from "../lib/photoUrl";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/favorites`);
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id) => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_profile_id: id })
      });
      if (res.ok) {
        setFavorites(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-[#f8fafc] px-4 md:px-6 py-6 md:py-10 flex items-center justify-center">
        <div className="text-slate-500 font-medium">Loading favorites...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f8fafc] px-4 md:px-6 py-6 md:py-10">
      <div className="w-full max-w-[1200px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[26px] font-extrabold text-slate-800 mb-1">Your Favorites</h1>
            <p className="text-[14px] text-slate-500">Profiles you've saved for later</p>
          </div>
          <div className="text-[13px] font-bold text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            {favorites.length} Saved Profile{favorites.length !== 1 ? 's' : ''}
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="py-12 bg-white rounded-[24px] shadow-sm border border-slate-100 text-center">
            <EmptyState
              icon={Heart}
              title="No Favorites Yet"
              description="When you see a profile you like, tap the heart icon to save it here."
              actionText="Discover Profiles"
              actionLink="/search"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 md:gap-5">
            {favorites.map((p) => (
              <div key={p.id} className="bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 group relative flex flex-col">
                
                {/* Remove Button */}
                <button 
                  onClick={() => removeFavorite(p.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                  title="Remove from favorites"
                >
                  <Heart size={16} fill="currentColor" />
                </button>

                {/* Photo */}
                <div className="h-[200px] relative overflow-hidden bg-slate-100 shrink-0">
                  <img src={photoUrl(p.image) || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="font-extrabold text-[16px] flex items-center gap-2">
                      {p.name}, {p.age}
                      {p.online && <span className="w-2 h-2 rounded-full bg-green-400 border border-white" title="Online" />}
                    </div>
                    <div className="text-[12px] opacity-90 truncate">{p.profession}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-md text-[11px] font-bold">📍 {p.city}</span>
                    <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-md text-[11px] font-bold">🎓 {p.edu ? p.edu.split('·')[0].trim() : "N/A"}</span>
                    <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-md text-[11px] font-bold">🕌 {p.sect}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <Link to={`/profile/${p.id}`} className="flex-1 text-center py-2 text-[13px] font-bold text-[#E91E63] bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors no-underline">
                      View Profile
                    </Link>
                    <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shrink-0">
                      <MessageCircle size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
