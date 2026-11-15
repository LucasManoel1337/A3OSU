import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { TorneioService } from '../../core/services/torneios.service';
import { UserService } from '../../core/services/user.service';
import { TorneioDetalheComponent } from './torneio-detalhe.component';

describe('TorneioDetalheComponent', () => {
  let fixture: ComponentFixture<TorneioDetalheComponent>;
  let torneioSubject: Subject<any>;
  let inscritosSubject: Subject<any[]>;
  let usuarioSubject: Subject<any>;

  beforeEach(async () => {
    torneioSubject = new Subject();
    inscritosSubject = new Subject();
    usuarioSubject = new Subject();

    await TestBed.configureTestingModule({
      imports: [TorneioDetalheComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '42' } } }
        },
        {
          provide: TorneioService,
          useValue: {
            buscarTorneioPorId: () => torneioSubject,
            buscarInscritosDoTorneio: () => inscritosSubject
          }
        },
        {
          provide: UserService,
          useValue: { getProfile: () => usuarioSubject }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TorneioDetalheComponent);
    fixture.detectChanges();
  });

  it('shows the route loading modal until initial tournament data has loaded', async () => {
    expect(fixture.componentInstance.carregandoDados).toBe(true);
    expect(fixture.nativeElement.querySelector('.tournament-loading-overlay')).not.toBeNull();

    torneioSubject.next({
      id: 42,
      nome: 'Copa de Teste',
      status: 'Aguardando Início',
      bannerUrlTorneio: '',
      logoUrlTorneio: ''
    });
    inscritosSubject.next([]);
    expect(fixture.componentInstance.carregandoDados).toBe(true);

    usuarioSubject.next({ idUser: 7 });
    usuarioSubject.complete();
    torneioSubject.complete();
    inscritosSubject.complete();

    expect(fixture.componentInstance.carregandoDados).toBe(true);
    await new Promise(resolve => setTimeout(resolve, 510));
    fixture.detectChanges();

    expect(fixture.componentInstance.carregandoDados).toBe(false);
    expect(fixture.nativeElement.querySelector('.tournament-loading-overlay')).toBeNull();
    expect(fixture.componentInstance.torneio.nome).toBe('Copa de Teste');
  });
});
