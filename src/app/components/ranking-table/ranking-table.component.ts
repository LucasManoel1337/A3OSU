import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necessário para o ngModel da busca

@Component({
    selector: 'app-ranking-table',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ranking-table.component.html',
    styleUrls: ['./ranking-table.component.css']
})
export class RankingTableComponent implements OnChanges {
    @Input() title: string = 'Ranking';
    @Input() icon: string = '🏆';
    // Define quais propriedades do objeto serão mostradas nas colunas
    @Input() columns: { key: string, label: string, hasFlag?: boolean }[] = [];
    @Input() data: any[] = [];

    @Output() rowClick = new EventEmitter<any>();

    searchTerm: string = '';
    filteredData: any[] = [];

    // Sempre que os dados de entrada mudarem, atualizamos a lista filtrada
    ngOnChanges() {
        this.filterData();
    }

    filterData() {
        if (!this.searchTerm) {
            this.filteredData = [...this.data];
            return;
        }

        const term = this.searchTerm.toLowerCase();

        this.filteredData = this.data.filter(item => {
            return Object.values(item).some(val =>
                String(val).toLowerCase().includes(term)
            );
        });
    }

    onRowClick(row: any) {
        this.rowClick.emit(row);
    }
}