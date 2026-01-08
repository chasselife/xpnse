import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ExpenseCategory } from '../../models/expense-category.interface';

@Component({
  selector: 'app-expense-category-card',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './expense-category-card.component.html',
  styleUrl: './expense-category-card.component.css'
})
export class ExpenseCategoryCardComponent {
  category = input.required<ExpenseCategory>();
  totalCost = input<number>(0);
  dateRange = input<{ min: string; max: string } | null>(null);
  expenseId = input.required<string>();
  editMode = input<boolean>(false);
  
  edit = output<ExpenseCategory>();
  delete = output<string>();

  longPressTimer: any = null;
  isEditMode = signal(false);

  onTouchStart(event: TouchEvent) {
    this.longPressTimer = setTimeout(() => {
      this.isEditMode.set(true);
    }, 500);
  }

  onTouchMove() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  onTouchEnd() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  onEdit() {
    this.edit.emit(this.category());
  }

  onDelete() {
    this.delete.emit(this.category().id);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}


