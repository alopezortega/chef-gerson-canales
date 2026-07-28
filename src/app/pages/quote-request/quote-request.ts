import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-quote-request',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './quote-request.html',
  styleUrl: './quote-request.scss',
})
export class QuoteRequestComponent {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly attachment = signal<File | null>(null);

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

  protected submitQuoteRequest(): void {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    const formValue = this.quoteForm.getRawValue();
    const attachment = this.attachment();

    console.log('Quote request:', {
      ...formValue,
      attachment,
    });
  }
}
