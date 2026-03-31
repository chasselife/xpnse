import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ICON_OPTIONS, IconOption } from '../../constants/icon-options.constant';
import { ExpenseCategoryService } from '../../services/expense-category.service';
import { ExpenseCategoryStore } from '../../stores/expense-category.store';
import { COLOR_OPTIONS } from '../../constants/color-options.constant';
import { ColorPickerComponent } from '../../components/color-picker/color-picker.component';
import { ExpenseCategoryCardComponent } from '../../components/expense-category-card/expense-category-card.component';

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
    MatIconModule,
    MatSelectModule,
    ColorPickerComponent,
    ExpenseCategoryCardComponent,
  ],
  providers: [ExpenseCategoryStore],
  templateUrl: './expense-category-form.component.html',
  styleUrl: './expense-category-form.component.css',
})
export class ExpenseCategoryFormComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  fb = inject(FormBuilder);
  categoryStore = inject(ExpenseCategoryStore);
  categoryService = inject(ExpenseCategoryService);

  form!: FormGroup;
  expenseId = '';
  categoryId: string | null = null;
  isEditMode = false;

  colorOptions = COLOR_OPTIONS;
  icons = ICON_OPTIONS;

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      icon: ['', [Validators.required]],
      color: ['#4caf50', [Validators.required]],
    });

    this.route.params.subscribe((params) => {
      this.expenseId = params['expenseId'];
      this.categoryId = params['id'];
      if (this.categoryId && this.categoryId !== 'new') {
        this.isEditMode = true;
        this.loadCategory();
      }
    });
  }

  getSelectedIcon(): { value: string; label: string } | undefined {
    const selectedValue = this.form.get('icon')?.value;
    return this.icons.find((icon: IconOption) => icon.value === selectedValue);
  }

  async loadCategory() {
    if (this.categoryId) {
      const category = await this.categoryService.getById(this.categoryId);
      if (category) {
        this.form.patchValue({
          title: category.title,
          description: category.description,
          icon: category.icon,
          color: category.color,
        });
      }
    }
  }

  async onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      if (this.isEditMode && this.categoryId) {
        await this.categoryStore.updateCategory({
          id: this.categoryId,
          updates: formValue,
        });
      } else {
        await this.categoryStore.addCategory({
          ...formValue,
          expenseId: this.expenseId,
        });
      }
      this.router.navigate(['/expense', this.expenseId]);
    }
  }

  onCancel() {
    this.router.navigate(['/expense', this.expenseId]);
  }
}
