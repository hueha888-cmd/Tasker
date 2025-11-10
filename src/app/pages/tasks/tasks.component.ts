import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Task, TaskPriority } from '../../models/task.model';
import * as TaskActions from '../../store/tasks/task.actions';
import { selectAllTasks } from '../../store/tasks/task.selectors';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { TaskFormComponent, TaskFormData } from '../../components/task-form/task-form';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule, TaskListComponent, TaskFormComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksComponent implements OnInit {
  private readonly store = inject(Store);
  
  readonly allTasks = this.store.selectSignal(selectAllTasks);

  ngOnInit(): void {
    this.store.dispatch(TaskActions.loadTasks());
  }

  onTaskCreated(formData: TaskFormData): void {
    this.store.dispatch(TaskActions.createTask({ 
      title: formData.title, 
      priority: formData.priority 
    }));
  }

  onTaskToggled(task: Task): void {
    this.store.dispatch(TaskActions.updateTask({ id: task.id, updates: { isDone: !task.isDone } }));
  }

  onTaskEdited(event: { id: string; title: string; priority: TaskPriority }): void {
    this.store.dispatch(TaskActions.updateTask({ 
      id: event.id, 
      updates: { 
        title: event.title,
        priority: event.priority
      } 
    }));
  }

  onTaskDeleted(taskId: string): void {
    this.store.dispatch(TaskActions.deleteTask({ id: taskId }));
  }
}

