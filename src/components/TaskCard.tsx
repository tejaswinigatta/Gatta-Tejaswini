import React, { useState } from 'react';
import { Check, Trash2, Edit3, Calendar, ChevronDown, ChevronUp, AlertCircle, CornerDownRight } from 'lucide-react';
import { Task, Priority } from '../types/todo';
import { formatFriendlyDate, getTodayDateString, getTomorrowDateString } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdateDueDate?: (id: string, newDueDate: string) => void;
}

const priorityStyles: Record<
  Priority,
  { label: string; dotClass: string; textClass: string }
> = {
  urgent: {
    label: 'Urgent',
    dotClass: 'bg-rose-500',
    textClass: 'text-rose-600 dark:text-rose-400 font-semibold',
  },
  high: {
    label: 'High',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400 font-medium',
  },
  medium: {
    label: 'Medium',
    dotClass: 'bg-sky-500',
    textClass: 'text-sky-600 dark:text-sky-400 font-medium',
  },
  low: {
    label: 'Low',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400 font-medium',
  },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onUpdateDueDate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const dateInfo = formatFriendlyDate(task.dueDate);
  const priorityInfo = priorityStyles[task.priority] || priorityStyles.medium;

  const handleQuickSetToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateDueDate) {
      onUpdateDueDate(task.id, getTodayDateString());
    }
  };

  const handleQuickSetTomorrow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateDueDate) {
      onUpdateDueDate(task.id, getTomorrowDateString());
    }
  };

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 ${
        task.completed
          ? 'bg-neutral-50/60 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800/50 opacity-75'
          : dateInfo.isOverdue
            ? 'bg-white dark:bg-neutral-900 border-rose-200 dark:border-rose-900/50 shadow-xs'
            : 'bg-white dark:bg-neutral-900 border-neutral-200/90 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      <div className="p-4 sm:p-4.5 flex items-start gap-3.5">
        {/* Custom Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as completed'}
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            task.completed
              ? 'bg-neutral-900 border-neutral-900 dark:bg-white dark:border-white text-white dark:text-neutral-950 shadow-xs'
              : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:border-neutral-500 dark:hover:border-neutral-400'
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onToggleComplete(task.id)}
              className={`text-sm sm:text-[15px] font-medium leading-snug cursor-pointer select-none transition-colors ${
                task.completed
                  ? 'line-through text-neutral-400 dark:text-neutral-500'
                  : 'text-neutral-900 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {task.title}
            </h3>

            {/* Actions for Desktop & Hover */}
            <div className="flex items-center gap-1 shrink-0 ml-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEdit(task)}
                title="Edit task"
                className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Edit task"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              {showConfirmDelete ? (
                <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 p-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                  <button
                    type="button"
                    onClick={() => onDelete(task.id)}
                    className="px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-300 hover:underline cursor-pointer"
                  >
                    Delete?
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-1 py-0.5 text-[10px] text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  title="Delete task"
                  className="p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Description (collapsible if long) */}
          {task.description && (
            <div className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <p className={!isExpanded && task.description.length > 120 ? 'line-clamp-2' : ''}>
                {task.description}
              </p>
              {task.description.length > 120 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-0.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-0.5 cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      Show full note <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Unboxed Metadata Line per Zero-Pill Design Principle */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
            {/* Category */}
            <span className="font-sans font-medium text-neutral-700 dark:text-neutral-300">
              {task.category}
            </span>

            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>

            {/* Priority with subtle semantic dot */}
            <div className="flex items-center gap-1.5 font-sans">
              <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotClass}`} />
              <span className={priorityInfo.textClass}>{priorityInfo.label}</span>
            </div>

            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>

            {/* Due date */}
            <div
              className={`flex items-center gap-1 font-sans ${
                task.completed
                  ? 'text-neutral-400 dark:text-neutral-500'
                  : dateInfo.isOverdue
                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                    : dateInfo.isToday
                      ? 'text-amber-600 dark:text-amber-400 font-semibold'
                      : dateInfo.isTomorrow
                        ? 'text-sky-600 dark:text-sky-400 font-medium'
                        : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              <Calendar className="w-3 h-3 shrink-0" />
              <span>{dateInfo.label}</span>
            </div>

            {/* Quick date adjusters if not completed and overdue/unscheduled */}
            {!task.completed && (dateInfo.isOverdue || !task.dueDate) && onUpdateDueDate && (
              <>
                <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                <button
                  type="button"
                  onClick={handleQuickSetToday}
                  className="font-sans text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <CornerDownRight className="w-2.5 h-2.5" />
                  Move to Today
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
