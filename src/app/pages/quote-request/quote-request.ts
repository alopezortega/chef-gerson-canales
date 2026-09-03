import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { TranslatePipe } from "@ngx-translate/core";
import {
  catchError,
  finalize,
  forkJoin,
  map,
  of,
  switchMap,
  throwError,
  timer,
} from "rxjs";

import { QuoteRequestService } from "../../features/quote-request/services/quote-request.service";

@Component({
  selector: "app-quote-request",
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: "./quote-request.html",
  styleUrl: "./quote-request.scss",
})
export class QuoteRequestComponent {
  protected readonly attachment = signal<File | null>(null);
  protected readonly attachmentError = signal<"type" | "size" | null>(null);

  protected readonly isSubmitting = signal(false);
  protected readonly showLoadingSuccess = signal(false);
  protected readonly submissionSuccess = signal(false);
  protected readonly submissionError = signal(false);

  protected readonly minimumEventDate = this.getTomorrowDateInputValue();

  protected readonly attachmentInput = viewChild<ElementRef<HTMLInputElement>>(
    "attachmentInput",
  );

  protected readonly leaveDialog = viewChild<ElementRef<HTMLDialogElement>>(
    "leaveDialog",
  );

  private readonly formBuilder = inject(FormBuilder);
  private readonly quoteRequestService = inject(QuoteRequestService);

  private readonly minimumLoadingDuration = 3500;
  private readonly successConfirmationDuration = 900;
  private readonly maximumAttachmentSize = 10 * 1024 * 1024;

  private leaveDecisionResolver: ((canLeave: boolean) => void) | null = null;
  private pendingLeaveDecision: Promise<boolean> | null = null;

  private readonly allowedAttachmentTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
  ]);

  private readonly futureDateValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const value = control.value as string;

    if (!value) {
      return null;
    }

    const selectedDate = this.parseDateInput(value);

    if (!selectedDate) {
      return { futureDate: true };
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return selectedDate > today ? null : { futureDate: true };
  };

  protected readonly quoteForm = this.formBuilder.nonNullable.group({
    name: ["", [Validators.required, Validators.pattern(/^[^0-9]*$/)]],
    email: ["", [Validators.required, Validators.email]],
    phone: ["", Validators.pattern(/^[0-9+()\s-]*$/)],
    eventType: ["", Validators.required],
    eventDate: ["", this.futureDateValidator],
    guestCount: [1, [Validators.required, Validators.min(1)]],
    location: [""],
    dietaryRequirements: [""],
    additionalInformation: [""],
    privacyAccepted: [false, Validators.requiredTrue],
  });

  public canDeactivate(): boolean | Promise<boolean> {
    if (!this.hasPendingChanges()) {
      return true;
    }

    if (this.isSubmitting()) {
      return false;
    }

    if (this.pendingLeaveDecision) {
      return this.pendingLeaveDecision;
    }

    const dialog = this.leaveDialog()?.nativeElement;

    if (!dialog) {
      return false;
    }

    this.pendingLeaveDecision = new Promise<boolean>((resolve) => {
      this.leaveDecisionResolver = resolve;
    });

    if (!dialog.open) {
      dialog.showModal();
    }

    return this.pendingLeaveDecision;
  }

  @HostListener("window:beforeunload", ["$event"])
  protected handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.hasPendingChanges() || this.submissionSuccess()) {
      return;
    }

    event.preventDefault();
    event.returnValue = "";
  }

  protected keepEditing(event?: Event): void {
    event?.preventDefault();

    this.resolveLeaveDecision(false);
  }

  protected confirmLeave(): void {
    this.resolveLeaveDecision(true);
  }

  protected onAttachmentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.attachmentError.set(null);

    if (!file) {
      this.attachment.set(null);
      return;
    }

    if (!this.allowedAttachmentTypes.has(file.type)) {
      this.attachment.set(null);
      this.attachmentError.set("type");
      input.value = "";
      return;
    }

    if (file.size > this.maximumAttachmentSize) {
      this.attachment.set(null);
      this.attachmentError.set("size");
      input.value = "";
      return;
    }

    this.attachment.set(file);
  }

  protected submitQuoteRequest(): void {
    if (this.quoteForm.invalid || this.attachmentError()) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    const formValue = this.quoteForm.getRawValue();
    const attachment = this.attachment();

    this.submissionSuccess.set(false);
    this.submissionError.set(false);
    this.showLoadingSuccess.set(false);
    this.isSubmitting.set(true);

    forkJoin([
      timer(this.minimumLoadingDuration),

      this.quoteRequestService
        .createQuoteRequest(formValue, attachment)
        .pipe(
          map(() => ({ error: null })),
          catchError((error) => {
            return of({ error });
          }),
        ),
    ])
      .pipe(
        switchMap(([, requestResult]) => {
          if (requestResult.error) {
            return throwError(() => requestResult.error);
          }

          this.showLoadingSuccess.set(true);

          return timer(this.successConfirmationDuration);
        }),
        finalize(() => {
          this.isSubmitting.set(false);
          this.showLoadingSuccess.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.submissionSuccess.set(true);

          this.quoteForm.reset({
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

          this.attachment.set(null);
          this.attachmentError.set(null);

          this.resetAttachmentInput();
        },
        error: (error) => {
          this.submissionError.set(true);

          console.error("Unable to create quote request:", error);
        },
      });
  }

  private hasPendingChanges(): boolean {
    return this.quoteForm.dirty || this.attachment() !== null;
  }

  private resolveLeaveDecision(canLeave: boolean): void {
    const dialog = this.leaveDialog()?.nativeElement;

    if (dialog?.open) {
      dialog.close();
    }

    const resolver = this.leaveDecisionResolver;

    this.leaveDecisionResolver = null;
    this.pendingLeaveDecision = null;

    resolver?.(canLeave);
  }

  private getTomorrowDateInputValue(): string {
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.formatDateInputValue(tomorrow);
  }

  private formatDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  private parseDateInput(value: string): Date | null {
    const [year, month, day] = value.split("-").map(Number);

    if (!year || !month || !day) {
      return null;
    }

    const date = new Date(year, month - 1, day);

    date.setHours(0, 0, 0, 0);

    return date;
  }

  private resetAttachmentInput(): void {
    const input = this.attachmentInput()?.nativeElement;

    if (input) {
      input.value = "";
    }
  }
}
