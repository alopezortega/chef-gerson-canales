import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { AdminQuoteRequestService } from '../../features/quote-request/services/admin-quote-request.service';
import { AdminDashboard } from './admin-dashboard';

describe('AdminDashboard', () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;

  const loadQuoteRequestsMock = vi.fn().mockResolvedValue(undefined);

  const adminQuoteRequestServiceMock = {
    requests: signal([]).asReadonly(),
    isLoading: signal(false).asReadonly(),
    hasError: signal(false).asReadonly(),
    loadQuoteRequests: loadQuoteRequestsMock,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [AdminDashboard],
      providers: [
        provideRouter([]),
        {
          provide: AdminQuoteRequestService,
          useValue: adminQuoteRequestServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should load quote requests on initialization', () => {
    fixture.detectChanges();

    expect(loadQuoteRequestsMock).toHaveBeenCalledTimes(1);
  });
});
