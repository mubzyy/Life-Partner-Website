import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, UserX, Unlock } from "lucide-react";
import { authFetch } from "../lib/authFetch";

const BlockedUsersPage = () => {
  const navigate = useNavigate();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/blocks`);
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (blockedId) => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/blocks/${blockedId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setBlockedUsers(prev => prev.filter(u => u.id !== blockedId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f8fafc]">
      <div className="w-full max-w-[800px] mx-auto px-4 py-6 md:py-10">
        
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate("/settings")} 
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-[24px] font-extrabold text-slate-800 m-0 leading-tight">Blocked Users</h1>
            <p className="text-[13px] text-slate-500 m-0">Manage users you have blocked from contacting you.</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden p-6">
            {loading ? (
                <div className="text-center text-slate-500 py-10">Loading blocked users...</div>
            ) : blockedUsers.length === 0 ? (
                <div className="text-center py-10">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <UserX size={32} />
                    </div>
                    <h3 className="text-[16px] font-bold text-slate-800 mb-2">No Blocked Users</h3>
                    <p className="text-[14px] text-slate-500">You haven't blocked anyone yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {blockedUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-[16px] hover:border-slate-200 transition-colors">
                            <div className="flex items-center gap-4">
                                <img src={user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                                <div>
                                    <h4 className="font-bold text-slate-800 text-[15px] m-0">{user.name}</h4>
                                    <p className="text-[12px] text-slate-500 m-0">{user.location}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => unblockUser(user.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-bold rounded-[10px] transition-colors"
                            >
                                <Unlock size={14} /> Unblock
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BlockedUsersPage;
