import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private readonly minimumVisibleMs = 500;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private activeLoadings = 0;
  private visibleSince = 0;
  private hideTimeout?: ReturnType<typeof setTimeout>;

  loading$ = this.loadingSubject.asObservable();

  show(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }

    if (this.activeLoadings === 0 && !this.loadingSubject.value) {
      this.visibleSince = Date.now();
    }

    this.activeLoadings++;
    this.loadingSubject.next(this.activeLoadings > 0);
  }

  hide(): void {
    this.activeLoadings = Math.max(0, this.activeLoadings - 1);
    if (this.activeLoadings > 0) {
      return;
    }

    const remaining = this.minimumVisibleMs - (Date.now() - this.visibleSince);
    if (remaining <= 0) {
      this.finishLoading();
      return;
    }

    this.hideTimeout = setTimeout(() => this.finishLoading(), remaining);
  }

  private finishLoading(): void {
    this.hideTimeout = undefined;
    if (this.activeLoadings === 0) {
      this.loadingSubject.next(false);
    }
  }
}