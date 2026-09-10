import { DatePipe } from "@angular/common";
import { Component, effect, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { finalize } from "rxjs";

import type { QuoteRequestStatus } from "../../features/quote-request/models/admin-quote-request.model";
import { AdminQuoteRequestService } from "../../features/quote-request/services/admin-quote-request.service";

@Component({
  selector: "admin-quote-request-detail",
  imports: [RouterLink, TranslatePipe, DatePipe],
  templateUrl: "./admin-quote-request-detail.html",
  styleUrl: "./admin-quote-request-detail.scss",
})
export class AdminQuoteRequestDetail implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly adminQuoteRequestService = inject(AdminQuoteRequestService);
  private readonly router = inject(Router);

  private readonly idUrlState = signal<string | null>(null);
  protected readonly idUrl = this.idUrlState.asReadonly();

  protected readonly selectedRequest =
    this.adminQuoteRequestService.selectedRequest;
  protected readonly isLoading = this.adminQuoteRequestService.isLoading;
  protected readonly hasError = this.adminQuoteRequestService.hasError;
  protected readonly isUpdatingStatus =
    this.adminQuoteRequestService.isUpdatingStatus;
  protected readonly isDeleting = this.adminQuoteRequestService.isDeleting;
  protected readonly selectedStatus = signal<QuoteRequestStatus>("pending");

  private readonly openingAttachmentState = signal(false);
  protected readonly isOpeningAttachment = this.openingAttachmentState
    .asReadonly();

  private readonly deleteConfirmationOpenState = signal(false);
  protected readonly deleteConfirmationOpen = this.deleteConfirmationOpenState
    .asReadonly();

  protected readonly syncSelectedStatus = effect(() => {
    const request = this.selectedRequest();

    if (request) {
      this.selectedStatus.set(request.status);
    }
  });

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get("id");

    this.idUrlState.set(id);

    if (!id) {
      return;
    }

    this.adminQuoteRequestService.loadQuoteRequestById(id).subscribe();
  }

  protected onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as QuoteRequestStatus;

    this.selectedStatus.set(status);
  }

  protected updateStatus(): void {
    const request = this.selectedRequest();

    if (!request) {
      return;
    }

    this.adminQuoteRequestService
      .updateQuoteRequestStatus(request.id, this.selectedStatus())
      .subscribe();
  }

  protected openAttachment(): void {
    const request = this.selectedRequest();

    if (!request?.attachmentPath) {
      return;
    }

    this.openingAttachmentState.set(true);

    this.adminQuoteRequestService
      .createAttachmentSignedUrl(request.attachmentPath)
      .pipe(
        finalize(() => {
          this.openingAttachmentState.set(false);
        }),
      )
      .subscribe({
        next: (signedUrl) => {
          window.open(
            signedUrl,
            "_blank",
            "noopener,noreferrer",
          );
        },
        error: (error) => {
          console.error("Unable to open attachment:", error);
        },
      });
  }

  protected requestDeleteQuoteRequest(): void {
    const request = this.selectedRequest();

    if (!request || this.isDeleting()) {
      return;
    }

    this.deleteConfirmationOpenState.set(true);
  }

  protected cancelDeleteQuoteRequest(): void {
    if (this.isDeleting()) {
      return;
    }

    this.deleteConfirmationOpenState.set(false);
  }

  protected confirmDeleteQuoteRequest(): void {
    const request = this.selectedRequest();

    if (!request || this.isDeleting()) {
      return;
    }

    this.adminQuoteRequestService.deleteQuoteRequest(request.id).subscribe({
      next: () => {
        this.deleteConfirmationOpenState.set(false);
        void this.router.navigateByUrl("/admin");
      },
      error: (error) => {
        console.error("Unable to delete quote request:", error);
      },
    });
  }
}
