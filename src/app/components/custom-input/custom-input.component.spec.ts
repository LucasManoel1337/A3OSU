import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomInputComponent } from './custom-input.component';

describe('CustomInput', () => {
  let component: CustomInputComponent;
  let fixture: ComponentFixture<CustomInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomInputComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles password visibility accessibly when enabled', () => {
    fixture.componentRef.setInput('type', 'password');
    fixture.componentRef.setInput('showPasswordToggle', true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const toggle = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(input.type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Mostrar senha');

    toggle.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Ocultar senha');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });
});
