import { Injectable } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { ExpenseItem } from '../models/expense-item.interface';
import { ExpenseCategory } from '../models/expense-category.interface';

@Injectable({
  providedIn: 'root'
})
export class ExpenseItemService {
  constructor(private db: IndexedDbService) {}

  async getAll(): Promise<ExpenseItem[]> {
    await this.db.init();
    return await this.db.getAll<ExpenseItem>('items');
  }

  async getByCategoryId(categoryId: string): Promise<ExpenseItem[]> {
    await this.db.init();
    return await this.db.getByIndex<ExpenseItem>('items', 'by-categoryId', categoryId);
  }

  async getById(id: string): Promise<ExpenseItem | undefined> {
    await this.db.init();
    return await this.db.get<ExpenseItem>('items', id);
  }

  async create(item: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExpenseItem> {
    await this.db.init();
    const now = new Date().toISOString();
    const newItem: ExpenseItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    return await this.db.add('items', newItem);
  }

  async update(
    id: string,
    updates: Partial<Omit<ExpenseItem, 'id' | 'createdAt'>>
  ): Promise<ExpenseItem> {
    await this.db.init();
    const existing = await this.db.get<ExpenseItem>('items', id);
    if (!existing) {
      throw new Error(`Item with id ${id} not found`);
    }
    const updated: ExpenseItem = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    return await this.db.update('items', updated);
  }

  async delete(id: string): Promise<void> {
    await this.db.init();
    await this.db.delete('items', id);
  }

  // Aggregation methods
  async getTotalCostByCategoryId(categoryId: string): Promise<number> {
    const items = await this.getByCategoryId(categoryId);
    return items.reduce((total, item) => total + item.cost, 0);
  }

  async getDateRangeByCategoryId(categoryId: string): Promise<{ min: string; max: string } | null> {
    const items = await this.getByCategoryId(categoryId);
    if (items.length === 0) {
      return null;
    }
    const dates = items.map(item => item.date).sort();
    return {
      min: dates[0],
      max: dates[dates.length - 1]
    };
  }

  async getTotalCostByExpenseId(expenseId: string): Promise<number> {
    // Get all categories for this expense, then get all items for those categories
    const categories = await this.db.getByIndex<ExpenseCategory>('categories', 'by-expenseId', expenseId);
    let total = 0;
    for (const category of categories) {
      const items = await this.getByCategoryId(category.id);
      total += items.reduce((sum, item) => sum + item.cost, 0);
    }
    return total;
  }

  async getDateRangeByExpenseId(
    expenseId: string
  ): Promise<{ min: string; max: string } | null> {
    const categories = await this.db.getByIndex<ExpenseCategory>('categories', 'by-expenseId', expenseId);
    const allDates: string[] = [];
    for (const category of categories) {
      const items = await this.getByCategoryId(category.id);
      allDates.push(...items.map(item => item.date));
    }
    if (allDates.length === 0) {
      return null;
    }
    const sortedDates = allDates.sort();
    return {
      min: sortedDates[0],
      max: sortedDates[sortedDates.length - 1]
    };
  }
}

