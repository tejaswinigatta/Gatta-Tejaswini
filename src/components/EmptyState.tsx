import React from 'react';
import { CheckCircle2, ClipboardList, Plus, Search, Calendar } from 'lucide-react';
import { ViewSection } from '../types/todo';

interface EmptyStateProps {
  section: ViewSection;
  searchQuery: string;
  selectedCategory: string;
  selectedPriority: string;
  totalTasksInSystem: number;
  onOpenNewTaskModal: () => void;
  onClearFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  section,
  searchQuery,
  selectedCategory,
  selectedPriority,
  totalTasksInSystem,
  onOpenNewTaskModal,
  onClearFilters,
}) => {
  // Case 1: Search query returned nothing
  if (searchQuery) {
    return (
      <div className="py-14 px-4 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30">
        <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center">
          <Search className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
          No tasks found
        </h3>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
          We couldn't find any tasks matching "{searchQuery}". Try searching for something else or clear filters.
        </p>
        <button
          onClick={onClearFilters}
          className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
        >
          Clear search
        </button>
      </div>
    );
  }

  // Case 2: Specific category or priority has no tasks
  if (selectedCategory !== 'all' || selectedPriority !== 'all') {
    return (
      <div className="py-14 px-4 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30">
        <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center">
          <ClipboardList className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
          No matching tasks
        </h3>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
          There are no tasks matching your selected category ({selectedCategory}) and priority filter.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={onClearFilters}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            Clear filters
          </button>
          <button
            onClick={onOpenNewTaskModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-950 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            + Add Task here
          </button>
        </div>
      </div>
    );
  }

  // Case 3: Completed section is empty
  if (section === 'completed') {
    return (
      <div className="py-14 px-4 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30">
        <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
          No completed tasks yet
        </h3>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
          Once you check off pending tasks, they will appear here as your completed track record.
        </p>
      </div>
    );
  }

  // Case 4: Today's Tasks is empty
  if (section === 'today') {
    return (
      <div className="py-14 px-4 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30">
        <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Calendar className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
          No tasks scheduled for today
        </h3>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
          Take a breather or schedule some focus work for today to keep your productivity going strong.
        </p>
        <button
          onClick={onOpenNewTaskModal}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-950 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Plan a Task for Today</span>
        </button>
      </div>
    );
  }

  // Case 5: Pending section is empty
  if (section === 'pending') {
    return (
      <div className="py-14 px-4 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30">
        <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
          All caught up!
        </h3>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
          You don't have any pending tasks right now. Great job keeping your plate clean!
        </p>
        <button
          onClick={onOpenNewTaskModal}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-950 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Task</span>
        </button>
      </div>
    );
  }

  // Case 6: Absolutely no tasks
  return (
    <div className="py-16 px-4 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30">
      <div className="w-12 h-12 mx-auto mb-3.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center">
        <ClipboardList className="w-6 h-6 stroke-[1.8]" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
        No tasks yet
      </h3>
      <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
        Your task list is empty. Add your first task for college, work, or personal goals to get organized!
      </p>
      <button
        onClick={onOpenNewTaskModal}
        className="mt-5 inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-950 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-xs cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Create Your First Task</span>
      </button>
    </div>
  );
};
