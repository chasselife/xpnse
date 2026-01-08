import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ExpenseItem } from '../../models/expense-item.interface';

@Component({
  selector: 'app-expense-item-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './expense-item-card.component.html',
  styleUrl: './expense-item-card.component.css'
})
export class ExpenseItemCardComponent {
  item = input.required<ExpenseItem>();
  
  edit = output<ExpenseItem>();
  delete = output<string>();

  swipeOffset = 0;
  isSwiping = false;
  touchStartX = 0;
  showActions = false;
  longPressTimer: any = null;

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.isSwiping = false;
    this.showActions = false;

    // Long press detection
    this.longPressTimer = setTimeout(() => {
      this.showActions = true;
    }, 500);
  }

  onTouchMove(event: TouchEvent) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    const currentX = event.touches[0].clientX;
    const diff = this.touchStartX - currentX;

    if (Math.abs(diff) > 10) {
      this.isSwiping = true;
      if (diff > 0) {
        // Swiping left
        this.swipeOffset = Math.min(diff, 120);
      } else {
        // Swiping right
        this.swipeOffset = Math.max(diff, 0);
      }
    }
  }

  onTouchEnd() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    if (this.isSwiping) {
      if (this.swipeOffset > 60) {
        this.showActions = true;
        this.swipeOffset = 120;
      } else {
        this.showActions = false;
        this.swipeOffset = 0;
      }
    }
  }

  onEdit() {
    this.edit.emit(this.item());
    this.resetSwipe();
  }

  onDelete() {
    this.delete.emit(this.item().id);
    this.resetSwipe();
  }

  resetSwipe() {
    this.swipeOffset = 0;
    this.showActions = false;
    this.isSwiping = false;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDateTime(date: string, time: string): string {
    const dateObj = new Date(date + 'T' + time);
    return dateObj.toLocaleString();
  }
}


