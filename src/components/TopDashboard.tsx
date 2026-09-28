import React from 'react';
import { CheckCircle2, Clock, CalendarDays, Flame, AlertCircle } from 'lucide-react';
import { ViewSection } from '../types/todo';
import { getHumanReadableToday } from '../utils/dateUtils';

interface TopDashboardProps {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  todayTasksTotal: number;
  todayTasksCompleted: number;
  urgentOrHighCount: number;
  onFilterSection: (section: ViewSection) => void;
  currentSection: ViewSection;
}

export const TopDashboard: React.FC<TopDashboardProps> = ({
  totalTasks,
  pendingTasks,
  completedTasks,
  todayTasksTotal,
  todayTasksCompleted,
  urgentOrHighCount,
  onFilterSection,
  currentSection,
}) => {
  const todayPercentage = todayTasksTotal > 0
    ? Math.round((todayTasksCompleted / todayTasksTotal) * 100)
    : totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  const todayLabel = getHumanReadableToday();

  // Motivational caption
  let statusMessage = "Let's organize your day!";
  if (todayTasksTotal > 0) {
    if (todayTasksCompleted === todayTasksTotal) {
      statusMessage = "All today's tasks completed! Outstanding job 🎉";
    } else if (todayPercentage >= 50) {
      statusMessage = `Over halfway there! ${todayTasksTotal - todayTasksCompleted} tasks left today.`;
    } else {
      statusMessage = `${todayTasksTotal - todayTasksCompleted} tasks remaining for today. You've got this!`;
    }
  } else if (totalTasks > 0 && pendingTasks === 0) {
    statusMessage = "Zero pending tasks! You are completely caught up.";
  }

  return (
    <section className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-200/60 dark:border-neutral-800/80">
        {/* Left: Date & Welcome */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{todayLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="text-neutral-600 dark:text-neutral-400">Daily Focus Overview</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Daily Progress & Priorities
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            {statusMessage}
          </p>
        </div>

        {/* Right: Daily Task Completion Bar & Circular Gauge */}
        <div className="flex items-center gap-4 bg-neutral-50 dark:bg-neutral-800/50 p-3.5 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 self-start lg:self-auto min-w-[280px] sm:min-w-[340px]">
          {/* Circular Progress Gauge */}
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="19"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                className="text-neutral-200 dark:text-neutral-700"
              />
              <circle
                cx="24"
                cy="24"
                r="19"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={119.38}
                strokeDashoffset={119.38 - (119.38 * todayPercentage) / 100}
                strokeLinecap="round"
                className="text-neutral-900 dark:text-white transition-all duration-500 ease-out"
              />
            </svg>
            <span className="absolute font-mono text-xs font-bold text-neutral-900 dark:text-white tabular-nums">
              {todayPercentage}%
            </span>
          </div>

          {/* Progress stats details */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {todayTasksTotal > 0 ? "Today's Tasks" : "Total Progress"}
              </span>
              <span className="font-mono text-neutral-600 dark:text-neutral-400 tabular-nums">
                {todayTasksTotal > 0
                  ? `${todayTasksCompleted}/${todayTasksTotal} completed`
                  : `${completedTasks}/${totalTasks} completed`}
              </span>
            </div>

            {/* Horizontal progress bar */}
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-500 ease-out"
                style={{ width: `${todayPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-neutral-600 dark:text-neutral-400 font-mono">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Quick Scannable Stat Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5">
        {/* Stat 1: Today's Tasks */}
        <button
          onClick={() => onFilterSection('today')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            currentSection === 'today'
              ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-400 dark:border-neutral-600 shadow-xs'
              : 'bg-neutral-50/70 dark:bg-neutral-800/40 border-neutral-200/60 dark:border-neutral-700/60 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/70'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 mb-1.5">
            <span className="text-xs font-semibold">Today's Due</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
              {todayTasksTotal}
            </span>
            <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono">
              ({todayTasksCompleted} done)
            </span>
          </div>
        </button>

        {/* Stat 2: Pending Tasks */}
        <button
          onClick={() => onFilterSection('pending')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            currentSection === 'pending'
              ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-400 dark:border-neutral-600 shadow-xs'
              : 'bg-neutral-50/70 dark:bg-neutral-800/40 border-neutral-200/60 dark:border-neutral-700/60 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/70'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 mb-1.5">
            <span className="text-xs font-semibold">Pending</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
              {pendingTasks}
            </span>
            <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
              to accomplish
            </span>
          </div>
        </button>

        {/* Stat 3: Completed Tasks */}
        <button
          onClick={() => onFilterSection('completed')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            currentSection === 'completed'
              ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-400 dark:border-neutral-600 shadow-xs'
              : 'bg-neutral-50/70 dark:bg-neutral-800/40 border-neutral-200/60 dark:border-neutral-700/60 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/70'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 mb-1.5">
            <span className="text-xs font-semibold">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
              {completedTasks}
            </span>
            <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
              finished
            </span>
          </div>
        </button>

        {/* Stat 4: High Priority */}
        <button
          onClick={() => onFilterSection('all')}
          className="p-3.5 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 bg-neutral-50/70 dark:bg-neutral-800/40 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/70 text-left transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 mb-1.5">
            <span className="text-xs font-semibold">Urgent & High</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
              {urgentOrHighCount}
            </span>
            <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
              high attention
            </span>
          </div>
        </button>
      </div>
    </section>
  );
};
