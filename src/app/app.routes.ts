import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'expense/new',
    loadComponent: () =>
      import('./pages/expense-form/expense-form.component').then((m) => m.ExpenseFormComponent),
  },
  {
    path: 'expense/:id/edit',
    loadComponent: () =>
      import('./pages/expense-form/expense-form.component').then((m) => m.ExpenseFormComponent),
  },
  {
    path: 'expense/:id',
    loadComponent: () =>
      import('./pages/expense/expense.component').then((m) => m.ExpenseComponent),
  },
  {
    path: 'expense/:expenseId/category/new',
    loadComponent: () =>
      import('./pages/expense-category-form/expense-category-form.component').then(
        (m) => m.ExpenseCategoryFormComponent
      ),
  },
  {
    path: 'expense/:expenseId/category/:id/edit',
    loadComponent: () =>
      import('./pages/expense-category-form/expense-category-form.component').then(
        (m) => m.ExpenseCategoryFormComponent
      ),
  },
  {
    path: 'expense/:expenseId/category/:categoryId/items',
    loadComponent: () =>
      import('./pages/expense-item-list/expense-item-list.component').then(
        (m) => m.ExpenseItemListComponent
      ),
  },
  {
    path: 'expense/:expenseId/category/:categoryId/item/new',
    loadComponent: () =>
      import('./pages/expense-item-form/expense-item-form.component').then(
        (m) => m.ExpenseItemFormComponent
      ),
  },
  {
    path: 'expense/:expenseId/category/:categoryId/item/:id/edit',
    loadComponent: () =>
      import('./pages/expense-item-form/expense-item-form.component').then(
        (m) => m.ExpenseItemFormComponent
      ),
  },
];
