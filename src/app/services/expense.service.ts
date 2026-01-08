import { Injectable } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { Expense } from '../models/expense.interface';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  constructor(private db: IndexedDbService) {}

  async getAll(): Promise<Expense[]> {
    await this.db.init();
    return await this.db.getAll<Expense>('expenses');
  }

  async getById(id: string): Promise<Expense | undefined> {
    await this.db.init();
    return await this.db.get<Expense>('expenses', id);
  }

  async create(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    await this.db.init();
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    return await this.db.add('expenses', newExpense);
  }

  async update(id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<Expense> {
    await this.db.init();
    const existing = await this.db.get<Expense>('expenses', id);
    if (!existing) {
      throw new Error(`Expense with id ${id} not found`);
    }
    const updated: Expense = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    return await this.db.update('expenses', updated);
  }

  async delete(id: string): Promise<void> {
    await this.db.init();
    await this.db.delete('expenses', id);
  }
}

