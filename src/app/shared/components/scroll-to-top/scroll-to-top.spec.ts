import { ComponentFixture, TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { ScrollToTop } from "./scroll-to-top";

describe("ScrollToTop", () => {
  let component: ScrollToTop;
  let fixture: ComponentFixture<ScrollToTop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollToTop],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollToTop);
    component = fixture.componentInstance;

    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should show the button after scrolling more than 400px", () => {
    vi.spyOn(window, "scrollY", "get").mockReturnValue(500);

    window.dispatchEvent(new Event("scroll"));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      ".scroll-top",
    ) as HTMLButtonElement | null;

    expect(button).toBeTruthy();
  });

  it("should hide the button when scroll is below 400px", () => {
    vi.spyOn(window, "scrollY", "get").mockReturnValue(200);

    window.dispatchEvent(new Event("scroll"));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      ".scroll-top",
    ) as HTMLButtonElement | null;

    expect(button).toBeNull();
  });

  it("should scroll smoothly to the top when clicked", () => {
    vi.spyOn(window, "scrollY", "get").mockReturnValue(500);

    const scrollToSpy = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);

    window.dispatchEvent(new Event("scroll"));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      ".scroll-top",
    ) as HTMLButtonElement | null;

    expect(button).toBeTruthy();

    if (!button) {
      throw new Error("Scroll-to-top button not found");
    }

    button.click();

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });
});
