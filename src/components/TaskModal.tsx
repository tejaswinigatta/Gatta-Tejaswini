import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Flag, Folder, AlignLeft, Check } from 'lucide-react';
import { Task, Priority } from '../types/todo';
import { getTodayDateString, getTomorrowDateString } from '../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>, editingId?: string) => void;
  taskToEdit?: Task | null;
  existingCategories: string[];
}

const DEFAULT_CATEGORIES = ['Personal', 'College', 'Work', 'Others'];

const PRIORITIES: { value: Priority; label: string; dotColor: string }[] = [
  { value: 'urgent', label: 'Urgent', dotColor: 'bg-rose-500' },
  { value: 'high', label: 'High', dotColor: 'bg-amber-500' },
  { value: 'medium', label: 'Medium', dotColor: 'bg-sky-500' },
  { value: 'low', label: 'Low', dotColor: 'bg-emerald-500' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  existingCategories,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<string>('Personal');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategoryActive, setIsCustomCategoryActive] = useState(false);
  const [titleError, setTitleError] = useState('');

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Combine default categories with custom categories already in use
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories]));

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setDueDate(taskToEdit.dueDate || '');
        setPriority(taskToEdit.priority);
        if (allCategories.includes(taskToEdit.category)) {
          setCategory(taskToEdit.category);
          setIsCustomCategoryActive(false);
          setCustomCategory('');
        } else {
          setCategory('Custom');
          setIsCustomCategoryActive(true);
          setCustomCategory(taskToEdit.category);
        }
      } else {
        // Defaults for new task
        setTitle('');
        setDescription('');
        setDueDate(getTodayDateString()); // Default due date to today for convenience
        setPriority('medium');
        setCategory('College');
        setIsCustomCategoryActive(false);
        setCustomCategory('');
      }
      setTitleError('');

      // Auto-focus input
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Task title is required.');
      titleInputRef.current?.focus();
      return;
    }

    if (trimmedTitle.length < 2) {
      setTitleError('Task title must be at least 2 characters long.');
      titleInputRef.current?.focus();
      return;
    }

    let resolvedCategory = category;
    if (isCustomCategoryActive) {
      const trimmedCustom = customCategory.trim();
      resolvedCategory = trimmedCustom ? trimmedCustom : 'Personal';
    }

    onSave(
      {
        title: trimmedTitle,
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
        category: resolvedCategory,
      },
      taskToEdit?.id
    );

    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const applyPresetDate = (type: 'today' | 'tomorrow' | 'nextWeek' | 'none') => {
    if (type === 'none') {
      setDueDate('');
      return;
    }
    if (type === 'today') {
      setDueDate(getTodayDateString());
      return;
    }
    if (type === 'tomorrow') {
      setDueDate(getTomorrowDateString());
      return;
    }
    if (type === 'nextWeek') {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setDueDate(`${year}-${month}-${day}`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              {taskToEdit ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {taskToEdit ? 'Update details and schedule' : 'Fill in task details and deadline'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Task Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Task Name <span className="text-rose-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError('');
              }}
              placeholder="e.g., Complete Physics Problem Set 3"
              className={`w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800/60 border rounded-xl placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 transition-all ${
                titleError
                  ? 'border-rose-400 focus:ring-rose-500 text-neutral-900 dark:text-white'
                  : 'border-neutral-200 dark:border-neutral-700 focus:ring-neutral-900 dark:focus:ring-white text-neutral-900 dark:text-white'
              }`}
            />
            {titleError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {titleError}
              </p>
            )}
          </div>

          {/* Description (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Description <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Add subtasks, reference links, lecture notes, or key reminders..."
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white text-neutral-900 dark:text-white transition-all resize-none"
              />
            </div>
          </div>

          {/* Priority & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-2 transition-colors cursor-pointer ${
                      priority === p.value
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white font-semibold'
                        : 'bg-white dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${p.dotColor}`} />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setIsCustomCategoryActive(false);
                    }}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      !isCustomCategoryActive && category === cat
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white font-semibold'
                        : 'bg-white dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomCategoryActive(true)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    isCustomCategoryActive
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white font-semibold'
                      : 'bg-white dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  + Other
                </button>
              </div>

              {isCustomCategoryActive && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category..."
                  className="mt-2 w-full px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 text-neutral-900 dark:text-white"
                />
              )}
            </div>
          </div>

          {/* Due Date & Quick Presets */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Due Date
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => applyPresetDate('today')}
                  className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:underline cursor-pointer"
                >
                  Today
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => applyPresetDate('tomorrow')}
                  className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:underline cursor-pointer"
                >
                  Tomorrow
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => applyPresetDate('nextWeek')}
                  className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:underline cursor-pointer"
                >
                  In 1 Week
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => applyPresetDate('none')}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4.5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-950 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all shadow-xs cursor-pointer"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
