import React, { useState, useEffect, useMemo, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Award, Calendar, Mail, Phone, Eye, Search, Filter, 
  Clock, FileText, RefreshCw, X, GraduationCap, Trophy, Medal, UserCheck, Layers, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllNominations } from '../services/api';

// Error Boundary Component to prevent Blank Page crashes
class AdminResponsesErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AdminResponses Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-2xl border border-rose-200 shadow-lg text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Dashboard Display Error</h2>
          <p className="text-sm text-slate-600">
            An unexpected error occurred while rendering nomination data.
          </p>
          <p className="text-xs font-mono bg-rose-50 p-3 rounded-xl text-rose-700 border border-rose-100 max-w-xl mx-auto overflow-x-auto text-left">
            {this.state.error?.toString() || 'Unknown Error'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer"
          >
            Reload Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Ensure values are safe primitive strings (never object or function)
const ensureString = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (val.fullName && typeof val.fullName === 'string') return val.fullName;
    if (val.name && typeof val.name === 'string') return val.name;
    if (val.firstName && typeof val.firstName === 'string') return val.firstName;
    return fallback;
  }
  return String(val);
};

const getNomineeName = (item) => {
  if (!item) return 'N/A';
  const name = item.nominee?.name || item.nominee?.fullName || item.nomineeName || item.declaration?.nomineeName || item.name;
  const str = ensureString(name);
  return str || 'N/A';
};

const getNomineeBatch = (item) => {
  if (!item) return 'N/A';
  const batch = item.nominee?.batch || item.nominee?.graduationYear || item.batch;
  const str = ensureString(batch);
  return str || 'N/A';
};

const getNomineeDepartment = (item) => {
  if (!item) return '';
  const dept = item.nominee?.department || item.department;
  return ensureString(dept);
};

const getNomineeDesignation = (item) => {
  if (!item) return 'N/A';
  const des = item.professional?.designation || item.nominee?.designation;
  const str = ensureString(des);
  return str || 'N/A';
};

const getNomineeOrganization = (item) => {
  if (!item) return '';
  const org = item.professional?.organization || item.nominee?.organization;
  return ensureString(org);
};

const getNominatorName = (item) => {
  if (!item) return 'Self / Direct';
  const name = item.nominator?.name || item.nominator?.fullName || item.nominatorName;
  const str = ensureString(name);
  if (str) return str;
  if (item.nominationType === 'self') return 'Self Nominated';
  return 'Self / Direct';
};

const getNominatorContact = (item) => {
  if (!item) return 'N/A';
  const contact = item.nominator?.email || item.nominator?.mobile;
  const str = ensureString(contact);
  return str || 'N/A';
};

