import React, { useState, useEffect } from 'react';
import {
  Trophy, Medal, Award, Search, Filter, RefreshCw, Star,
  Building2, GraduationCap, Briefcase, CheckCircle2, ChevronRight, Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getLeaderboard } from '../services/api';

const CATEGORIES = [
  'All',
  'Business',
  'Academic',
  'Research',
  'Social Service',
  'Corporate',
  'Public Service',
  'Innovation & Entrepreneurship',
  'Arts & Culture',
  'Sports',
  'Other'
];

const getName = (item) => item?.nominee?.name || item?.nominee?.fullName || item?.nomineeName || 'Alumni';
const getBatch = (item) => item?.nominee?.batch || item?.batchYear || 'N/A';
const getDept = (item) => item?.nominee?.department || item?.department || 'NEC Alumni';
const getDesig = (item) => item?.professional?.designation || item?.currentDesignation || 'Professional';
const getOrg = (item) => item?.professional?.organization || item?.organization || '';
const getCat = (item) => item?.category || item?.awardCategory || 'General';
const getEmail = (item) => item?.nominee?.email || item?.email || item?.officialEmail || '';
const getPhoto = (item) => item?.documents?.photograph || item?.photographUrl || null;

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const res = await getLeaderboard();
      console.log('Leaderboard response:', res);
      if (res && res.success && Array.isArray(res.data)) {
        setLeaderboard(res.data);
      } else if (Array.isArray(res)) {
        setLeaderboard(res);
      } else if (res && res.data && Array.isArray(res.data.data)) {
        setLeaderboard(res.data.data);
      } else {
        setLeaderboard([]);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      toast.error('Error fetching leaderboard data');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  // Filter leaderboard items
  const filteredData = leaderboard.filter(item => {
    const category = getCat(item);
    const nomineeName = getName(item);
    const department = getDept(item);
    const designation = getDesig(item);
    const org = getOrg(item);
    const batchYear = getBatch(item);

    const matchesCategory = selectedCategory === 'All' || category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      nomineeName.toLowerCase().includes(query) ||
      department.toLowerCase().includes(query) ||
      designation.toLowerCase().includes(query) ||
      org.toLowerCase().includes(query) ||
      String(batchYear).includes(query);

    return matchesCategory && matchesSearch;
  });

  // Helper for rank badge style
  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-extrabold text-xs shadow-sm">
          🥇 Gold Rank #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-200 text-slate-800 border border-slate-300 font-extrabold text-xs shadow-sm">
          🥈 Silver Rank #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-700/20 text-amber-900 border border-amber-600/30 font-extrabold text-xs shadow-sm">
          🥉 Bronze Rank #3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-primary font-bold text-xs">
        #{rank}
      </span>
    );
  };

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary to-purple-900 text-white p-8 md:p-12 shadow-2xl border border-white/10">
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
          <Trophy className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            Verified Alumni Excellence Hall of Fame
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold font-heading tracking-tight leading-tight">
            Notable Alumni <span className="text-amber-300">Leaderboard</span>
          </h1>

          <p className="text-purple-100 text-sm md:text-base leading-relaxed">
            Celebrating our distinguished alumni ranked rigorously by verified professional accomplishments, organizational leadership, and contributions to National Engineering College.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-5 rounded-2xl shadow-premium border border-borderlight bg-white/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, department, batch, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-white"
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold">
            <Filter className="w-4 h-4 text-primary" />
            <span>Category:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white shadow-sm cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={fetchLeaderboardData}
            title="Refresh Leaderboard"
            className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-primary border border-primary/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center rounded-2xl bg-white shadow-sm border border-slate-100">
          <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">Calculating alumni contribution rankings...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-white/70 shadow-sm border border-slate-200 space-y-3">
          <Trophy className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Approved Nominees Found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Once nominations are verified and approved by the admin team, they will automatically appear here on the Leaderboard.
          </p>
        </div>
      ) : (
        /* Full Leaderboard Table */
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-heading text-slate-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Complete Approved Alumni Rankings ({filteredData.length})
          </h2>

          <div className="glass-panel rounded-2xl shadow-premium border border-borderlight overflow-hidden bg-white/90">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6 text-center">Rank</th>
                    <th className="py-4 px-6">Alumni / Nominee</th>
                    <th className="py-4 px-6">Batch & Dept</th>
                    <th className="py-4 px-6">Professional Designation</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6 text-center">Verification Status</th>
                    <th className="py-4 px-6 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredData.map((item, index) => {
                    const rank = index + 1;
                    const nomineeName = getName(item);
                    const batchYear = getBatch(item);
                    const dept = getDept(item);
                    const desig = getDesig(item);
                    const org = getOrg(item);
                    const category = getCat(item);
                    const email = getEmail(item);
                    const photo = getPhoto(item);

                    return (
                      <tr
                        key={item._id || item.nominationId || index}
                        className="hover:bg-purple-50/40 transition-colors"
                      >
                        <td className="py-4 px-6 text-center font-bold">
                          {getRankBadge(rank)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-purple-200 overflow-hidden">
                              {photo ? (
                                <img src={photo} alt={nomineeName} className="w-full h-full object-cover" />
                              ) : (
                                nomineeName.charAt(0)
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-sm">{nomineeName}</span>
                              {email && <span className="text-[11px] text-slate-400">{email}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-800 block">Batch {batchYear}</span>
                          <span className="text-[11px] text-slate-500">{dept}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-800 block">{desig}</span>
                          {org && <span className="text-[11px] text-slate-500">{org}</span>}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-50 text-primary font-bold border border-primary/20 text-[11px]">
                            {category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Verified & Approved
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-base font-extrabold text-primary font-heading">
                            {item.score || 0} pts
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
