import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExpenseCategoryStore } from '../../stores/expense-category.store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseCategoryService } from '../../services/expense-category.service';
import { ExpenseCategory } from '../../models/expense-category.interface';

@Component({
  selector: 'app-expense-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [ExpenseCategoryStore],
  templateUrl: './expense-category-form.component.html',
  styleUrl: './expense-category-form.component.css'
})
export class ExpenseCategoryFormComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  fb = inject(FormBuilder);
  categoryStore = inject(ExpenseCategoryStore);
  categoryService = inject(ExpenseCategoryService);

  categoryForm!: FormGroup;
  expenseId = '';
  categoryId: string | null = null;
  isEditMode = false;

  ngOnInit() {
    this.categoryForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      icon: ['', [Validators.required]],
      color: ['#4caf50', [Validators.required]]
    });

    this.route.params.subscribe(params => {
      this.expenseId = params['expenseId'];
      this.categoryId = params['id'];
      if (this.categoryId && this.categoryId !== 'new') {
        this.isEditMode = true;
        this.loadCategory();
      }
    });
  }

  async loadCategory() {
    if (this.categoryId) {
      const category = await this.categoryService.getById(this.categoryId);
      if (category) {
        this.categoryForm.patchValue({
          title: category.title,
          description: category.description,
          icon: category.icon,
          color: category.color
        });
      }
    }
  }

  async onSubmit() {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      if (this.isEditMode && this.categoryId) {
        await this.categoryStore.updateCategory({
          id: this.categoryId,
          updates: formValue
        });
      } else {
        await this.categoryStore.addCategory({
          ...formValue,
          expenseId: this.expenseId
        });
      }
      this.router.navigate(['/expense', this.expenseId]);
    }
  }

  onCancel() {
    this.router.navigate(['/expense', this.expenseId]);
  }
}


