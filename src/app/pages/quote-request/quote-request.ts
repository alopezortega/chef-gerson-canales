import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { QuoteRequestService } from '../../features/quote-request/services/quote-request.service';

@Component({
  selector: 'app-quote-request',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './quote-request.html',
  styleUrl: './quote-request.scss',
})
export class QuoteRequestComponent {
  protected readonly attachment = signal<File | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly submissionSuccess = signal(false);
  protected readonly submissionError = signal(false);

  private readonly formBuilder = inject(FormBuilder);

  private readonly quoteRequestService = inject(QuoteRequestService);

  protected readonly quoteForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    eventType: ['', Validators.required],
    eventDate: [''],
    guestCount: [1, [Validators.required, Validators.min(1)]],
    location: [''],
    dietaryRequirements: [''],
    additionalInformation: [''],
    privacyAccepted: [false, Validators.requiredTrue],
  });

  protected onAttachmentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.attachment.set(file);
  }

  protected async submitQuoteRequest(): Promise<void> {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    const formValue = this.quoteForm.getRawValue();
    const attachment = this.attachment();

    this.submissionSuccess.set(false);
    this.submissionError.set(false);
    this.isSubmitting.set(true);

    try {
      await this.quoteRequestService.createQuoteRequest(formValue, attachment);

      this.submissionSuccess.set(true);

      this.quoteForm.reset({
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

      this.attachment.set(null);
    } catch (error) {
      this.submissionError.set(true);

      console.error('Unable to create quote request:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
