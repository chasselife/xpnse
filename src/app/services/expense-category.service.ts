import { Injectable } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { ExpenseCategory } from '../models/expense-category.interface';

@Injectable({
  providedIn: 'root'
})
export class ExpenseCategoryService {
  constructor(private db: IndexedDbService) {}

  async getAll(): Promise<ExpenseCategory[]> {
    await this.db.init();
    return await this.db.getAll<ExpenseCategory>('categories');
  }

  async getByExpenseId(expenseId: string): Promise<ExpenseCategory[]> {
    await this.db.init();
    return await this.db.getByIndex<ExpenseCategory>('categories', 'by-expenseId', expenseId);
  }

  async getById(id: string): Promise<ExpenseCategory | undefined> {
    await this.db.init();
    return await this.db.get<ExpenseCategory>('categories', id);
  }

  async create(
    category: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ExpenseCategory> {
    await this.db.init();
    const now = new Date().toISOString();
    const newCategory: ExpenseCategory = {
      ...category,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    return await this.db.add('categories', newCategory);
  }

  async update(
    id: string,
    updates: Partial<Omit<ExpenseCategory, 'id' | 'createdAt'>>
  ): Promise<ExpenseCategory> {
    await this.db.init();
    const existing = await this.db.get<ExpenseCategory>('categories', id);
    if (!existing) {
      throw new Error(`Category with id ${id} not found`);
    }
    const updated: ExpenseCategory = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    return await this.db.update('categories', updated);
  }

  async delete(id: string): Promise<void> {
    await this.db.init();
    await this.db.delete('categories', id);
  }
}


