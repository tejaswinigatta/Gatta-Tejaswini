import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Priority, SortOption, ViewSection } from '../types/todo';

interface TaskFilterBarProps {
  currentSection: ViewSection;
  onSelectSection: (section: ViewSection) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedPriority: string;
  onSelectPriority: (priority: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  availableCategories: string[];
  counts: {
    all: number;
    today: number;
    pending: number;
    completed: number;
  };
  totalFiltered: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  currentSection,
  onSelectSection,
  selectedCategory,
  onSelectCategory,
  selectedPriority,
  onSelectPriority,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  availableCategories,
  counts,
  totalFiltered,
  onResetFilters,
  hasActiveFilters,
}) => {
  const priorities: { label: string; value: string; dotColor: string }[] = [
    { label: 'All', value: 'all', dotColor: 'bg-neutral-400' },
    { label: 'Urgent', value: 'urgent', dotColor: 'bg-red-500' },
    { label: 'High', value: 'high', dotColor: 'bg-orange-500' },
    { label: 'Medium', value: 'medium', dotColor: 'bg-amber-500' },
    { label: 'Low', value: 'low', dotColor: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-4">
      {/* Top row: Section View Tabs + Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Section View Tabs (All, Today, Pending, Completed) */}
        <div className="flex items-center gap-1 p-1 bg-neutral-200/60 dark:bg-neutral-800/80 rounded-xl overflow-x-auto shrink-0 max-w-full">
          <button
            onClick={() => onSelectSection('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentSection === 'all'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>All Tasks</span>
            <span className="font-mono text-[11px] opacity-75 tabular-nums">({counts.all})</span>
          </button>

          <button
            onClick={() => onSelectSection('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentSection === 'today'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Today's Tasks</span>
            <span className="font-mono text-[11px] opacity-75 tabular-nums">({counts.today})</span>
          </button>

          <button
            onClick={() => onSelectSection('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentSection === 'pending'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Pending</span>
            <span className="font-mono text-[11px] opacity-75 tabular-nums">({counts.pending})</span>
          </button>

          <button
            onClick={() => onSelectSection('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentSection === 'completed'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Completed</span>
            <span className="font-mono text-[11px] opacity-75 tabular-nums">({counts.completed})</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 dark:text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl placeholder:text-neutral-600 dark:placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all text-neutral-900 dark:text-neutral-100"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-600 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-full"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Second row: Categories filter + Priority filter + Sort dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Categories Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mr-1 shrink-0">
            Category:
          </span>
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All Categories
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Priority Filter & Sort Selector */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Priority dropdown / select */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="hidden sm:inline font-medium">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => onSelectPriority(e.target.value)}
              className="text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white cursor-pointer"
            >
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label === 'All' ? 'All Priorities' : `${p.label} Priority`}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <ArrowUpDown className="w-3.5 h-3.5 hidden sm:inline" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white cursor-pointer"
            >
              <option value="due_date">Sort: Due Date</option>
              <option value="priority">Sort: Highest Priority</option>
              <option value="created_desc">Sort: Recently Added</option>
              <option value="alphabetical">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* Clear filters shortcut */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline px-1 py-1 cursor-pointer shrink-0"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Scannable result count bar */}
      <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800/60 font-mono">
        <span>
          Showing <span className="font-semibold text-neutral-900 dark:text-white tabular-nums">{totalFiltered}</span> tasks
        </span>
        {hasActiveFilters && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400">
            Filters applied
          </span>
        )}
      </div>
    </div>
  );
};
