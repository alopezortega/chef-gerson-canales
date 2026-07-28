import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteRequestComponent } from '../quote-request/quote-request';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

describe('QuoteRequest', () => {
  let component: QuoteRequestComponent;
  let fixture: ComponentFixture<QuoteRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteRequestComponent],
      providers: [
        provideRouter([]),
        ReactiveFormsModule,
        provideTranslateService({
          lang: 'es',
          fallbackLang: 'es',
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteRequestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
