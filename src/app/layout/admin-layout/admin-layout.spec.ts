import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { provideTranslateService } from "@ngx-translate/core";
import { vi } from "vitest";

import { AuthService } from "../../core/services/auth.service";
import { AdminLayout } from "./admin-layout";

describe("AdminLayout", () => {
  let component: AdminLayout;
  let fixture: ComponentFixture<AdminLayout>;

  const signOutMock = vi.fn();
  const navigateByUrlMock = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    signOutMock.mockResolvedValue(undefined);
    navigateByUrlMock.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [AdminLayout],
      providers: [
        provideRouter([]),
        provideTranslateService({
          lang: "es",
          fallbackLang: "es",
        }),
        {
          provide: AuthService,
          useValue: {
            signOut: signOutMock,
          },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);

    vi.spyOn(router, "navigateByUrl").mockImplementation(navigateByUrlMock);

    fixture = TestBed.createComponent(AdminLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should open the sign out confirmation", () => {
    component["requestSignOut"]();

    expect(component["signOutConfirmationOpen"]()).toBe(true);
  });

  it("should cancel sign out without calling the auth service", () => {
    component["requestSignOut"]();
    component["cancelSignOut"]();

    expect(component["signOutConfirmationOpen"]()).toBe(false);
    expect(signOutMock).not.toHaveBeenCalled();
    expect(navigateByUrlMock).not.toHaveBeenCalled();
  });

  it("should sign out and navigate to the admin login page after confirmation", async () => {
    component["requestSignOut"]();

    await component["confirmSignOut"]();

    expect(signOutMock).toHaveBeenCalledOnce();
    expect(navigateByUrlMock).toHaveBeenCalledWith("/admin/login");
    expect(component["signOutConfirmationOpen"]()).toBe(false);
  });
});
