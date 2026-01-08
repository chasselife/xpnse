import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExpenseCategoryStore } from '../../stores/expense-category.store';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseItemService } from '../../services/expense-item.service';
import { ExpenseCategoryCardComponent } from '../../components/expense-category-card/expense-category-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseCategory } from '../../models/expense-category.interface';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ExpenseCategoryCardComponent,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [ExpenseCategoryStore],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css',
})
export class ExpenseComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  categoryStore = inject(ExpenseCategoryStore);
  expenseService = inject(ExpenseService);
  itemService = inject(ExpenseItemService);

  expenseId = '';
  expenseTitle = '';
  editMode = false;
  categoriesWithData: Array<{
    category: ExpenseCategory;
    totalCost: number;
    dateRange: { min: string; max: string } | null;
  }> = [];

  constructor() {
    effect(() => {
      const categories = this.categoryStore.categories();
      this.loadCategoriesData(categories);
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.expenseId = params['id'];
      this.loadExpense();
      this.categoryStore.loadCategories(this.expenseId);
    });
  }

  async loadExpense() {
    const expense = await this.expenseService.getById(this.expenseId);
    if (expense) {
      this.expenseTitle = expense.title;
    }
  }

  async loadCategoriesData(categories: ExpenseCategory[]) {
    const categoriesWithData = await Promise.all(
      categories.map(async (category) => {
        const totalCost = await this.itemService.getTotalCostByCategoryId(category.id);
        const dateRange = await this.itemService.getDateRangeByCategoryId(category.id);
        return {
          category,
          totalCost,
          dateRange,
        };
      })
    );
    this.categoriesWithData = categoriesWithData;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  onEditCategory(category: ExpenseCategory) {
    this.router.navigate(['/expense', this.expenseId, 'category', category.id, 'edit']);
  }

  async onDeleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryStore.deleteCategory(id);
    }
  }
}
