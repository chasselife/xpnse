import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Expense } from '../../models/expense.interface';
import { ExpenseItemService } from '../../services/expense-item.service';
import { ExpenseCategory } from '../../models/expense-category.interface';

@Component({
  selector: 'app-expense-card',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './expense-card.component.html',
  styleUrl: './expense-card.component.css',
})
export class ExpenseCardComponent {
  expense = input.required<Expense>();
  totalCost = input<number>(0);
  dateRange = input<{ min: string; max: string } | null>(null);
  categories = input<ExpenseCategory[]>([]);

  edit = output<Expense>();
  delete = output<string>();

  swipeOffset = 0;
  isSwiping = false;
  touchStartX = 0;
  showActions = false;
  longPressTimer: any = null;

  constructor(private itemService: ExpenseItemService) {}

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
    this.edit.emit(this.expense());
    this.resetSwipe();
  }

  onDelete() {
    this.delete.emit(this.expense().id);
    this.resetSwipe();
  }

  resetSwipe() {
    this.swipeOffset = 0;
    this.showActions = false;
    this.isSwiping = false;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}

