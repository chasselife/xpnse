export interface ExpenseItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  time: string;
  expenseCategoryId: string;
  title: string;
  subItems: string[];
  notes: string;
  cost: number;
}


