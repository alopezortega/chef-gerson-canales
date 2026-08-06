import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import type { QuoteRequestStatus } from '../../features/quote-request/models/admin-quote-request.model';
import { AdminQuoteRequestService } from '../../features/quote-request/services/admin-quote-request.service';

@Component({
  selector: 'admin-quote-request-detail',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './admin-quote-request-detail.html',
  styleUrl: './admin-quote-request-detail.scss',
})
export class AdminQuoteRequestDetail implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly adminQuoteRequestService = inject(AdminQuoteRequestService);

  private readonly idUrlState = signal<string | null>(null);
  protected readonly idUrl = this.idUrlState.asReadonly();

  protected readonly selectedRequest = this.adminQuoteRequestService.selectedRequest;
  protected readonly isLoading = this.adminQuoteRequestService.isLoading;
  protected readonly hasError = this.adminQuoteRequestService.hasError;
  protected readonly isUpdatingStatus = this.adminQuoteRequestService.isUpdatingStatus;
  protected readonly selectedStatus = signal<QuoteRequestStatus>('pending');

  private readonly openingAttachmentState = signal(false);
  protected readonly isOpeningAttachment = this.openingAttachmentState.asReadonly();

  protected readonly syncSelectedStatus = effect(() => {
    const request = this.selectedRequest();

    if (request) {
      this.selectedStatus.set(request.status);
    }
  });

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    this.idUrlState.set(id);

    if (!id) {
      return;
    }

    void this.adminQuoteRequestService.loadQuoteRequestById(id);
  }

  protected onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as QuoteRequestStatus;

    this.selectedStatus.set(status);
  }

  protected async updateStatus(): Promise<void> {
    const request = this.selectedRequest();

    if (!request) {
      return;
    }

    await this.adminQuoteRequestService.updateQuoteRequestStatus(request.id, this.selectedStatus());
  }

  protected async openAttachment(): Promise<void> {
    const request = this.selectedRequest();

    if (!request?.attachmentPath) {
      return;
    }

    this.openingAttachmentState.set(true);

    try {
      const signedUrl = await this.adminQuoteRequestService.createAttachmentSignedUrl(
        request.attachmentPath,
      );

      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Unable to open attachment:', error);
    } finally {
      this.openingAttachmentState.set(false);
    }
  }
}
