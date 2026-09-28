export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Category = 'Personal' | 'College' | 'Work' | 'Others' | string;

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // Format: YYYY-MM-DD
  priority: Priority;
  category: Category;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type ViewSection = 'all' | 'today' | 'pending' | 'completed';

export type SortOption = 'due_date' | 'priority' | 'created_desc' | 'alphabetical';

export interface TaskFilterState {
  section: ViewSection;
  category: string; // 'all' or specific category
  priority: string; // 'all' or specific priority
  searchQuery: string;
  sortBy: SortOption;
}
