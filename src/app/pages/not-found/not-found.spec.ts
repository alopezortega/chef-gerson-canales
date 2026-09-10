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
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render the 404 code", () => {
    const element: HTMLElement = fixture.nativeElement;
    const code = element.querySelector(".not-found__code");

    expect(code?.textContent?.trim()).toBe("404");
  });

  it("should provide a link back to the home page", () => {
    const element: HTMLElement = fixture.nativeElement;
    const link = element.querySelector<HTMLAnchorElement>(
      ".not-found__action",
    );

    expect(link).toBeTruthy();
    expect(link?.getAttribute("href")).toBe("/");
  });

  it("should provide desktop and mobile images", () => {
    const element: HTMLElement = fixture.nativeElement;

    const image = element.querySelector<HTMLImageElement>(
      ".not-found__image",
    );

    const source = element.querySelector<HTMLSourceElement>(
      ".not-found__visual source",
    );

    expect(image).toBeTruthy();
    expect(source).toBeTruthy();

    expect(image?.getAttribute("src")).toBe(
      "/images/not-found/not-found-hero.webp",
    );

    expect(source?.getAttribute("srcset")).toBe(
      "/images/not-found/not-found-hero-mobile.webp",
    );
  });
});
