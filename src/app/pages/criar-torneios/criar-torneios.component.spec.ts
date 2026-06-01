import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriarTorneiosComponent } from './criar-torneios.component';

describe('CriarTorneiosComponent', () => {
  let component: CriarTorneiosComponent;
  let fixture: ComponentFixture<CriarTorneiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarTorneiosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarTorneiosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
