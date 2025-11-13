import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { Store } from '@ngrx/store';
import { Task, TaskPriority } from '../../models/task.model';
import * as TaskActions from '../../store/tasks/task.actions';
import { selectAllTasks, selectTasksLoading } from '../../store/tasks/task.selectors';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { TaskFormComponent, TaskFormData } from '../../components/task-form/task-form';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { CdkDropListGroup } from "@angular/cdk/drag-drop";


@Component({
  selector: 'app-tasks',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    TaskListComponent,
    TaskFormComponent,
    LoadingSpinnerComponent,
    CdkDropListGroup
],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksComponent implements OnInit {
  private readonly store = inject(Store);
  
  readonly allTasks = this.store.selectSignal(selectAllTasks);
  readonly loading = this.store.selectSignal(selectTasksLoading);

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

