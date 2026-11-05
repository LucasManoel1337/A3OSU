import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.css'
})
export class CustomInputComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() name: string = '';
  @Input() disabled: boolean = false;
  @Input() showPasswordToggle = false;

  // Lógica para fazer o [(value)] funcionar externamente
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  passwordVisible = false;

  get inputType(): string {
    return this.showPasswordToggle && this.type === 'password' && this.passwordVisible
      ? 'text'
      : this.type;
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onValueChange(newValue: string) {
    this.value = newValue;
    this.valueChange.emit(newValue);
  }
}