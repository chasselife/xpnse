import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExpenseStore } from '../../stores/expense.store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.interface';
import { ExpenseCardComponent } from '../../components/expense-card/expense-card.component';
import { MatSelectModule } from '@angular/material/select';
import { CHECKLIST_ICON_OPTIONS } from '../../constants/icon-options.constant';
import { COLOR_OPTIONS } from '../../constants/color-options.constant';
import { ColorPickerComponent } from '../../components/color-picker/color-picker.component';

@Component({
  selector: 'app-expense-form',
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
    ExpenseCardComponent,
    ColorPickerComponent,
  ],
  providers: [ExpenseStore],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.css',
})
export class ExpenseFormComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  fb = inject(FormBuilder);
  expenseStore = inject(ExpenseStore);
  expenseService = inject(ExpenseService);

  form!: FormGroup;
  expenseId: string | null = null;
  isEditMode = false;

  icons = CHECKLIST_ICON_OPTIONS;

  colorOptions = COLOR_OPTIONS;

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      icon: ['', [Validators.required]],
      color: ['#2196f3', [Validators.required]],
    });

    this.route.params.subscribe((params) => {
      this.expenseId = params['id'];
      if (this.expenseId && this.expenseId !== 'new') {
        this.isEditMode = true;
        this.loadExpense();
      }
    });
  }

  getSelectedIcon(): { value: string; label: string } | undefined {
    const selectedValue = this.form.get('icon')?.value;
    return this.icons.find((icon) => icon.value === selectedValue);
  }

  async loadExpense() {
    if (this.expenseId) {
      const expense = await this.expenseService.getById(this.expenseId);
      if (expense) {
        this.form.patchValue({
          title: expense.title,
          description: expense.description,
          icon: expense.icon,
          color: expense.color,
        });
      }
    }
  }

  async onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      if (this.isEditMode && this.expenseId) {
        await this.expenseStore.updateExpense({
          id: this.expenseId,
          updates: formValue,
        });
      } else {
        await this.expenseStore.addExpense(formValue);
      }
      this.router.navigate(['/']);
    }
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}

