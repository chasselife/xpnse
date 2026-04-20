import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { ExpenseCardComponent } from '../../components/expense-card/expense-card.component';
import { ExpenseCategory } from '../../models/expense-category.interface';
import { Expense } from '../../models/expense.interface';
import { ExpenseCategoryService } from '../../services/expense-category.service';
import { ExpenseItemService } from '../../services/expense-item.service';
import { ExpenseStore } from '../../stores/expense.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ExpenseCardComponent,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatMenuModule,
  ],
  providers: [ExpenseStore],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  expenseStore = inject(ExpenseStore);
  categoryService = inject(ExpenseCategoryService);
  itemService = inject(ExpenseItemService);
  dialog = inject(MatDialog);
  router = inject(Router);

  expensesWithData = signal<
    {
      expense: Expense;
      totalCost: number;
      dateRange: { min: string; max: string } | null;
      categories: ExpenseCategory[];
    }[]
  >([]);

  constructor() {
    effect(() => {
      // Reload data when filtered expenses change
      const expenses = this.expenseStore.filteredExpenses();
      this.loadExpensesData(expenses);
    });
  }

  ngOnInit() {
    const expenses = this.expenseStore.filteredExpenses();
    this.loadExpensesData(expenses);
  }

  async loadExpensesData(expenses: Expense[]) {
    const expensesWithData = await Promise.all(
      expenses.map(async (expense) => {
        const categories = await this.categoryService.getByExpenseId(expense.id);
        const totalCost = await this.itemService.getTotalCostByExpenseId(expense.id);
        const dateRange = await this.itemService.getDateRangeByExpenseId(expense.id);
        return {
          expense,
          totalCost,
          dateRange,
          categories,
        };
      })
    );
    this.expensesWithData.set(expensesWithData);
  }

  onSearch(query: string) {
    this.expenseStore.searchExpenses(query);
  }

  onSort(option: 'date' | 'title' | 'cost') {
    this.expenseStore.sortExpenses(option);
  }

  onEditExpense(expense: Expense) {
    this.router.navigate(['/expense', expense.id, 'edit']);
  }

  async onDeleteExpense(id: string) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseStore.deleteExpense(id);
    }
  }
}
