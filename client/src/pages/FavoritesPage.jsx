import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle } from "lucide-react";
import { allProfiles } from "./SearchPage";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, { credentials: "omit" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Map favorite DB entries to the dummy profile data
          const favoritedProfiles = data.map(fav => {
            return allProfiles.find(p => String(p.id) === String(fav.target_profile_id));
          }).filter(Boolean); // remove undefined if not found
          setFavorites(favoritedProfiles);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const removeFavorite = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites/toggle`, {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 px-4 md:px-6 py-6 md:py-10">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-[28px] font-extrabold text-text-primary mb-1 flex flex-wrap items-center gap-2">
              Your Favorites <Heart size={24} className="text-rose-600 shrink-0" fill="currentColor" />
            </h1>
            <p className="text-sm text-text-secondary m-0">Profiles you've saved for later</p>
          </div>

          {loading ? (
            <div className="text-center text-text-muted py-20">Loading your favorites...</div>
          ) : favorites.length === 0 ? (
            <div className="bg-card rounded-3xl border border-border-light p-12 text-center max-w-2xl mx-auto mt-10">
              <div className="w-20 h-20 bg-primary-very-light rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Heart size={32} />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-3">No favorites yet</h2>
              <p className="text-text-secondary mb-8">You haven't favorited any profiles. Start exploring and save the ones you like!</p>
              <Link to="/search" className="inline-block py-3 px-8 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-sm transition-all hover:scale-105 no-underline">
                Find Matches
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-[18px]">
              {favorites.map((p) => (
                <div key={p.id} className="bg-card rounded-2xl border border-border-light overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col">
                  {/* Photo */}
                  <div className="h-[200px] relative flex items-center justify-center bg-primary-very-light overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                      {p.online && (
                        <span className="bg-green-500 text-white rounded-md text-[10px] font-bold py-1 px-1.5 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-card" /> Online
                        </span>
                      )}
                    </div>
                    {/* Heart */}
                    <button onClick={() => removeFavorite(p.id)}
                      className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-card border border-border-light cursor-pointer flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
                      <Heart size={16} className="text-rose-600" fill="currentColor" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col min-w-0">
                    <div className="flex items-center gap-1 mb-1 min-w-0">
                      <span className="font-bold text-[15px] text-text-primary truncate">{p.name}, {p.age}</span>
                      <span className="text-primary text-[15px] shrink-0">✓</span>
                    </div>
                    <div className="text-[13px] text-text-secondary mb-2 truncate">{p.profession}</div>
                    <div className="text-[13px] text-text-muted mb-1 flex items-center gap-1.5 min-w-0">
                      <span className="text-base leading-none shrink-0">📍</span> 
                      <span className="truncate">{p.city}</span>
                    </div>
                    
                    <div className="mt-auto pt-4 flex items-center gap-2">
                      <button className="w-9 h-9 rounded-xl border border-border-light bg-card cursor-pointer flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0">
                        <MessageCircle size={16} className="text-text-secondary" />
                      </button>
                      <Link to={`/profile/${p.id}`} className="flex-1 text-center py-2 text-[13px] font-bold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm hover:scale-105 transition-all no-underline">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
