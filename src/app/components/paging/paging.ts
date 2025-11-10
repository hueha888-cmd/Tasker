import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paging',
  imports: [CommonModule],
  templateUrl: './paging.html',
  styleUrl: './paging.sass',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagingComponent {
  readonly totalItems = input.required<number>();
  readonly pageSize = input<number>(10);
  readonly currentPage = input<number>(1);
  
  readonly pageChanged = output<number>();
  
  readonly totalPages = computed(() => {
    const total = this.totalItems();
    const size = this.pageSize();
    return Math.ceil(total / size);
  });
  
  readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(total);
      }
    }
    
    return pages;
  });
  
  readonly hasPrevious = computed(() => this.currentPage() > 1);
  readonly hasNext = computed(() => this.currentPage() < this.totalPages());
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChanged.emit(page);
    }
  }
  
  previousPage(): void {
    if (this.hasPrevious()) {
      this.pageChanged.emit(this.currentPage() - 1);
    }
  }
  
  nextPage(): void {
    if (this.hasNext()) {
      this.pageChanged.emit(this.currentPage() + 1);
    }
  }
}
