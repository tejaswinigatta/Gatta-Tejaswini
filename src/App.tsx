/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Plus, CheckCheck, Trash2, Undo2, Sparkles, Filter } from 'lucide-react';

import { Task, ViewSection, SortOption } from './types/todo';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  loadThemePreference,
  saveThemePreference,
  getInitialSampleTasks,
} from './utils/storage';
import { isDueToday, getTodayDateString } from './utils/dateUtils';

import { Navbar } from './components/Navbar';
import { TopDashboard } from './components/TopDashboard';
import { TaskFilterBar } from './components/TaskFilterBar';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { EmptyState } from './components/EmptyState';

export default function App() {
  // 1. Storage & State initialization
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadThemePreference());

  // 2. Filter & Navigation State
  const [currentSection, setCurrentSection] = useState<ViewSection>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('due_date');

  // 3. Modal & Undo Toast State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [deletedTaskUndo, setDeletedTaskUndo] = useState<{
    task: Task;
    timerId: any;
  } | null>(null);

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveThemePreference(theme);
  }, [theme]);

  // Sync tasks to LocalStorage whenever they change
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Keyboard shortcut listener ('/' to search, 'n' to add task)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setTaskToEdit(null);
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Compute distinct categories
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) categoriesSet.add(t.category);
    });
    // Ensure default categories are represented
    ['College', 'Work', 'Personal', 'Others'].forEach((c) => categoriesSet.add(c));
    return Array.from(categoriesSet);
  }, [tasks]);

  // Overall counts for Navbar & Dashboard
  const counts = useMemo(() => {
    const all = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = all - completed;
    const todayTasks = tasks.filter((t) => isDueToday(t.dueDate));
    const todayTotal = todayTasks.length;
    const todayCompleted = todayTasks.filter((t) => t.completed).length;
    const urgentOrHighCount = tasks.filter(
      (t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high')
    ).length;

    return {
      all,
      completed,
      pending,
      today: todayTotal,
      todayCompleted,
      urgentOrHighCount,
    };
  }, [tasks]);

  // Handler: Toggle Task Completed
  const handleToggleComplete = useCallback((id: string) => {
    setTasks((prevTasks) => {
      const targetTask = prevTasks.find((t) => t.id === id);
      const willBeCompleted = targetTask ? !targetTask.completed : false;

      const updated = prevTasks.map((task) => {
        if (task.id === id) {
          const nextCompleted = !task.completed;
          return {
            ...task,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return task;
      });

      // Celebration effect when completing a task
      if (willBeCompleted) {
        // Check if all today's tasks are completed
        const todayTasks = updated.filter((t) => isDueToday(t.dueDate));
        const allTodayDone =
          todayTasks.length > 0 && todayTasks.every((t) => t.completed);

        try {
          if (allTodayDone) {
            // Big burst confetti for finishing the daily goals
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } else {
            // Delicate spark confetti for individual task completion
            confetti({
              particleCount: 25,
              spread: 45,
              origin: { y: 0.8 },
              ticks: 120,
            });
          }
        } catch {
          // Ignore if canvas-confetti is unsupported
        }
      }

      return updated;
    });
  }, []);

  // Handler: Save Task (Create or Edit)
  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      // Edit existing
      setTasks((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...taskData } : t))
      );
    } else {
      // Create new
      const newTask: Task = {
        ...taskData,
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setTaskToEdit(null);
  };

  // Handler: Delete Task with Undo Support
  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    // Clear any previous undo timer
    if (deletedTaskUndo?.timerId) {
      clearTimeout(deletedTaskUndo.timerId);
    }

    setTasks((prev) => prev.filter((t) => t.id !== id));

    const timer = setTimeout(() => {
      setDeletedTaskUndo(null);
    }, 6000);

    setDeletedTaskUndo({
      task: taskToDelete,
      timerId: timer,
    });
  };

  const handleUndoDelete = () => {
    if (deletedTaskUndo) {
      clearTimeout(deletedTaskUndo.timerId);
      setTasks((prev) => [deletedTaskUndo.task, ...prev]);
      setDeletedTaskUndo(null);
    }
  };

  // Handler: Update Due Date directly
  const handleUpdateDueDate = (id: string, newDueDate: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dueDate: newDueDate } : t))
    );
  };

  // Handler: Reset to initial sample tasks
  const handleResetDemo = () => {
    if (
      window.confirm(
        'Reset all tasks to sample college & productivity demo tasks? Any custom changes will be replaced.'
      )
    ) {
      const sample = getInitialSampleTasks();
      setTasks(sample);
      saveTasksToStorage(sample);
      setCurrentSection('all');
      setSelectedCategory('all');
      setSelectedPriority('all');
      setSearchQuery('');
    }
  };

  // Bulk actions: Complete all current filtered, or clear completed
  const handleMarkAllShownCompleted = () => {
    const shownIds = new Set(filteredTasks.map((t) => t.id));
    setTasks((prev) =>
      prev.map((t) =>
        shownIds.has(t.id)
          ? {
              ...t,
              completed: true,
              completedAt: t.completed ? t.completedAt : new Date().toISOString(),
            }
          : t
      )
    );
  };

  const handleClearCompleted = () => {
    const countCompleted = tasks.filter((t) => t.completed).length;
    if (countCompleted === 0) return;
    if (window.confirm(`Permanently delete all ${countCompleted} completed tasks?`)) {
      setTasks((prev) => prev.filter((t) => !t.completed));
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSearchQuery('');
    setCurrentSection('all');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedPriority !== 'all' ||
    searchQuery.trim().length > 0;

  // Filter and Sort Pipeline
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Section Filter
        if (currentSection === 'today') {
          if (!isDueToday(task.dueDate)) return false;
        } else if (currentSection === 'pending') {
          if (task.completed) return false;
        } else if (currentSection === 'completed') {
          if (!task.completed) return false;
        }

        // Category Filter
        if (selectedCategory !== 'all' && task.category !== selectedCategory) {
          return false;
        }

        // Priority Filter
        if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
          return false;
        }

        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = (task.description || '').toLowerCase().includes(q);
          const matchesCategory = task.category.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Completed tasks sink slightly to the bottom unless sorting explicitly
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        if (sortBy === 'priority') {
          const weight: Record<string, number> = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          return (weight[b.priority] || 0) - (weight[a.priority] || 0);
        }

        if (sortBy === 'created_desc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        if (sortBy === 'alphabetical') {
          return a.title.localeCompare(b.title);
        }

        // Default: due_date (soonest first, tasks without date come last)
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [tasks, currentSection, selectedCategory, selectedPriority, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-neutral-50/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      {/* 3-Zone Navigation Bar */}
      <Navbar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        onOpenNewTaskModal={() => {
          setTaskToEdit(null);
          setIsModalOpen(true);
        }}
        onResetDemo={handleResetDemo}
        theme={theme}
        onToggleTheme={toggleTheme}
        counts={{
          all: counts.all,
          today: counts.today,
          pending: counts.pending,
          completed: counts.completed,
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Top Dashboard: Daily progress & scannable cards */}
        <TopDashboard
          totalTasks={counts.all}
          pendingTasks={counts.pending}
          completedTasks={counts.completed}
          todayTasksTotal={counts.today}
          todayTasksCompleted={counts.todayCompleted}
          urgentOrHighCount={counts.urgentOrHighCount}
          onFilterSection={setCurrentSection}
          currentSection={currentSection}
        />

        {/* Task Management Canvas: Filters, Controls & Task Cards */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          {/* Filter & Search Bar */}
          <TaskFilterBar
            currentSection={currentSection}
            onSelectSection={setCurrentSection}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedPriority={selectedPriority}
            onSelectPriority={setSelectedPriority}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            availableCategories={availableCategories}
            counts={{
              all: counts.all,
              today: counts.today,
              pending: counts.pending,
              completed: counts.completed,
            }}
            totalFiltered={filteredTasks.length}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Quick Bulk Action Bar (when tasks exist) */}
          {filteredTasks.length > 0 && (
            <div className="flex items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400 py-1">
              <span className="font-medium">
                {currentSection === 'today'
                  ? "Today's Agenda"
                  : currentSection === 'pending'
                    ? 'Pending Tasks'
                    : currentSection === 'completed'
                      ? 'Completed Records'
                      : 'All Tasks'}
              </span>

              <div className="flex items-center gap-3">
                {currentSection !== 'completed' && (
                  <button
                    onClick={handleMarkAllShownCompleted}
                    className="hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Complete shown</span>
                  </button>
                )}
                {counts.completed > 0 && (
                  <button
                    onClick={handleClearCompleted}
                    className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear completed ({counts.completed})</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Task Cards List or Empty State */}
          {filteredTasks.length === 0 ? (
            <EmptyState
              section={currentSection}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              selectedPriority={selectedPriority}
              totalTasksInSystem={counts.all}
              onOpenNewTaskModal={() => {
                setTaskToEdit(null);
                setIsModalOpen(true);
              }}
              onClearFilters={handleResetFilters}
            />
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(t) => {
                    setTaskToEdit(t);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeleteTask}
                  onUpdateDueDate={handleUpdateDueDate}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Button for Rapid Task Creation */}
      <button
        onClick={() => {
          setTaskToEdit(null);
          setIsModalOpen(true);
        }}
        aria-label="Add new task"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold text-xs sm:text-sm rounded-full shadow-lg hover:shadow-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span className="hidden sm:inline">Add Task</span>
        <span className="hidden sm:inline-block font-mono text-[10px] bg-neutral-800 dark:bg-neutral-200 text-neutral-300 dark:text-neutral-700 px-1.5 py-0.5 rounded">
          N
        </span>
      </button>

      {/* Undo Toast Notification */}
      {deletedTaskUndo && (
        <aside
          aria-live="polite"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl shadow-lg border border-neutral-800 dark:border-neutral-200 text-xs sm:text-sm animate-in slide-in-from-bottom duration-200"
        >
          <span className="truncate max-w-[200px] sm:max-w-[280px]">
            Task &ldquo;{deletedTaskUndo.task.title}&rdquo; deleted
          </span>
          <button
            onClick={handleUndoDelete}
            className="flex items-center gap-1 font-bold text-amber-400 dark:text-amber-600 hover:underline cursor-pointer shrink-0"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </aside>
      )}

      {/* Task Creation & Editing Modal Dialog */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        existingCategories={availableCategories}
      />

      {/* Quiet, Clean Footer */}
      <footer className="mt-auto border-t border-neutral-200/80 dark:border-neutral-800 py-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TaskFlow · Daily Task Planner & Productivity Manager</span>
          <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
            Persistent local storage · Offline capable
          </span>
        </div>
      </footer>
    </div>
  );
}
