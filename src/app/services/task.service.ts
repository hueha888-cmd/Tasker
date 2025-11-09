import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task.model';
import { NotificationService } from './notification.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = 'http://localhost:3000/tasks';
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  
  private tasksSignal = signal<Task[]>([]);
  
  readonly tasks = this.tasksSignal.asReadonly();

  async loadTasks(): Promise<void> {
    try {
      const tasks = await firstValueFrom(this.http.get<Task[]>(this.apiUrl));
      this.tasksSignal.set(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.notificationService.error('Failed to load tasks. Please check your connection and try again.');
    }
  }

  async createTask(title: string): Promise<void> {
    try {
      const newTask: Partial<Task> = {
        title,
        isDone: false
      };
      const createdTask = await firstValueFrom(
        this.http.post<Task>(this.apiUrl, newTask)
      );
      this.tasksSignal.update(tasks => [...tasks, createdTask]);
      this.notificationService.success('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      this.notificationService.error('Failed to create task. Please try again.');
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    try {
      const task = this.tasksSignal().find(t => t.id === id);
      if (!task) return;

      const updatedTask = { ...task, ...updates };
      await firstValueFrom(
        this.http.put<Task>(`${this.apiUrl}/${id}`, updatedTask)
      );
      
      this.tasksSignal.update(tasks =>
        tasks.map(t => t.id === id ? updatedTask : t)
      );
      this.notificationService.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      this.notificationService.error('Failed to update task. Please try again.');
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      this.tasksSignal.update(tasks => tasks.filter(t => t.id !== id));
      this.notificationService.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      this.notificationService.error('Failed to delete task. Please try again.');
    }
  }
}

