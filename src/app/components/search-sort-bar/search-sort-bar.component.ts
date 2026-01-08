import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

export type SortOption = 'date' | 'title' | 'cost';

@Component({
  selector: 'app-search-sort-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './search-sort-bar.component.html',
  styleUrl: './search-sort-bar.component.css'
})
export class SearchSortBarComponent {
  searchQuery = output<string>();
  sortOption = output<SortOption>();

  searchValue = signal('');
  sortValue = signal<SortOption>('date');

  onSearchChange(value: string) {
    this.searchValue.set(value);
    this.searchQuery.emit(value);
  }

  onSortChange(value: SortOption) {
    this.sortValue.set(value);
    this.sortOption.emit(value);
  }
}


