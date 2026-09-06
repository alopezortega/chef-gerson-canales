import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { provideTranslateService } from "@ngx-translate/core";

import { NotFound } from "./not-found";

describe("NotFound", () => {
  let component: NotFound;
  let fixture: ComponentFixture<NotFound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [
        provideRouter([]),
        provideTranslateService({
          lang: "es",
          fallbackLang: "es",
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render the 404 code", () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(
      element.querySelector(".not-found__code")?.textContent?.trim(),
    ).toBe("404");
  });

  it("should provide a link back to the home page", () => {
    const element = fixture.nativeElement as HTMLElement;

    const homeLink = element.querySelector<HTMLAnchorElement>(
      ".not-found__action",
    );

    expect(homeLink).toBeTruthy();
    expect(homeLink?.getAttribute("href")).toBe("/");
  });

  it("should provide desktop and mobile images", () => {
    const element = fixture.nativeElement as HTMLElement;

    const image = element.querySelector<HTMLImageElement>(
      ".not-found__image",
    );

    const mobileSource = element.querySelector<HTMLSourceElement>(
      ".not-found__visual source",
    );

    expect(image?.getAttribute("src")).toBe(
      "/images/not-found/not-found-hero.png",
    );

    expect(mobileSource?.getAttribute("srcset")).toBe(
      "/images/not-found/not-found-hero-mobile.png",
    );
  });
});
