import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { provideTranslateService } from "@ngx-translate/core";

import { FinalCta } from "./final-cta";

describe("FinalCta", () => {
  let component: FinalCta;
  let fixture: ComponentFixture<FinalCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalCta],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(FinalCta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render the final CTA section", () => {
    const section = fixture.nativeElement.querySelector(".final-cta");

    expect(section).toBeTruthy();
  });

  it("should link to the quote request page", () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector(
      ".final-cta__action",
    );

    expect(link.getAttribute("href")).toBe("/solicitar-presupuesto");
  });
});
