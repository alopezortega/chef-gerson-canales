import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteRequestComponent } from '../quote-request/quote-request';

describe('QuoteRequest', () => {
  let component: QuoteRequestComponent;
  let fixture: ComponentFixture<QuoteRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteRequestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteRequestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
