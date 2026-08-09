import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { provideTranslateService } from "@ngx-translate/core";

import { HeaderNavbarComponent } from "./header-navbar";

describe("HeaderNavbarComponent", () => {
  let component: HeaderNavbarComponent;
  let fixture: ComponentFixture<HeaderNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderNavbarComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({
          lang: "es",
          fallbackLang: "es",
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderNavbarComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should open the menu when the menu button is clicked", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector(
      ".menu-toggle",
    ) as HTMLButtonElement | null;

    expect(button).toBeTruthy();

    if (!button) {
      throw new Error("Menu button not found");
    }

    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(compiled.querySelector(".mobile-navigation")).toBeNull();

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(compiled.querySelector(".mobile-navigation")).toBeTruthy();
  });

  it("should close the menu when the menu button is clicked twice", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector(
      ".menu-toggle",
    ) as HTMLButtonElement | null;

    expect(button).toBeTruthy();

    if (!button) {
      throw new Error("Menu button not found");
    }

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute("aria-expanded")).toBe("true");

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("should close the menu and return focus to the button when Escape is pressed", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector(
      ".menu-toggle",
    ) as HTMLButtonElement | null;

    expect(button).toBeTruthy();

    if (!button) {
      throw new Error("Menu button not found");
    }

    // 1. Open the menu first because @if creates it dynamically.
    button.click();
    fixture.detectChanges();

    expect(button.getAttribute("aria-expanded")).toBe("true");

    // 2. Now the navigation exists in the DOM.
    const firstNavigationLink = compiled.querySelector(
      ".mobile-navigation__main a",
    ) as HTMLAnchorElement | null;

    expect(firstNavigationLink).toBeTruthy();

    if (!firstNavigationLink) {
      throw new Error("Navigation link not found");
    }

    // 3. Simulate keyboard navigation inside the menu.
    firstNavigationLink.focus();

    expect(document.activeElement).toBe(firstNavigationLink);

    // 4. Press Escape.
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
      }),
    );

    fixture.detectChanges();

    // 5. Functional state closes immediately.
    expect(button.getAttribute("aria-expanded")).toBe("false");

    // 6. Focus returns to the hamburger button.
    expect(document.activeElement).toBe(button);
  });
});
