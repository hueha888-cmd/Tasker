export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  isDone: boolean;
  priority: TaskPriority;
}

