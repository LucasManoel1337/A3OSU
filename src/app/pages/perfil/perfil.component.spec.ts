import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { LoadingService } from '../../core/services/loading.service';

import { PerfilComponent } from './perfil.component';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: {
            getProfile: () => of({
              username: 'player',
              idUser: 1,
              nationality: 'br',
              verificado: false,
              conquistas: [],
              criadoEm: ''
            }),
            getProfileById: () => of({
              username: 'player',
              idUser: 1,
              nationality: 'br',
              verificado: false,
              conquistas: [],
              criadoEm: ''
            }),
            getAvatar: () => of(new Blob()),
            getBanner: () => of(new Blob())
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the default image states after the profile has no uploaded images', async () => {
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 510));
    fixture.detectChanges();

    let isLoading = true;
    TestBed.inject(LoadingService).loading$.subscribe(value => isLoading = value);

    expect(component.avatarLoading).toBe(false);
    expect(component.bannerLoading).toBe(false);
    expect(component.avatarPreview).toBe('');
    expect(component.bannerPreview).toBe('');
    expect(isLoading).toBe(false);
    expect(fixture.nativeElement.querySelector('.avatar-loading')).toBeNull();
    expect(fixture.nativeElement.querySelector('.image-spinner')).toBeNull();
    expect(fixture.nativeElement.querySelector('.avatar-large')).not.toBeNull();
  });

  it('shows profile summary data using only known achievements', () => {
    component.conquistasDoUsuario = ['FOUNDER', 'FOUNDER', 'ORGANIZADOR', 'UNKNOWN'];

    expect(component.totalConquistasDesbloqueadas).toBe(2);
    expect(component.progressoConquistas).toBe(50);
  });

  it('keeps the Founder achievement secret until it is unlocked', () => {
    component.conquistasDoUsuario = ['MEMBRO_BETA'];

    expect(component.totalConquistasDesbloqueadas).toBe(1);
    expect(component.vitrineDeMedalhas).toHaveLength(3);
    expect(component.vitrineDeMedalhas.some(medalha => medalha.label === 'Fundador Beta')).toBe(false);
    expect(component.progressoConquistas).toBeCloseTo(100 / 3);
  });
});
