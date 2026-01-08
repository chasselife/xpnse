import { signalStore, withState, withMethods, withHooks, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { ExpenseCategoryService } from '../services/expense-category.service';
import { ExpenseCategory } from '../models/expense-category.interface';
import { pipe, switchMap, catchError, of, from } from 'rxjs';
import { tap } from 'rxjs/operators';

type ExpenseCategoryState = {
  categories: ExpenseCategory[];
  loading: boolean;
  error: string | null;
  expenseId: string | null;
};

const initialState: ExpenseCategoryState = {
  categories: [],
  loading: false,
  error: null,
  expenseId: null
};

export const ExpenseCategoryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, categoryService = inject(ExpenseCategoryService)) => {
    return {
      loadCategories: rxMethod<string>(
        pipe(
          tap((expenseId) => patchState(store, { loading: true, error: null, expenseId })),
          switchMap(expenseId =>
            from(categoryService.getByExpenseId(expenseId)).pipe(
              catchError(error => {
                patchState(store, { loading: false, error: error.message || 'Failed to load categories' });
                return of([]);
              })
            )
          ),
          tap((categories) => {
            patchState(store, { categories, loading: false });
          })
        )
      ),

      addCategory: rxMethod<Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(categoryData =>
            from(categoryService.create(categoryData)).pipe(
              catchError(error => {
                patchState(store, { loading: false, error: error.message || 'Failed to create category' });
                return of(null);
              })
            )
          ),
          tap(category => {
            if (category) {
              const updated = [...store.categories(), category];
              patchState(store, { categories: updated, loading: false });
            }
          })
        )
      ),

      updateCategory: rxMethod<{ id: string; updates: Partial<Omit<ExpenseCategory, 'id' | 'createdAt'>> }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ id, updates }) =>
            from(categoryService.update(id, updates)).pipe(
              catchError(error => {
                patchState(store, { loading: false, error: error.message || 'Failed to update category' });
                return of(null);
              })
            )
          ),
          tap(category => {
            if (category) {
              const updated = store.categories().map(c => (c.id === category.id ? category : c));
              patchState(store, { categories: updated, loading: false });
            }
          })
        )
      ),

      deleteCategory: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(id =>
            from(categoryService.delete(id)).pipe(
              tap(() => {
                const updated = store.categories().filter(c => c.id !== id);
                patchState(store, { categories: updated, loading: false });
              }),
              catchError(error => {
                patchState(store, { loading: false, error: error.message || 'Failed to delete category' });
                return of(void 0);
              })
            )
          )
        )
      )
    };
  })
);

