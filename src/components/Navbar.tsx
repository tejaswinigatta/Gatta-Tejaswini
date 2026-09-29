import React from 'react';
import { CheckSquare, Moon, Sun, Plus, RotateCcw, Bot } from 'lucide-react';
import { ViewSection } from '../types/todo';

interface NavbarProps {
  currentSection: ViewSection;
  onSelectSection: (section: ViewSection) => void;
  onOpenNewTaskModal: () => void;
  onOpenChat?: () => void;
  onResetDemo: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  counts: {
    all: number;
    today: number;
    pending: number;
    completed: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onSelectSection,
  onOpenNewTaskModal,
  onOpenChat,
  onResetDemo,
  theme,
  onToggleTheme,
  counts,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200/80 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shadow-xs">
            <CheckSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <button
            onClick={() => onSelectSection('all')}
            className="text-left group cursor-pointer focus:outline-hidden"
          >
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white block leading-none">
              TaskFlow
            </span>
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
              Simple Daily Productivity
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-neutral-100/80 dark:bg-neutral-800/80 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
          <button
            onClick={() => onSelectSection('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              currentSection === 'all'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>All Tasks</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tabular-nums">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => onSelectSection('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              currentSection === 'today'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Today</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-md bg-amber-100/70 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 tabular-nums">
              {counts.today}
            </span>
          </button>

          <button
            onClick={() => onSelectSection('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              currentSection === 'pending'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Pending</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tabular-nums">
              {counts.pending}
            </span>
          </button>

          <button
            onClick={() => onSelectSection('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              currentSection === 'completed'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Completed</span>
            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-md bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 tabular-nums">
              {counts.completed}
            </span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* n8n AI Assistant button */}
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              title="Open n8n Task Assistant"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-indigo-500/10 hover:from-orange-500/20 hover:to-indigo-500/20 text-neutral-800 dark:text-neutral-100 border border-neutral-300/80 dark:border-neutral-700 transition-all cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">n8n AI</span>
            </button>
          )}

          {/* Reset Demo button for quick review/demo in college/presentation */}
          <button
            onClick={onResetDemo}
            title="Reset sample tasks"
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Reset to sample tasks"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Dark / Light toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Add Task primary CTA */}
          <button
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-950 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="whitespace-nowrap">Add Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
