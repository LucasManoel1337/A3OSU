import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SobreProjetoComponent } from './sobre-projeto.component';

describe('SobreProjetoComponent', () => {
  let component: SobreProjetoComponent;
  let fixture: ComponentFixture<SobreProjetoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SobreProjetoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SobreProjetoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
