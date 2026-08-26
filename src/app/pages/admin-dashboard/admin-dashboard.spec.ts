import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { provideTranslateService } from "@ngx-translate/core";
import { of } from "rxjs";
import { vi } from "vitest";

import type { AdminQuoteRequest } from "../../features/quote-request/models/admin-quote-request.model";
import { AdminQuoteRequestService } from "../../features/quote-request/services/admin-quote-request.service";
import { AdminDashboard } from "./admin-dashboard";

describe("AdminDashboard", () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;

  const loadQuoteRequestsMock = vi.fn();

  const requestsState = signal<AdminQuoteRequest[]>([]);
  const isLoadingState = signal(false);
  const hasErrorState = signal(false);

  const adminQuoteRequestServiceMock = {
    requests: requestsState.asReadonly(),
    isLoading: isLoadingState.asReadonly(),
    hasError: hasErrorState.asReadonly(),
    loadQuoteRequests: loadQuoteRequestsMock,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    requestsState.set([]);
    isLoadingState.set(false);
    hasErrorState.set(false);

    loadQuoteRequestsMock.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AdminDashboard],
      providers: [
        provideRouter([]),
        provideTranslateService({
          lang: "es",
          fallbackLang: "es",
        }),
        {
          provide: AdminQuoteRequestService,
          useValue: adminQuoteRequestServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboard);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it("should load quote requests on initialization", () => {
    fixture.detectChanges();

    expect(loadQuoteRequestsMock).toHaveBeenCalledTimes(1);
  });
});
