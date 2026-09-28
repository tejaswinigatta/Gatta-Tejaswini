import { Task } from '../types/todo';
import { getTodayDateString, getTomorrowDateString } from './dateUtils';

const STORAGE_KEY = 'taskflow_tasks_v1';
const THEME_KEY = 'taskflow_theme_pref';

export function getInitialSampleTasks(): Task[] {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  return [
    {
      id: 'demo-1',
      title: 'Submit Data Structures Lab Report',
      description: 'Finish analyzing sorting algorithms complexity graph and upload PDF to course portal.',
      dueDate: today,
      priority: 'urgent',
      category: 'College',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'demo-2',
      title: 'Prepare slides for Software Engineering sprint review',
      description: 'Include burndown chart, completed user stories, and architecture diagram.',
      dueDate: today,
      priority: 'high',
      category: 'Work',
      completed: true,
      completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    },
    {
      id: 'demo-3',
      title: 'Buy groceries & meal prep for the week',
      description: 'Oats, Greek yogurt, almonds, vegetables, and iced tea.',
      dueDate: today,
      priority: 'medium',
      category: 'Personal',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'demo-4',
      title: 'Review Chapter 4 of Database Management Systems',
      description: 'SQL Joins, Normalization (1NF through BCNF), and Indexing basics.',
      dueDate: tomorrow,
      priority: 'high',
      category: 'College',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: 'demo-5',
      title: 'Call dentist to confirm annual cleaning appointment',
      description: 'Ask if afternoon slots on Friday are available.',
      dueDate: tomorrow,
      priority: 'low',
      category: 'Personal',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'demo-6',
      title: 'Schedule quarterly budget review with advisor',
      description: 'Consolidate student loan repayment plan and monthly savings target.',
      priority: 'medium',
      category: 'Others',
      completed: true,
      completedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ];
}

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSampleTasks();
      saveTasksToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return getInitialSampleTasks();
  } catch (err) {
    console.error('Failed to load tasks from localStorage:', err);
    return getInitialSampleTasks();
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage:', err);
  }
}

export function loadThemePreference(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveThemePreference(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.error('Failed to save theme to localStorage:', err);
  }
}
