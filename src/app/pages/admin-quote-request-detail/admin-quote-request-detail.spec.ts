import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { AdminQuoteRequestService } from '../../features/quote-request/services/admin-quote-request.service';
import { AdminQuoteRequestDetail } from './admin-quote-request-detail';

describe('AdminQuoteRequestDetail', () => {
  let component: AdminQuoteRequestDetail;
  let fixture: ComponentFixture<AdminQuoteRequestDetail>;

  const requestId = '83cda03c-531d-421f-939f-d1c541a3f596';

  const loadQuoteRequestByIdMock = vi.fn().mockResolvedValue(undefined);

  const adminQuoteRequestServiceMock = {
    selectedRequest: signal(null).asReadonly(),
    isLoading: signal(false).asReadonly(),
    hasError: signal(false).asReadonly(),
    loadQuoteRequestById: loadQuoteRequestByIdMock,
  };

  async function configureTest(routeId: string | null): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [AdminQuoteRequestDetail],
      providers: [
        provideRouter([]),
        {
          provide: AdminQuoteRequestService,
          useValue: adminQuoteRequestServiceMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(
                routeId
                  ? {
                      id: routeId,
                    }
                  : {},
              ),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminQuoteRequestDetail);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create', async () => {
    await configureTest(requestId);

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should load the quote request using the route id', async () => {
    await configureTest(requestId);

    fixture.detectChanges();

    expect(loadQuoteRequestByIdMock).toHaveBeenCalledTimes(1);
    expect(loadQuoteRequestByIdMock).toHaveBeenCalledWith(requestId);
  });

  it('should expose the route id', async () => {
    await configureTest(requestId);

    fixture.detectChanges();

    expect(component['idUrl']()).toBe(requestId);
  });

  it('should not load a quote request when the route id is missing', async () => {
    await configureTest(null);

    fixture.detectChanges();

    expect(loadQuoteRequestByIdMock).not.toHaveBeenCalled();
    expect(component['idUrl']()).toBeNull();
  });
});
