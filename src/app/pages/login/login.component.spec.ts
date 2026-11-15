import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { LoginComponent } from './login.component';
import { parseActiveBan, parseActiveTournamentSuspension } from '../../core/models/user-punishment.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('parses a structured ban response when nullable fields are omitted', () => {
    const punishment = parseActiveBan({
      error: 'ACTIVE_BAN',
      punishment: {
        type: 'BANIMENTO_TEMPORARIO',
        reason: 'Quebra das regras da comunidade',
        expiresAt: '2026-12-01T10:30:00'
      }
    });

    expect(punishment?.type).toBe('BANIMENTO_TEMPORARIO');
    expect(punishment?.reason).toBe('Quebra das regras da comunidade');
    expect(punishment?.expiresAt).toBe('2026-12-01T10:30:00');
    expect(punishment?.appliedByUsername).toBe('Moderação da plataforma');
    expect(punishment?.appliedByAvatarUrl).toBeNull();
    expect(punishment?.appliedByVerified).toBe(false);
  });

  it('parses a JSON response body returned as text', () => {
    const punishment = parseActiveBan(JSON.stringify({
      error: 'ACTIVE_BAN',
      punishment: {
        type: 'BANIMENTO_PERMANENTE',
        reason: 'Fraude confirmada'
      }
    }));

    expect(punishment?.reason).toBe('Fraude confirmada');
  });

  it('does not interpret other authentication errors as bans', () => {
    expect(parseActiveBan({ message: 'Credenciais inválidas.' })).toBeNull();
  });

  it('parses tournament suspension details for the shared notice', () => {
    const punishment = parseActiveTournamentSuspension({
      error: 'ACTIVE_TOURNAMENT_SUSPENSION',
      punishment: {
        type: 'SUSPENSAO_RANQUEADO',
        reason: 'Suspensão de teste'
      }
    });

    expect(punishment?.type).toBe('SUSPENSAO_RANQUEADO');
    expect(punishment?.reason).toBe('Suspensão de teste');
  });
});
