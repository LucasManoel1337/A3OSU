import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserService } from '../../core/services/user.service';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update the avatar when it changes in the user service', () => {
    const updatedAvatar = 'data:image/png;base64,updated-avatar';

    TestBed.inject(UserService).notifyAvatarUpdated(updatedAvatar);

    expect(component.avatarPreview).toBe(updatedAvatar);
  });
});
