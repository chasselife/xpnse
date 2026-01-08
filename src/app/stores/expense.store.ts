import { signalStore, withState, withMethods, withHooks, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { ExpenseItemService } from '../services/expense-item.service';
import { Expense } from '../models/expense.interface';
import { pipe, switchMap, catchError, of, from } from 'rxjs';
import { tap } from 'rxjs/operators';

type ExpenseState = {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortOption: 'date' | 'title' | 'cost';
  filteredExpenses: Expense[];
};

const initialState: ExpenseState = {
  expenses: [],
  loading: false,
  error: null,
  searchQuery: '',
  sortOption: 'date',
  filteredExpenses: [],
};

export const ExpenseStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (store, expenseService = inject(ExpenseService), itemService = inject(ExpenseItemService)) => {
      const filterAndSort = (
        expenses: Expense[],
        query: string,
        sort: ExpenseState['sortOption']
      ) => {
        let filtered = expenses;

        // Filter by search query
        if (query.trim()) {
          const lowerQuery = query.toLowerCase();
          filtered = expenses.filter(
            (exp) =>
              exp.title.toLowerCase().includes(lowerQuery) ||
              exp.description.toLowerCase().includes(lowerQuery)
          );
        }

        // Sort
        const sorted = [...filtered].sort((a, b) => {
          switch (sort) {
            case 'date':
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'title':
              return a.title.localeCompare(b.title);
            case 'cost':
              // This will be calculated, but for now use createdAt as fallback
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            default:
              return 0;
          }
        });

        return sorted;
      };

      return {
        loadExpenses: rxMethod<void>(
          pipe(
            tap(() => patchState(store, { loading: true, error: null })),
            switchMap(() =>
              from(expenseService.getAll()).pipe(
                catchError((error) => {
                  patchState(store, {
                    loading: false,
                    error: error.message || 'Failed to load expenses',
                  });
                  return of([]);
                })
              )
            ),
            tap((expenses) => {
              const filtered = filterAndSort(expenses, store.searchQuery(), store.sortOption());
              patchState(store, { expenses, filteredExpenses: filtered, loading: false });
            })
          )
        ),

        addExpense: rxMethod<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>(
          pipe(
            tap(() => patchState(store, { loading: true, error: null })),
            switchMap((expenseData) =>
              from(expenseService.create(expenseData)).pipe(
                catchError((error) => {
                  patchState(store, {
                    loading: false,
                    error: error.message || 'Failed to create expense',
                  });
                  return of(null);
                })
              )
            ),
            tap((expense) => {
              if (expense) {
                const updated = [...store.expenses(), expense];
                const filtered = filterAndSort(updated, store.searchQuery(), store.sortOption());
                patchState(store, {
                  expenses: updated,
                  filteredExpenses: filtered,
                  loading: false,
                });
              }
            })
          )
        ),

        updateExpense: rxMethod<{
          id: string;
          updates: Partial<Omit<Expense, 'id' | 'createdAt'>>;
        }>(
          pipe(
            tap(() => patchState(store, { loading: true, error: null })),
            switchMap(({ id, updates }) =>
              from(expenseService.update(id, updates)).pipe(
                catchError((error) => {
                  patchState(store, {
                    loading: false,
                    error: error.message || 'Failed to update expense',
                  });
                  return of(null);
                })
              )
            ),
            tap((expense) => {
              if (expense) {
                const updated = store.expenses().map((e) => (e.id === expense.id ? expense : e));
                const filtered = filterAndSort(updated, store.searchQuery(), store.sortOption());
                patchState(store, {
                  expenses: updated,
                  filteredExpenses: filtered,
                  loading: false,
                });
              }
            })
          )
        ),

        deleteExpense: rxMethod<string>(
          pipe(
            tap(() => patchState(store, { loading: true, error: null })),
            switchMap((id) =>
              from(expenseService.delete(id)).pipe(
                tap(() => {
                  const updated = store.expenses().filter((e) => e.id !== id);
                  const filtered = filterAndSort(updated, store.searchQuery(), store.sortOption());
                  patchState(store, {
                    expenses: updated,
                    filteredExpenses: filtered,
                    loading: false,
                  });
                }),
                catchError((error) => {
                  patchState(store, {
                    loading: false,
                    error: error.message || 'Failed to delete expense',
                  });
                  return of(void 0);
                })
              )
            )
          )
        ),

        searchExpenses: (query: string) => {
          patchState(store, { searchQuery: query });
          const filtered = filterAndSort(store.expenses(), query, store.sortOption());
          patchState(store, { filteredExpenses: filtered });
        },

        sortExpenses: (sortOption: ExpenseState['sortOption']) => {
          patchState(store, { sortOption });
          const filtered = filterAndSort(store.expenses(), store.searchQuery(), sortOption);
          patchState(store, { filteredExpenses: filtered });
        },
      };
    }
  ),
  withHooks({
    onInit(store) {
      store.loadExpenses();
    },
  })
);
