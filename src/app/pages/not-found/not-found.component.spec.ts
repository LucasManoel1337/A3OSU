import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  it('shows a not-found message and a link back to the app home', async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    const fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Parece que você se perdeu.');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/home');
  });
});
