import { signalStore, withState, withMethods, withHooks, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { ExpenseItemService } from '../services/expense-item.service';
import { ExpenseItem } from '../models/expense-item.interface';
import { pipe, switchMap, catchError, of, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { computed } from '@angular/core';

type ExpenseItemState = {
  items: ExpenseItem[];
  loading: boolean;
  error: string | null;
  categoryId: string | null;
};

const initialState: ExpenseItemState = {
  items: [],
  loading: false,
  error: null,
  categoryId: null
};

export const ExpenseItemStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    totalCost: computed(() => {
      return store.items().reduce((total, item) => total + item.cost, 0);
    }),
    dateRange: computed(() => {
      const items = store.items();
      if (items.length === 0) {
        return null;
      }
      const dates = items.map(item => item.date).sort();
      return {
        min: dates[0],
        max: dates[dates.length - 1]
      };
    })
  })),
  withMethods((store, itemService = inject(ExpenseItemService)) => {
    return {
      loadItems: rxMethod<string>(
        pipe(
          tap((categoryId) => patchState(store, { loading: true, error: null, categoryId })),
          switchMap(categoryId =>
            from(itemService.getByCategoryId(categoryId)).pipe(
              catchError(error => {
                patchState(store, { loading: false, error: error.message || 'Failed to load items' });
                return of([]);
              })
            )
          ),
          tap((items) => {
            patchState(store, { items, loading: false });
          })
        )
      ),

      addItem: rxMethod<Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt'>>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(itemData =>
            from(itemService.create(itemData)).pipe(
              catchError(error => {
                patchState(store, { loading: false, error: error.message || 'Failed to create item' });
                return of(null);
              })
            )
          ),
          tap(item => {
            if (item) {
              const updated = [...store.items(), item];
              patchState(store, { items: updated, loading: false });
            }
          })
        )
      ),

      updateItem: rxMethod<{ id: string; updates: Partial<Omit<ExpenseItem, 'id' | 'createdAt'>> }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ id, updates }) =>
            from(itemService.update(id, updates)).pipe(
              catchError(error => {
                patchState(store, { loading: false, error: error.message || 'Failed to update item' });
                return of(null);
              })
            )
          ),
          tap(item => {
            if (item) {
              const updated = store.items().map(i => (i.id === item.id ? item : i));
              patchState(store, { items: updated, loading: false });
            }
          })
        )
      ),

      deleteItem: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(id =>
            from(itemService.delete(id)).pipe(
              tap(() => {
                const updated = store.items().filter(i => i.id !== id);
                patchState(store, { items: updated, loading: false });
              }),
              catchError(error => {
                patchState(store, { loading: false, error: error.message || 'Failed to delete item' });
                return of(void 0);
              })
            )
          )
        )
      )
    };
  })
);

