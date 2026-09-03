import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  CheckCircle2,
  Building,
  Award,
  Calendar,
  DollarSign
} from 'lucide-react';
import { allOpportunities, categories } from '../../data/opportunitiesData';

export default function OpportunitiesView({ onToast }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter Data
  const filteredData = useMemo(() => {
    return allOpportunities.filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchQuery = !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.eligibility.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const handleSelectRow = (item) => {
    setSelectedItem(item);
  };

  const handleApply = (item) => {
    const trackingHash = 'PU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    onToast({
      type: 'success',
      title: 'Application Dispatched!',
      message: `Registered for "${item.name}". Tracking Hash: #${trackingHash}. Verified Passport attached.`
    });
  };

  return (
    <div className="space-y-4">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#1A2235] p-5 rounded-2xl border border-zinc-200 dark:border-white/[0.07]">
        <div>
          <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Bharat Opportunities Catalog
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#94A3B8] mt-0.5">
            68 Curated Central JR Posts, ICMR Grants, Medical Fests, Clinical Quizzes & Observerships.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald bg-emerald/10 border border-emerald/20 px-2.5 py-1 rounded-full">
            {filteredData.length} Opportunities
          </span>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.07] px-2.5 py-1 rounded-full">
            NMC / ICMR Verified
          </span>
        </div>
      </div>

      {/* Toolbar: Search and Filter Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, hospital/institute, or eligibility..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald/40"
          />
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald text-navy-950 font-bold shadow-sm'
                  : 'bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] text-zinc-600 dark:text-[#94A3B8] hover:bg-zinc-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Table (2/3 when selected, full otherwise) + Investigation Drawer (1/3) */}
      <div className="flex gap-4 items-start transition-all duration-300">
        {/* Primary Data Table */}
        <div
          className={`transition-all duration-300 bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl overflow-hidden shadow-sm ${
            selectedItem ? 'w-full lg:w-2/3' : 'w-full'
          }`}
        >
          <div className="overflow-x-auto max-h-[560px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-[#151D2D] z-10 border-b border-zinc-200 dark:border-white/[0.07] text-zinc-500 dark:text-[#94A3B8] font-bold text-[10.5px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Opportunity</th>
                  <th className="p-3 hidden md:table-cell">Organizer</th>
                  <th className="p-3 hidden sm:table-cell">Category</th>
                  <th className="p-3">Credits</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.05] text-zinc-700 dark:text-zinc-200">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-400">
                      No matching opportunities found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleSelectRow(item)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-900/30 font-medium text-blue-900 dark:text-blue-200'
                            : 'hover:bg-zinc-50 dark:hover:bg-white/[0.025]'
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-zinc-400 dark:text-[#94A3B8] truncate max-w-xs">
                            {item.eligibility}
                          </div>
                        </td>
                        <td className="p-3 hidden md:table-cell text-zinc-600 dark:text-[#94A3B8] text-[11px] truncate max-w-[180px]">
                          {item.organizer}
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-xs font-bold text-amber-500">
                            +{item.pulse_credits_suggested} PC
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(item);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-emerald/10 text-emerald hover:bg-emerald hover:text-navy-950 transition-colors"
                          >
                            Apply
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-3 border-t border-zinc-200 dark:border-white/[0.07] bg-zinc-50/60 dark:bg-[#151D2D]/60 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 font-mono font-semibold text-zinc-700 dark:text-zinc-200">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Investigation & Details Side Panel (w-1/3) */}
        {selectedItem && (
          <div className="w-full lg:w-1/3 bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.12] rounded-xl p-5 shadow-lg relative animate-fadeIn">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
            >
              <X size={16} />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded-full">
              {selectedItem.category}
            </span>

            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100 mt-2.5 leading-snug">
              {selectedItem.name}
            </h3>

            <div className="space-y-3 my-4 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.05] rounded-lg">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                  <Building size={13} />
                  <span>Host Institution / Organizer</span>
                </div>
                <p className="text-zinc-800 dark:text-zinc-200 font-medium">{selectedItem.organizer}</p>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.05] rounded-lg">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                  <CheckCircle2 size={13} className="text-emerald" />
                  <span>Eligibility Criteria</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300">{selectedItem.eligibility}</p>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.05] rounded-lg">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                  <Award size={13} className="text-amber-500" />
                  <span>Prize, Stipend or Certification</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300">{selectedItem.prize_or_certificate}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.05] rounded-lg">
                  <span className="text-[10px] text-zinc-400 uppercase">Typical Window</span>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedItem.typical_month || 'Rolling'}</p>
                </div>
                <div className="p-2.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.05] rounded-lg">
                  <span className="text-[10px] text-zinc-400 uppercase">Registration Fee</span>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {typeof selectedItem.fee_inr === 'number' ? `₹${selectedItem.fee_inr}` : selectedItem.fee_inr}
                  </p>
                </div>
              </div>

              {selectedItem.notes && (
                <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8] italic">
                  Note: {selectedItem.notes}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100 dark:border-white/[0.07]">
              <button
                onClick={() => handleApply(selectedItem)}
                className="w-full py-2.5 px-4 bg-emerald hover:bg-emerald-dark text-navy-950 font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                1-Click Apply with Verified Passport
              </button>
              <a
                href={selectedItem.website}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-4 flex items-center justify-center gap-1.5 bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-white/[0.08] transition-all"
              >
                <span>Visit Official Website</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