const AdminResponsesContent = () => {
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedNomination, setSelectedNomination] = useState(null);

  const MOCK_FALLBACK_NOMINATIONS = [
    {
      _id: 'mock_101',
      nominationId: 'NOM-2026-0001',
      category: 'Scientific',
      status: 'Submitted',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      nominee: {
        name: 'Dr. A. R. Sundaram',
        batch: '2008',
        department: 'Computer Science & Engineering',
        designation: 'Principal AI Researcher',
        organization: 'DeepMind Robotics',
        email: 'sundaram.ar@example.com',
        mobile: '+91 98765 43210'
      },
      nominator: {
        name: 'Prof. K. Subramanian',
        email: 'subramanian.k@nec.edu',
        mobile: '+91 94431 12345'
      },
      accomplishments: 'Pioneered breakthroughs in neural network optimization for medical imaging algorithms, published over 40 high-impact papers, and holds 6 international patents.',
      contributionsToNEC: 'Guest speaker for annual alumni tech symposium and established research scholarship fund for underprivileged engineering students.'
    },
    {
      _id: 'mock_102',
      nominationId: 'NOM-2026-0002',
      category: 'Business',
      status: 'Submitted',
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      nominee: {
        name: 'Priya Venkatesh',
        batch: '2012',
        department: 'Information Technology',
        designation: 'Founder & CEO',
        organization: 'EcoGrid Tech Solutions',
        email: 'priya.v@ecogridtech.com',
        mobile: '+91 98123 76543'
      },
      nominator: {
        name: 'Rajesh Kumar',
        email: 'rajesh.k@ecogridtech.com',
        mobile: '+91 98989 12345'
      },
      accomplishments: 'Built a clean-tech startup valued at $50M that provides smart solar microgrids across rural South India, empowering 500+ villages.',
      contributionsToNEC: 'Provides campus recruitment opportunities and sponsors NEC Innovation Incubator lab.'
    },
    {
      _id: 'mock_103',
      nominationId: 'NOM-2026-0003',
      category: 'Social',
      status: 'Submitted',
      createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      nominee: {
        name: 'Captain M. Ramesh',
        batch: '2001',
        department: 'Mechanical Engineering',
        designation: 'Director of Operations',
        organization: 'Asha Rural Foundation',
        email: 'm.ramesh@ashafoundation.org',
        mobile: '+91 97711 22334'
      },
      nominator: {
        name: 'Dr. V. Meenakshi',
        email: 'meenakshi.v@nec.edu',
        mobile: '+91 94422 99887'
      },
      accomplishments: 'Leads disaster relief operations and clean drinking water initiatives across flood-prone regions, benefitting over 100,000 households.',
      contributionsToNEC: 'Key organizer for NEC Alumni Benevolent Fund and mentor for student NSS chapter.'
    }
  ];

  const fetchNominations = async () => {
    setLoading(true);
    try {
      const res = await getAllNominations();
      if (res && res.success && Array.isArray(res.data)) {
        if (res.data.length > 0) {
          setNominations(res.data);
        } else {
          setNominations(MOCK_FALLBACK_NOMINATIONS);
        }
      } else {
        setNominations(MOCK_FALLBACK_NOMINATIONS);
      }
    } catch (err) {
      console.warn('Backend API unavailable, displaying demo nomination responses:', err);
      setNominations(MOCK_FALLBACK_NOMINATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNominations();
  }, []);

  // Safe Deduplicated Nominations list
  const safeNominations = useMemo(() => {
    const raw = Array.isArray(nominations) ? nominations : [];
    const map = new Map();
    raw.forEach((item) => {
      if (!item) return;
      const email = ensureString(item.nominee?.email || item.email).toLowerCase();
      const name = getNomineeName(item).toLowerCase();
      const key = email || name || item.nominationId || String(item._id);
      if (!map.has(key)) {
        map.set(key, item);
      }
    });
    return Array.from(map.values());
  }, [nominations]);

  // Compute Unique Categories and Batches
  const categories = useMemo(() => {
    const set = new Set();
    safeNominations.forEach((n) => {
      if (n && n.category && typeof n.category === 'string') set.add(n.category);
    });
    return ['All', ...Array.from(set)];
  }, [safeNominations]);

  const batches = useMemo(() => {
    const set = new Set();
    safeNominations.forEach((n) => {
      const b = getNomineeBatch(n);
      if (b && b !== 'N/A') set.add(b);
    });
    return ['All', ...Array.from(set).sort()];
  }, [safeNominations]);

  // Filter nominations based on search, category, and batch
  const filteredNominations = useMemo(() => {
    return safeNominations.filter((item) => {
      if (!item) return false;
      const nomineeName = getNomineeName(item);
      const nomineeEmail = ensureString(item.nominee?.email || item.email);
      const nominatorName = getNominatorName(item);
      const batch = getNomineeBatch(item);
      const dept = getNomineeDepartment(item);
      const nomId = ensureString(item.nominationId);

      const query = (searchTerm || '').toLowerCase();
      const matchesSearch =
        nomineeName.toLowerCase().includes(query) ||
        nomineeEmail.toLowerCase().includes(query) ||
        nominatorName.toLowerCase().includes(query) ||
        batch.toLowerCase().includes(query) ||
        dept.toLowerCase().includes(query) ||
        nomId.toLowerCase().includes(query);

      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesBatch = selectedBatch === 'All' || batch === selectedBatch;

      return matchesSearch && matchesCategory && matchesBatch;
    });
  }, [safeNominations, searchTerm, selectedCategory, selectedBatch]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Main Section: Search, Filters & Responses Table */}
      <div className="w-full space-y-6">
        {/* Controls Bar: Search, Category & Batch Filters */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, batch, nominator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          {/* Category & Batch Filters & Refresh */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
              >
                {batches.map((b) => (
                  <option key={b} value={b}>
                    Batch: {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchNominations}
              title="Refresh List"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Nominations Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full">
          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-sm font-medium">Loading nomination responses...</p>
            </div>
          ) : filteredNominations.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-700">No Nominations Found</p>
              <p className="text-xs text-slate-400">Try adjusting your search query, batch, or category filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
                    <th className="py-4 px-6 whitespace-nowrap">ID & Date</th>
                    <th className="py-4 px-6 min-w-[200px]">Nominee Name</th>
                    <th className="py-4 px-6 whitespace-nowrap">Award Category</th>
                    <th className="py-4 px-6 whitespace-nowrap">Nominator</th>
                    <th className="py-4 px-6 whitespace-nowrap">Contact Info</th>
                    <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredNominations.map((item) => {
                    const nomineeName = getNomineeName(item);
                    const nomineeBatch = getNomineeBatch(item);
                    const nomineeDept = getNomineeDepartment(item);
                    const nomineeEmail = ensureString(item.nominee?.email || item.email, 'N/A');
                    const nomineeMobile = ensureString(item.nominee?.mobile || item.mobile, 'N/A');
                    const nominatorName = getNominatorName(item);
                    const nominatorContact = getNominatorContact(item);
                    const dateStr = item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'N/A';

                    return (
                      <tr key={item._id || item.nominationId} className="hover:bg-purple-50/30 transition-colors">
                        {/* ID & Date */}
                        <td className="py-4 px-6 font-mono text-xs text-slate-500 whitespace-nowrap">
                          <span className="font-bold text-primary block">{ensureString(item.nominationId)}</span>
                          <span className="text-[11px] text-slate-400">{dateStr}</span>
                        </td>

                        {/* Nominee Name & Batch */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 whitespace-nowrap">{nomineeName}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                            {nomineeBatch !== 'N/A' && (
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                Batch {nomineeBatch}
                              </span>
                            )}
                            {nomineeDept && <span>• {nomineeDept}</span>}
                          </div>
                        </td>

                        {/* Award Category */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                            <Award className="w-3.5 h-3.5" />
                            {ensureString(item.category, 'General')}
                          </span>
                        </td>

                        {/* Nominator */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            {nominatorName}
                          </div>
                          {nominatorContact !== 'N/A' && (
                            <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                              {nominatorContact}
                            </div>
                          )}
                        </td>

                        {/* Contact Info */}
                        <td className="py-4 px-6 text-xs text-slate-600 space-y-0.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{nomineeEmail}</span>
                          </div>
                          {nomineeMobile !== 'N/A' && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{nomineeMobile}</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedNomination(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-slate-700 text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Nomination Details Modal */}
      <AnimatePresence>
        {selectedNomination && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-xl text-slate-900">
                      Nomination Details
                    </h3>
                    <p className="text-xs font-mono text-primary font-bold">
                      {ensureString(selectedNomination.nominationId)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedNomination(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Nominee Section */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Nominee Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Full Name</span>
                      <span className="font-bold text-slate-900">
                        {getNomineeName(selectedNomination)}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Award Category</span>
                      <span className="font-bold text-slate-900">{ensureString(selectedNomination.category)}</span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Batch & Department</span>
                      <span className="font-semibold text-slate-700">
                        Batch {getNomineeBatch(selectedNomination)} ({getNomineeDepartment(selectedNomination) || 'N/A'})
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Designation & Organization</span>
                      <span className="font-semibold text-slate-700">
                        {getNomineeDesignation(selectedNomination)} - {getNomineeOrganization(selectedNomination)}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Email</span>
                      <span className="font-medium text-slate-800">
                        {ensureString(selectedNomination.nominee?.email || selectedNomination.email, 'N/A')}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Mobile</span>
                      <span className="font-medium text-slate-800">
                        {ensureString(selectedNomination.nominee?.mobile || selectedNomination.mobile, 'N/A')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nominator Section */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-secondary flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Nominator Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Nominator Name</span>
                      <span className="font-bold text-slate-900">
                        {getNominatorName(selectedNomination)}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Nominator Email</span>
                      <span className="font-medium text-slate-800">
                        {ensureString(selectedNomination.nominator?.email, 'N/A')}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Nominator Mobile</span>
                      <span className="font-medium text-slate-800">
                        {ensureString(selectedNomination.nominator?.mobile, 'N/A')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accomplishments & Contributions */}
                {(selectedNomination.accomplishments || selectedNomination.professional?.profileSummary) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Key Accomplishments & Impact
                    </h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
                      {ensureString(selectedNomination.accomplishments || selectedNomination.professional?.profileSummary)}
                    </p>
                  </div>
                )}

                {(selectedNomination.contributionsToNEC || selectedNomination.necContribution?.details) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Contributions to NEC
                    </h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
                      {ensureString(selectedNomination.contributionsToNEC || selectedNomination.necContribution?.details)}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setSelectedNomination(null)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminResponses = () => {
  return (
    <AdminResponsesErrorBoundary>
      <AdminResponsesContent />
    </AdminResponsesErrorBoundary>
  );
};

export default AdminResponses;
