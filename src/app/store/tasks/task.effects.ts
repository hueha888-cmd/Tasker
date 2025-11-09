import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, filter } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Task } from '../../models/task.model';
import { NotificationService } from '../../services/notification.service';
import * as TaskActions from './task.actions';

@Injectable()
export class TaskEffects {
  private readonly actions$ = inject(Actions);
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = 'http://localhost:3000/tasks';

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.loadTasks),
      filter(() => isPlatformBrowser(this.platformId)),
      switchMap(() =>
        this.http.get<Task[]>(this.apiUrl).pipe(
          map(tasks => TaskActions.loadTasksSuccess({ tasks })),
          catchError(error => {
            this.notificationService.error('Failed to load tasks. Please check your connection and try again.');
            return of(TaskActions.loadTasksFailure({ error: error.message }));
          })
        )
      )
    )
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.createTask),
      filter(() => isPlatformBrowser(this.platformId)),
      switchMap(({ title, priority }) =>
        this.http.post<Task>(this.apiUrl, { title, isDone: false, priority }).pipe(
          map(task => {
            this.notificationService.success('Task created successfully!');
            return TaskActions.createTaskSuccess({ task });
          }),
          catchError(error => {
            this.notificationService.error('Failed to create task. Please try again.');
            return of(TaskActions.createTaskFailure({ error: error.message }));
          })
        )
      )
    )
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.updateTask),
      filter(() => isPlatformBrowser(this.platformId)),
      switchMap(({ id, updates }) =>
        this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
          switchMap(existingTask => {
            const updatedTask = { ...existingTask, ...updates };
            return this.http.put<Task>(`${this.apiUrl}/${id}`, updatedTask).pipe(
              map(task => {
                this.notificationService.success('Task updated successfully!');
                return TaskActions.updateTaskSuccess({ task });
              }),
              catchError(error => {
                this.notificationService.error('Failed to update task. Please try again.');
                return of(TaskActions.updateTaskFailure({ error: error.message }));
              })
            );
          }),
          catchError(error => {
            this.notificationService.error('Failed to update task. Please try again.');
            return of(TaskActions.updateTaskFailure({ error: error.message }));
          })
        )
      )
    )
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.deleteTask),
      filter(() => isPlatformBrowser(this.platformId)),
      switchMap(({ id }) =>
        this.http.delete(`${this.apiUrl}/${id}`).pipe(
          map(() => {
            this.notificationService.success('Task deleted successfully!');
            return TaskActions.deleteTaskSuccess({ id });
          }),
          catchError(error => {
            this.notificationService.error('Failed to delete task. Please try again.');
            return of(TaskActions.deleteTaskFailure({ error: error.message }));
          })
        )
      )
    )
  );
}

