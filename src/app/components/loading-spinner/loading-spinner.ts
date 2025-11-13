import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class LoadingSpinnerComponent {
  readonly message = input<string>('Loading...');
  readonly size = input<'small' | 'medium' | 'large'>('medium');
  
  readonly diameter = computed(() => {
    const sizeMap = { small: 32, medium: 64, large: 96 };
    return sizeMap[this.size()];
  });
}
