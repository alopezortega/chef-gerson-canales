import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { provideTranslateService } from "@ngx-translate/core";
import { of, throwError } from "rxjs";

import { QuoteRequestService } from "../../features/quote-request/services/quote-request.service";
import { QuoteRequestComponent } from "../quote-request/quote-request";

describe("QuoteRequest", () => {
  let component: QuoteRequestComponent;
  let fixture: ComponentFixture<QuoteRequestComponent>;

  const quoteRequestServiceMock = {
    createQuoteRequest: vi.fn(),
  };

  const fillValidForm = (): void => {
    component["quoteForm"].patchValue({
      name: "Alejandro",
      email: "alejandro@example.com",
      eventType: "private-dinner",
      guestCount: 2,
      privacyAccepted: true,
    });
  };

  const completeSuccessfulSubmission = async (): Promise<void> => {
    await vi.advanceTimersByTimeAsync(3500);
    await vi.advanceTimersByTimeAsync(900);
  };

  beforeEach(async () => {
    quoteRequestServiceMock.createQuoteRequest.mockReset();
    quoteRequestServiceMock.createQuoteRequest.mockReturnValue(
      of(undefined),
    );

    await TestBed.configureTestingModule({
      imports: [QuoteRequestComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({
          lang: "es",
          fallbackLang: "es",
        }),
        {
          provide: QuoteRequestService,
          useValue: quoteRequestServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteRequestComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize the form as invalid", () => {
    expect(component["quoteForm"].invalid).toBe(true);
  });

  it("should initialize guest count with one", () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const guestCountInput = compiled.querySelector(
      "#guestCount",
    ) as HTMLInputElement;

    expect(guestCountInput.value).toBe("1");
  });

  it("should initialize privacyAccepted with false", () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const privacyAccepted = compiled.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;

    expect(privacyAccepted.checked).toBe(false);
  });

  it("should initialize attachment with null", () => {
    expect(component["attachment"]()).toBeNull();
  });

  it("should initialize attachment error with null", () => {
    expect(component["attachmentError"]()).toBeNull();
  });

  it("should initialize loading success as false", () => {
    expect(component["showLoadingSuccess"]()).toBe(false);
  });

  it("should initialize isSubmitting as false", () => {
    expect(component["isSubmitting"]()).toBe(false);
  });

  it("should initialize the file input without files", () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const attachmentInput = compiled.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    expect(attachmentInput.files?.length).toBe(0);
  });

  it("should invalidate a name containing numbers", () => {
    const nameControl = component["quoteForm"].controls.name;

    nameControl.setValue("Gerson123");

    expect(nameControl.hasError("pattern")).toBe(true);
  });

  it("should validate a name without numbers", () => {
    const nameControl = component["quoteForm"].controls.name;

    nameControl.setValue("Gerson Canales");

    expect(nameControl.hasError("pattern")).toBe(false);
  });

  it("should invalidate an incorrect email", () => {
    const emailControl = component["quoteForm"].controls.email;

    emailControl.setValue("email incorrecto");

    expect(emailControl.hasError("email")).toBe(true);
  });

  it("should validate a correct email", () => {
    const emailControl = component["quoteForm"].controls.email;

    emailControl.setValue("alejandro@example.com");

    expect(emailControl.hasError("email")).toBe(false);
  });

  it("should invalidate a phone containing letters", () => {
    const phoneControl = component["quoteForm"].controls.phone;

    phoneControl.setValue("600ABC123");

    expect(phoneControl.hasError("pattern")).toBe(true);
  });

  it("should validate a formatted phone number", () => {
    const phoneControl = component["quoteForm"].controls.phone;

    phoneControl.setValue("+34 600 123 123");

    expect(phoneControl.hasError("pattern")).toBe(false);
  });

  it("should allow an empty optional phone number", () => {
    const phoneControl = component["quoteForm"].controls.phone;

    phoneControl.setValue("");

    expect(phoneControl.valid).toBe(true);
  });

  it("should invalidate today as an event date", () => {
    const eventDateControl = component["quoteForm"].controls.eventDate;

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    eventDateControl.setValue(`${year}-${month}-${day}`);

    expect(eventDateControl.hasError("futureDate")).toBe(true);
  });

  it("should invalidate a past event date", () => {
    const eventDateControl = component["quoteForm"].controls.eventDate;

    eventDateControl.setValue("2000-01-01");

    expect(eventDateControl.hasError("futureDate")).toBe(true);
  });

  it("should validate a future event date", () => {
    const eventDateControl = component["quoteForm"].controls.eventDate;

    eventDateControl.setValue("2999-01-01");

    expect(eventDateControl.hasError("futureDate")).toBe(false);
  });

  it("should set the native event-date minimum to tomorrow", () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const eventDateInput = compiled.querySelector(
      "#eventDate",
    ) as HTMLInputElement;

    expect(eventDateInput.min).toBe(
      component["minimumEventDate"],
    );
  });

  it("should invalidate a guest count lower than one", () => {
    const guestCountControl = component["quoteForm"].controls.guestCount;

    guestCountControl.setValue(0);

    expect(guestCountControl.hasError("min")).toBe(true);
  });

  it("should validate a guest count of one", () => {
    const guestCountControl = component["quoteForm"].controls.guestCount;

    guestCountControl.setValue(1);

    expect(guestCountControl.hasError("min")).toBe(false);
  });

  it("should invalidate privacy consent when it is false", () => {
    const privacyControl = component["quoteForm"].controls.privacyAccepted;

    privacyControl.setValue(false);

    expect(privacyControl.hasError("required")).toBe(true);
  });

  it("should mark all controls as touched after an invalid submission", () => {
    const form = component["quoteForm"];

    component["submitQuoteRequest"]();

    expect(form.controls.name.touched).toBe(true);
    expect(form.controls.email.touched).toBe(true);
    expect(form.controls.eventType.touched).toBe(true);
    expect(form.controls.privacyAccepted.touched).toBe(true);
  });

  it("should validate the form with the required fields completed", () => {
    fillValidForm();

    expect(component["quoteForm"].valid).toBe(true);
  });

  it("should update the attachment signal when a valid PDF is selected", () => {
    const file = new File(["test content"], "menu.pdf", {
      type: "application/pdf",
    });

    const event = {
      target: {
        files: [file],
        value: "",
      },
    } as unknown as Event;

    component["onAttachmentSelected"](event);

    expect(component["attachment"]()).toBe(file);
    expect(component["attachmentError"]()).toBeNull();
  });

  it("should reject an unsupported attachment type", () => {
    const file = new File(["test content"], "menu.txt", {
      type: "text/plain",
    });

    const event = {
      target: {
        files: [file],
        value: "menu.txt",
      },
    } as unknown as Event;

    component["onAttachmentSelected"](event);

    expect(component["attachment"]()).toBeNull();
    expect(component["attachmentError"]()).toBe("type");
  });

  it("should reject an attachment larger than 10 MB", () => {
    const file = new File(
      [new Uint8Array(10 * 1024 * 1024 + 1)],
      "large-menu.pdf",
      {
        type: "application/pdf",
      },
    );

    const event = {
      target: {
        files: [file],
        value: "large-menu.pdf",
      },
    } as unknown as Event;

    component["onAttachmentSelected"](event);

    expect(component["attachment"]()).toBeNull();
    expect(component["attachmentError"]()).toBe("size");
  });

  it("should display the selected file name", () => {
    const file = new File(["test content"], "menu.pdf", {
      type: "application/pdf",
    });

    const event = {
      target: {
        files: [file],
        value: "",
      },
    } as unknown as Event;

    component["onAttachmentSelected"](event);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const fileName = compiled.querySelector(
      ".quote-form__file-name",
    );

    expect(fileName?.textContent).toContain("menu.pdf");
  });

  it("should display the invalid name error", () => {
    const nameControl = component["quoteForm"].controls.name;

    nameControl.setValue("Gerson123");
    nameControl.markAsTouched();

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      "quoteRequest.form.name.invalid",
    );
  });

  it("should display the invalid phone error", () => {
    const phoneControl = component["quoteForm"].controls.phone;

    phoneControl.setValue("telefono");
    phoneControl.markAsTouched();

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      "quoteRequest.form.phone.invalid",
    );
  });

  it("should display the invalid event-date error", () => {
    const eventDateControl = component["quoteForm"].controls.eventDate;

    eventDateControl.setValue("2000-01-01");
    eventDateControl.markAsTouched();

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(
      "quoteRequest.form.eventDate.future",
    );
  });

  it("should call quoteRequestService with the form values and attachment", () => {
    vi.useFakeTimers();

    const form = component["quoteForm"];

    form.patchValue({
      name: "Alejandro",
      email: "alejandro@example.com",
      phone: "600123123",
      eventType: "private-dinner",
      eventDate: "2999-01-01",
      guestCount: 4,
      location: "Madrid",
      dietaryRequirements: "No nuts",
      additionalInformation: "Dinner at home",
      privacyAccepted: true,
    });

    const file = new File(["test content"], "menu.pdf", {
      type: "application/pdf",
    });

    component["attachment"].set(file);

    const expectedFormValue = form.getRawValue();

    component["submitQuoteRequest"]();

    expect(
      quoteRequestServiceMock.createQuoteRequest,
    ).toHaveBeenCalledWith(expectedFormValue, file);
  });

  it("should not call quoteRequestService when the form is invalid", () => {
    component["submitQuoteRequest"]();

    expect(
      quoteRequestServiceMock.createQuoteRequest,
    ).not.toHaveBeenCalled();
  });

  it("should not call quoteRequestService when the attachment is invalid", () => {
    fillValidForm();

    component["attachmentError"].set("type");

    component["submitQuoteRequest"]();

    expect(
      quoteRequestServiceMock.createQuoteRequest,
    ).not.toHaveBeenCalled();
  });

  it("should set isSubmitting to true while submitting", async () => {
    vi.useFakeTimers();

    fillValidForm();

    component["submitQuoteRequest"]();

    expect(component["isSubmitting"]()).toBe(true);

    await completeSuccessfulSubmission();

    expect(component["isSubmitting"]()).toBe(false);
  });

  it("should display the fullscreen loading overlay while submitting", async () => {
    vi.useFakeTimers();

    fillValidForm();

    component["submitQuoteRequest"]();

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector(".quote-request-loading"),
    ).toBeTruthy();

    await completeSuccessfulSubmission();

    fixture.detectChanges();

    expect(
      compiled.querySelector(".quote-request-loading"),
    ).toBeNull();
  });

  it("should show the loading success while keeping the overlay visible", async () => {
    vi.useFakeTimers();

    fillValidForm();

    component["submitQuoteRequest"]();

    await vi.advanceTimersByTimeAsync(3500);

    expect(component["showLoadingSuccess"]()).toBe(true);
    expect(component["isSubmitting"]()).toBe(true);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector(".quote-request-loading"),
    ).toBeTruthy();

    expect(
      compiled.querySelector(".quote-request-loading__chef"),
    ).toBeTruthy();

    expect(
      compiled.querySelector(".quote-request-loading__success"),
    ).toBeTruthy();

    await vi.advanceTimersByTimeAsync(900);

    expect(component["showLoadingSuccess"]()).toBe(false);
  });

  it("should wait for the minimum loading duration before reporting an error", async () => {
    vi.useFakeTimers();

    const error = new Error("Upload failed");

    quoteRequestServiceMock.createQuoteRequest.mockReturnValueOnce(
      throwError(() => error),
    );

    vi.spyOn(console, "error").mockImplementation(
      () => undefined,
    );

    fillValidForm();

    component["submitQuoteRequest"]();

    expect(component["submissionError"]()).toBe(false);
    expect(component["isSubmitting"]()).toBe(true);

    await vi.advanceTimersByTimeAsync(3499);

    expect(component["submissionError"]()).toBe(false);

    await vi.advanceTimersByTimeAsync(1);

    expect(component["submissionError"]()).toBe(true);
    expect(component["isSubmitting"]()).toBe(false);
    expect(component["showLoadingSuccess"]()).toBe(false);
  });

  it("should set submissionSuccess to true after a successful submission", async () => {
    vi.useFakeTimers();

    fillValidForm();

    component["submitQuoteRequest"]();

    await completeSuccessfulSubmission();

    expect(component["submissionSuccess"]()).toBe(true);
    expect(component["submissionError"]()).toBe(false);
  });

  it("should set submissionError to true after a failed submission", async () => {
    vi.useFakeTimers();

    const error = new Error("Unable to create quote request");

    quoteRequestServiceMock.createQuoteRequest.mockReturnValueOnce(
      throwError(() => error),
    );

    vi.spyOn(console, "error").mockImplementation(
      () => undefined,
    );

    fillValidForm();

    component["submitQuoteRequest"]();

    await vi.advanceTimersByTimeAsync(3500);

    expect(component["submissionError"]()).toBe(true);
    expect(component["submissionSuccess"]()).toBe(false);
  });

  it("should display the success message after a successful submission", async () => {
    vi.useFakeTimers();

    fillValidForm();

    component["submitQuoteRequest"]();

    await completeSuccessfulSubmission();

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const successMessage = compiled.querySelector(
      ".quote-form__status--success",
    );

    expect(successMessage?.textContent).toContain(
      "quoteRequest.form.success",
    );
  });

  it("should reset the form after a successful submission", async () => {
    vi.useFakeTimers();

    fillValidForm();

    component["submitQuoteRequest"]();

    await completeSuccessfulSubmission();

    expect(component["quoteForm"].getRawValue()).toEqual({
      name: "",
      email: "",
      phone: "",
      eventType: "",
      eventDate: "",
      guestCount: 1,
      location: "",
      dietaryRequirements: "",
      additionalInformation: "",
      privacyAccepted: false,
    });
  });

  it("should reset the attachment after a successful submission", async () => {
    vi.useFakeTimers();

    fillValidForm();

    const file = new File(["test content"], "menu.pdf", {
      type: "application/pdf",
    });

    component["attachment"].set(file);

    component["submitQuoteRequest"]();

    await completeSuccessfulSubmission();

    expect(component["attachment"]()).toBeNull();
    expect(component["attachmentError"]()).toBeNull();
  });
});
