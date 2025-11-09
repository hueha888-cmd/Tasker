import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Task, TaskPriority } from '../../models/task.model';
import * as TaskActions from '../../store/tasks/task.actions';
import { selectOutstandingTasks, selectCompletedTasks } from '../../store/tasks/task.selectors';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksComponent implements OnInit {
  private readonly store = inject(Store);
  
  readonly outstandingTasks = this.store.selectSignal(selectOutstandingTasks);
  readonly completedTasks = this.store.selectSignal(selectCompletedTasks);
  readonly newTaskTitle = signal('');
  readonly newTaskPriority = signal<TaskPriority>('medium');
  readonly editingTaskId = signal<string | null>(null);
  readonly editingTaskTitle = signal('');
  readonly editingTaskPriority = signal<TaskPriority>('medium');
  
  readonly priorities: TaskPriority[] = ['low', 'medium', 'high'];

  ngOnInit(): void {
    this.store.dispatch(TaskActions.loadTasks());
  }

  addTask(): void {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    this.store.dispatch(TaskActions.createTask({ 
      title, 
      priority: this.newTaskPriority() 
    }));
    this.newTaskTitle.set('');
    this.newTaskPriority.set('medium');
  }

  startEditing(task: Task): void {
    this.editingTaskId.set(task.id);
    this.editingTaskTitle.set(task.title);
    this.editingTaskPriority.set(task.priority);
  }

  cancelEditing(): void {
    this.editingTaskId.set(null);
    this.editingTaskTitle.set('');
    this.editingTaskPriority.set('medium');
  }

  saveEdit(taskId: string): void {
    const title = this.editingTaskTitle().trim();
    if (!title) return;

    this.store.dispatch(TaskActions.updateTask({ 
      id: taskId, 
      updates: { 
        title,
        priority: this.editingTaskPriority()
      } 
    }));
    this.cancelEditing();
  }

  toggleTaskStatus(task: Task): void {
    this.store.dispatch(TaskActions.updateTask({ id: task.id, updates: { isDone: !task.isDone } }));
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.store.dispatch(TaskActions.deleteTask({ id: taskId }));
    }
  }

  isEditing(taskId: string): boolean {
    return this.editingTaskId() === taskId;
  }
}

