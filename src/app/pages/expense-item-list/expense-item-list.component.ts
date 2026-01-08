import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExpenseItemStore } from '../../stores/expense-item.store';
import { ExpenseCategoryService } from '../../services/expense-category.service';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseItemCardComponent } from '../../components/expense-item-card/expense-item-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseItem } from '../../models/expense-item.interface';

@Component({
  selector: 'app-expense-item-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ExpenseItemCardComponent,
    MatButtonModule,
    MatIconModule
  ],
  providers: [ExpenseItemStore],
  templateUrl: './expense-item-list.component.html',
  styleUrl: './expense-item-list.component.css'
})
export class ExpenseItemListComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  itemStore = inject(ExpenseItemStore);
  categoryService = inject(ExpenseCategoryService);
  expenseService = inject(ExpenseService);

  expenseId = '';
  categoryId = '';
  categoryTitle = '';
  expenseTitle = '';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.expenseId = params['expenseId'];
      this.categoryId = params['categoryId'];
      this.loadData();
      this.itemStore.loadItems(this.categoryId);
    });
  }

  async loadData() {
    const category = await this.categoryService.getById(this.categoryId);
    if (category) {
      this.categoryTitle = category.title;
    }
    const expense = await this.expenseService.getById(this.expenseId);
    if (expense) {
      this.expenseTitle = expense.title;
    }
  }

  onEditItem(item: ExpenseItem) {
    this.router.navigate(['/expense', this.expenseId, 'category', this.categoryId, 'item', item.id, 'edit']);
  }

  async onDeleteItem(id: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.itemStore.deleteItem(id);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}

