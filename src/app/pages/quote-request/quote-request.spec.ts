import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteRequestComponent } from '../quote-request/quote-request';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { QuoteRequestService } from '../../features/quote-request/services/quote-request.service';

describe('QuoteRequest', () => {
  let component: QuoteRequestComponent;
  let fixture: ComponentFixture<QuoteRequestComponent>;

  beforeEach(async () => {
    quoteRequestServiceMock.createQuoteRequest.mockClear();
    await TestBed.configureTestingModule({
      imports: [QuoteRequestComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({
          lang: 'es',
          fallbackLang: 'es',
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form as invalid', () => {
    expect(component['quoteForm'].invalid).toBe(true);
  });

  it('should initialize guest count with one', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const guestCountInput = compiled.querySelector('#guestCount') as HTMLInputElement;

    expect(guestCountInput.value).toBe('1');
  });

  it('should initialize privacyAccepted with false', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const privacyAccepted = compiled.querySelector('input[type="checkbox"]') as HTMLInputElement;

    expect(privacyAccepted.checked).toBe(false);
  });
  it('should initialize attachment with null', () => {
    expect(component['attachment']()).toBeNull();
  });

  it('should initialize the file input without files', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const attachmentInput = compiled.querySelector('input[type="file"]') as HTMLInputElement;

    expect(attachmentInput.files?.length).toBe(0);
  });

  it('should invalidate an incorrect email', () => {
    const emailControl = component['quoteForm'].controls.email;

    emailControl.setValue('email incorrecto');

    expect(emailControl.hasError('email')).toBe(true);
  });

  it('should invalidate a guest count lower than one', () => {
    const guestCountControl = component['quoteForm'].controls.guestCount;

    guestCountControl.setValue(0);

    expect(guestCountControl.hasError('min')).toBe(true);
  });

  it('should invalidate privacy consent when it is false', () => {
    const privacyControl = component['quoteForm'].controls.privacyAccepted;

    privacyControl.setValue(false);

    expect(privacyControl.hasError('required')).toBe(true);
  });

  it('should mark all controls as touched after an invalid submission', () => {
    const form = component['quoteForm'];

    component['submitQuoteRequest']();

    expect(form.controls.name.touched).toBe(true);
    expect(form.controls.email.touched).toBe(true);
    expect(form.controls.eventType.touched).toBe(true);
    expect(form.controls.privacyAccepted.touched).toBe(true);
  });

  it('should validate the form with the required fields completed', () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    expect(form.valid).toBe(true);
  });
  // TODO: Update legacy submit tests after the Supabase integration.
  it.skip('should submit a valid quote request', () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    const consoleSpy = vi.spyOn(console, 'log');

    component['submitQuoteRequest']();

    expect(consoleSpy).toHaveBeenCalled();
  });
  // TODO: Update legacy submit tests after the Supabase integration.
  it.skip('V.2 : should submit a valid quote request with the expected data', () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    component['submitQuoteRequest']();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Quote request:',
      expect.objectContaining({
        name: 'Alejandro',
        email: 'alejandro@example.com',
        eventType: 'private-dinner',
        guestCount: 2,
        privacyAccepted: true,
      }),
    );
  });

  it('should update the attachment signal when a file is selected', () => {
    const file = new File(['test content'], 'menu.pdf', { type: 'application/pdf' });

    const event = {
      target: {
        files: [file],
      },
    } as unknown as Event;

    component['onAttachmentSelected'](event);

    expect(component['attachment']()).toBe(file);
  });

  it('should display the selected file name', () => {
    const file = new File(['test content'], 'menu.pdf', { type: 'application/pdf' });

    const event = { target: { files: [file] } } as unknown as Event;

    component['onAttachmentSelected'](event);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const fileName = compiled.querySelector('.quote-form__file-name');

    expect(fileName?.textContent).toContain('menu.pdf');
  });

  it('should validate a correct email', () => {
    const emailControl = component['quoteForm'].controls.email;

    emailControl.setValue('alejandro@example.com');

    expect(emailControl.hasError('email')).toBe(false);
  });

  it('should validate a guest count is  one', () => {
    const guestCountControl = component['quoteForm'].controls.guestCount;

    guestCountControl.setValue(1);

    expect(guestCountControl.hasError('min')).toBe(false);
  });

  it('should display the name error after an invalid submission', () => {
    component['submitQuoteRequest']();

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const errorMessage = compiled.querySelector('.quote-form__error');

    expect(errorMessage?.textContent).toContain('quoteRequest.form.name.required');
  });

  it('should display the privacy error after an invalid submission', () => {
    component['submitQuoteRequest']();

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    const privacyField = compiled.querySelector('.quote-form__privacy');

    expect(privacyField?.textContent).toContain('quoteRequest.form.privacy.required');
  });
  // TODO: Update legacy submit tests after the Supabase integration.
  it.skip('should submit  send all valid values from from and atachment', () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      phone: '600123123',
      eventType: 'private-dinner',
      eventDate: '2026-08-15',
      guestCount: 4,
      location: 'Madrid',
      dietaryRequirements: 'No nuts',
      additionalInformation: 'Dinner at home',
      privacyAccepted: true,
    });

    const file = new File(['test content'], 'menu.pdf', { type: 'application/pdf' });

    component['attachment'].set(file);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    component['submitQuoteRequest']();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Quote request:',
      expect.objectContaining({
        name: 'Alejandro',
        email: 'alejandro@example.com',
        phone: '600123123',
        eventType: 'private-dinner',
        eventDate: '2026-08-15',
        guestCount: 4,
        location: 'Madrid',
        dietaryRequirements: 'No nuts',
        additionalInformation: 'Dinner at home',
        privacyAccepted: true,
        attachment: file,
      }),
    );
  });

  it('should preserve the selected file name and type', () => {
    const file = new File(['test content'], 'menu.pdf', { type: 'application/pdf' });

    component['attachment'].set(file);

    const selectedFile = component['attachment']();

    expect(selectedFile?.name).toBe('menu.pdf');
    expect(selectedFile?.type).toBe('application/pdf');
  });

  const quoteRequestServiceMock = {
    createQuoteRequest: vi.fn().mockResolvedValue(undefined),
  };

  it('should call quoteRequestService', async () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      phone: '600123123',
      eventType: 'private-dinner',
      eventDate: '2026-08-15',
      guestCount: 4,
      location: 'Madrid',
      dietaryRequirements: 'No nuts',
      additionalInformation: 'Dinner at home',
      privacyAccepted: true,
    });

    const file = new File(['test content'], 'menu.pdf', {
      type: 'application/pdf',
    });

    component['attachment'].set(file);

    const expectedFormValue = form.getRawValue();

    await component['submitQuoteRequest']();

    expect(quoteRequestServiceMock.createQuoteRequest).toHaveBeenCalledWith(
      expectedFormValue,
      file,
    );
  });
  it('should handle service error', async () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    const error = new Error('Upload failed');

    quoteRequestServiceMock.createQuoteRequest.mockRejectedValueOnce(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await component['submitQuoteRequest']();

    expect(consoleSpy).toHaveBeenCalledWith('Unable to create quote request:', error);
  });

  it('should not call quoteRequestService when the form is invalid', async () => {
    await component['submitQuoteRequest']();

    expect(quoteRequestServiceMock.createQuoteRequest).not.toHaveBeenCalled();
  });

  it('should call quoteRequestService with null attachment', async () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    const expectedFormValue = form.getRawValue();

    await component['submitQuoteRequest']();

    expect(quoteRequestServiceMock.createQuoteRequest).toHaveBeenCalledWith(
      expectedFormValue,
      null,
    );
  });
  it('should initialize isSubmitting as false', () => {
    expect(component['isSubmitting']()).toBe(false);
  });

  it('should set isSubmitting to true while submitting', async () => {
    let resolveRequest!: () => void;

    quoteRequestServiceMock.createQuoteRequest.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    const submitPromise = component['submitQuoteRequest']();

    expect(component['isSubmitting']()).toBe(true);

    resolveRequest();

    await submitPromise;
  });

  it('should set isSubmitting to false after a successful submission', async () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    await component['submitQuoteRequest']();

    expect(component['isSubmitting']()).toBe(false);
  });

  it('should set isSubmitting to false after a failed submission', async () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    const error = new Error('Upload failed');

    quoteRequestServiceMock.createQuoteRequest.mockRejectedValueOnce(error);

    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await component['submitQuoteRequest']();

    expect(component['isSubmitting']()).toBe(false);
  });
  it('should set submissionSuccess to true after a successful submission', async () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    await component['submitQuoteRequest']();

    expect(component['submissionSuccess']()).toBe(true);
  });
  it('should set submissionError to true after a failed submission', async () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    const error = new Error('Upload failed');

    quoteRequestServiceMock.createQuoteRequest.mockRejectedValueOnce(error);

    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await component['submitQuoteRequest']();

    expect(component['submissionError']()).toBe(true);
  });

  it('should reset previous submission states before submitting again', async () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    component['submissionSuccess'].set(true);
    component['submissionError'].set(true);

    const submitPromise = component['submitQuoteRequest']();

    expect(component['submissionSuccess']()).toBe(false);
    expect(component['submissionError']()).toBe(false);

    await submitPromise;
  });

  it('should display the success message after a successful submission', async () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    await component['submitQuoteRequest']();

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const successMessage = compiled.querySelector('.quote-form__status--success');

    expect(successMessage?.textContent).toContain('quoteRequest.form.success');
  });
  it('should disable the submit button while submitting', async () => {
    let resolveRequest!: () => void;

    quoteRequestServiceMock.createQuoteRequest.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    const submitPromise = component['submitQuoteRequest']();

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('.quote-form__submit') as HTMLButtonElement;

    expect(submitButton.disabled).toBe(true);

    resolveRequest();

    await submitPromise;
  });
  it('should reset the form after a successful submission', async () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    await component['submitQuoteRequest']();

    expect(form.getRawValue()).toEqual({
      name: '',
      email: '',
      phone: '',
      eventType: '',
      eventDate: '',
      guestCount: 1,
      location: '',
      dietaryRequirements: '',
      additionalInformation: '',
      privacyAccepted: false,
    });
  });

  it('should reset the attachment after a successful submission', async () => {
    const form = component['quoteForm'];

    form.patchValue({
      name: 'Alejandro',
      email: 'alejandro@example.com',
      eventType: 'private-dinner',
      guestCount: 2,
      privacyAccepted: true,
    });

    const file = new File(['test content'], 'menu.pdf', {
      type: 'application/pdf',
    });

    component['attachment'].set(file);

    await component['submitQuoteRequest']();

    expect(component['attachment']()).toBeNull();
  });
});
