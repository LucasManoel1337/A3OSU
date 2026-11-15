import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  it('keeps the loading overlay open until every operation finishes and its minimum display time passes', async () => {
    const service = new LoadingService();
    const states: boolean[] = [];
    service.loading$.subscribe(isLoading => states.push(isLoading));

    service.show();
    service.show();
    service.hide();

    expect(states[states.length - 1]).toBe(true);

    service.hide();

    expect(states[states.length - 1]).toBe(true);
    await new Promise(resolve => setTimeout(resolve, 510));

    expect(states[states.length - 1]).toBe(false);
  });
});
