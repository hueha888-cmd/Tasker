import { Component, input, output, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskPriority } from '../../models/task.model';
import { PagingComponent } from '../paging/paging';
import { TaskFormComponent, TaskFormData } from '../task-form/task-form';

const DEFAULT_PAGE_SIZE = 5;

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, PagingComponent, TaskFormComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent {
  readonly tasks = input.required<Task[]>();
  readonly title = input<string>('Tasks');
  readonly filterByDone = input<boolean | null>(null);
  readonly emptyMessage = input<string>('No tasks available');
  readonly pageSize = input<number>(DEFAULT_PAGE_SIZE);
  
  readonly taskToggled = output<Task>();
  readonly taskEdited = output<{ id: string; title: string; priority: TaskPriority }>();
  readonly taskDeleted = output<string>();
  
  readonly editingTaskId = signal<string | null>(null);
  readonly currentPage = signal<number>(1);
  
  readonly editingTask = computed(() => {
    const taskId = this.editingTaskId();
    if (!taskId) return null;
    return this.tasks().find(t => t.id === taskId) || null;
  });
  
  readonly filteredTasks = computed(() => {
    const tasks = this.tasks();
    const filter = this.filterByDone();
    
    if (filter === null) {
      return tasks;
    }
    
    return tasks.filter(task => task.isDone === filter);
  });
  
  readonly paginatedTasks = computed(() => {
    const filtered = this.filteredTasks();
    const page = this.currentPage();
    const size = this.pageSize();
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    
    return filtered.slice(startIndex, endIndex);
  });
  
  constructor() {
    effect(() => {
      const totalItems = this.filteredTasks().length;
      const size = this.pageSize();
      const maxPage = Math.ceil(totalItems / size) || 1;
      
      if (this.currentPage() > maxPage) {
        this.currentPage.set(1);
      }
    });
  }
  
  onPageChanged(page: number): void {
    this.currentPage.set(page);
  }
  
  startEditing(task: Task): void {
    this.editingTaskId.set(task.id);
  }
  
  onEditSubmit(taskId: string, formData: TaskFormData): void {
    this.taskEdited.emit({
      id: taskId,
      title: formData.title,
      priority: formData.priority
    });
    this.editingTaskId.set(null);
  }
  
  onEditCancel(): void {
    this.editingTaskId.set(null);
  }
  
  toggleTask(task: Task): void {
    this.taskToggled.emit(task);
  }
  
  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskDeleted.emit(taskId);
    }
  }
  
  isEditing(taskId: string): boolean {
    return this.editingTaskId() === taskId;
  }
}

