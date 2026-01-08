import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExpenseItemStore } from '../../stores/expense-item.store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseItemService } from '../../services/expense-item.service';
import { ExpenseItem } from '../../models/expense-item.interface';

@Component({
  selector: 'app-expense-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [ExpenseItemStore],
  templateUrl: './expense-item-form.component.html',
  styleUrl: './expense-item-form.component.css',
})
export class ExpenseItemFormComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  fb = inject(FormBuilder);
  itemStore = inject(ExpenseItemStore);
  itemService = inject(ExpenseItemService);

  itemForm!: FormGroup;
  expenseId = '';
  categoryId = '';
  itemId: string | null = null;
  isEditMode = false;

  ngOnInit() {
    this.itemForm = this.fb.group({
      title: ['', [Validators.required]],
      cost: [0, [Validators.required, Validators.min(0)]],
      date: [new Date().toISOString().split('T')[0], [Validators.required]],
      time: [new Date().toTimeString().slice(0, 5), [Validators.required]],
      notes: [''],
      subItems: this.fb.array([]),
    });

    this.route.params.subscribe((params) => {
      this.expenseId = params['expenseId'];
      this.categoryId = params['categoryId'];
      this.itemId = params['id'];
      if (this.itemId && this.itemId !== 'new') {
        this.isEditMode = true;
        this.loadItem();
      }
    });
  }

  get subItemsFormArray() {
    return this.itemForm.get('subItems') as FormArray<FormControl>;
  }

  addSubItem() {
    this.subItemsFormArray.push(this.fb.control(''));
  }

  removeSubItem(index: number) {
    this.subItemsFormArray.removeAt(index);
  }

  async loadItem() {
    if (this.itemId) {
      const item = await this.itemService.getById(this.itemId);
      if (item) {
        // Clear existing subItems
        while (this.subItemsFormArray.length !== 0) {
          this.subItemsFormArray.removeAt(0);
        }
        // Add subItems from item
        item.subItems.forEach((subItem) => {
          this.subItemsFormArray.push(this.fb.control(subItem));
        });

        this.itemForm.patchValue({
          title: item.title,
          cost: item.cost,
          date: item.date,
          time: item.time,
          notes: item.notes,
        });
      }
    }
  }

  async onSubmit() {
    if (this.itemForm.valid) {
      const formValue = this.itemForm.value;
      const subItems = this.subItemsFormArray.value.filter((item: string) => item.trim() !== '');

      const itemData = {
        ...formValue,
        subItems,
        expenseCategoryId: this.categoryId,
      };

      if (this.isEditMode && this.itemId) {
        await this.itemStore.updateItem({
          id: this.itemId,
          updates: itemData,
        });
      } else {
        await this.itemStore.addItem(itemData);
      }
      this.router.navigate(['/expense', this.expenseId, 'category', this.categoryId, 'items']);
    }
  }

  onCancel() {
    this.router.navigate(['/expense', this.expenseId, 'category', this.categoryId, 'items']);
  }
}

