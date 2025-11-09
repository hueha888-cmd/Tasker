import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent {
  private readonly notificationService = inject(NotificationService);
  
  readonly notifications = this.notificationService.notifications;

  close(id: string): void {
    this.notificationService.remove(id);
  }
}

