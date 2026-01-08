import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Expense } from '../models/expense.interface';
import { ExpenseCategory } from '../models/expense-category.interface';
import { ExpenseItem } from '../models/expense-item.interface';

interface ExpenseTrackerDB extends DBSchema {
  expenses: {
    key: string;
    value: Expense;
    indexes: { 'by-createdAt': string };
  };
  categories: {
    key: string;
    value: ExpenseCategory;
    indexes: { 'by-expenseId': string; 'by-createdAt': string };
  };
  items: {
    key: string;
    value: ExpenseItem;
    indexes: {
      'by-categoryId': string;
      'by-date': string;
      'by-createdAt': string;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private dbName = 'expense-tracker-db';
  private dbVersion = 1;
  private db: IDBPDatabase<ExpenseTrackerDB> | null = null;

  async init(): Promise<IDBPDatabase<ExpenseTrackerDB>> {
    if (this.db) {
      return this.db;
    }

    this.db = await openDB<ExpenseTrackerDB>(this.dbName, this.dbVersion, {
      upgrade(db: IDBPDatabase<ExpenseTrackerDB>) {
        // Expenses store
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', {
            keyPath: 'id',
          });
          expenseStore.createIndex('by-createdAt', 'createdAt');
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', {
            keyPath: 'id',
          });
          categoryStore.createIndex('by-expenseId', 'expenseId');
          categoryStore.createIndex('by-createdAt', 'createdAt');
        }

        // Items store
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', {
            keyPath: 'id',
          });
          itemStore.createIndex('by-categoryId', 'expenseCategoryId');
          itemStore.createIndex('by-date', 'date');
          itemStore.createIndex('by-createdAt', 'createdAt');
        }
      },
    });

    return this.db;
  }

  async getDb(): Promise<IDBPDatabase<ExpenseTrackerDB>> {
    if (!this.db) {
      return await this.init();
    }
    return this.db;
  }

  // Generic CRUD operations
  async add<T extends Expense | ExpenseCategory | ExpenseItem>(
    storeName: 'expenses' | 'categories' | 'items',
    item: T
  ): Promise<T> {
    const db = await this.getDb();
    await db.put(storeName, item as any);
    return item;
  }

  async get<T extends Expense | ExpenseCategory | ExpenseItem>(
    storeName: 'expenses' | 'categories' | 'items',
    id: string
  ): Promise<T | undefined> {
    const db = await this.getDb();
    return (await db.get(storeName, id)) as T | undefined;
  }

  async getAll<T extends Expense | ExpenseCategory | ExpenseItem>(
    storeName: 'expenses' | 'categories' | 'items'
  ): Promise<T[]> {
    const db = await this.getDb();
    return (await db.getAll(storeName)) as T[];
  }

  async update<T extends Expense | ExpenseCategory | ExpenseItem>(
    storeName: 'expenses' | 'categories' | 'items',
    item: T
  ): Promise<T> {
    const db = await this.getDb();
    await db.put(storeName, item as any);
    return item;
  }

  async delete(storeName: 'expenses' | 'categories' | 'items', id: string): Promise<void> {
    const db = await this.getDb();
    await db.delete(storeName, id);
  }

  // Query operations
  async getByIndex<T extends Expense | ExpenseCategory | ExpenseItem>(
    storeName: 'expenses' | 'categories' | 'items',
    indexName: string,
    value: string
  ): Promise<T[]> {
    const db = await this.getDb();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName as keyof ExpenseTrackerDB[typeof storeName]['indexes']);
    return (await index.getAll(value)) as T[];
  }
}
