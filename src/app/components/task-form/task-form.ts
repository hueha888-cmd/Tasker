import { Component, input, output, computed, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskPriority } from '../../models/task.model';

const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 100;

export type TaskFormMode = 'create' | 'edit';
export type TaskFormContext = 'page' | 'inline';

export interface TaskFormData {
  title: string;
  priority: TaskPriority;
}

@Component({
  selector: 'app-task-form',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.sass',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;
  
  readonly mode = input<TaskFormMode>('create');
  readonly context = input<TaskFormContext>('page');
  readonly initialTitle = input<string>('');
  readonly initialPriority = input<TaskPriority>('medium');
  readonly submitLabel = input<string>('');
  readonly showCancel = input<boolean>(false);
  
  readonly formSubmitted = output<TaskFormData>();
  readonly formCancelled = output<void>();
  
  readonly priorities: TaskPriority[] = ['low', 'medium', 'high'];
  
  taskForm: FormGroup;
  
  readonly computedSubmitLabel = computed(() => {
    const label = this.submitLabel();
    if (label) return label;
    return this.mode() === 'create' ? 'Add Task' : 'Save';
  });
  
  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(MIN_TITLE_LENGTH),
        Validators.maxLength(MAX_TITLE_LENGTH)
      ]],
      priority: ['medium' as TaskPriority, Validators.required]
    });
    
    effect(() => {
      const title = this.initialTitle();
      const priority = this.initialPriority();
      
      if (this.mode() === 'edit') {
        this.taskForm.patchValue({ title, priority });
      }
    });
  }
  
  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    
    const formValue = this.taskForm.value;
    this.formSubmitted.emit({
      title: formValue.title.trim(),
      priority: formValue.priority
    });
    
    if (this.mode() === 'create') {
      this.taskForm.reset({ title: '', priority: 'medium' });
    }
  }
  
  onCancel(): void {
    this.formCancelled.emit();
    if (this.mode() === 'create') {
      this.taskForm.reset({ title: '', priority: 'medium' });
    }
  }
  
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSubmit();
    } else if (event.key === 'Escape' && this.showCancel()) {
      event.preventDefault();
      this.onCancel();
    }
  }
  
  get titleControl() {
    return this.taskForm.get('title');
  }
  
  get priorityControl() {
    return this.taskForm.get('priority');
  }
  
  getTitleError(): string | null {
    const control = this.titleControl;
    if (!control?.touched || !control?.errors) {
      return null;
    }
    
    if (control.errors['required']) {
      return 'Title is required';
    }
    if (control.errors['minlength']) {
      return `Title must be at least ${MIN_TITLE_LENGTH} characters`;
    }
    if (control.errors['maxlength']) {
      return `Title must not exceed ${MAX_TITLE_LENGTH} characters`;
    }
    
    return null;
  }
}
