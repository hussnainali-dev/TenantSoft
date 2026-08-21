import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

declare function describe(description: string, spec: () => void): void;
declare function beforeEach(spec: () => void | Promise<void>): void;
declare function it(description: string, spec: () => void): void;
declare function expect(actual: unknown): { toBeTruthy(): void; toContain(expected: string): void };

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, tenantsoft');
  });
});
