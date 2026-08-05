import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminQuoteRequestService } from '../../features/quote-request/services/admin-quote-request.service';

@Component({
  selector: 'admin-quote-request-detail',
  imports: [RouterLink],
  templateUrl: './admin-quote-request-detail.html',
  styleUrl: './admin-quote-request-detail.scss',
})
export class AdminQuoteRequestDetail implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly idUrlState = signal<string | null>(null);
  protected readonly idUrl = this.idUrlState.asReadonly();

  private readonly adminQuoteRequestService = inject(AdminQuoteRequestService);
  protected readonly selectedRequest = this.adminQuoteRequestService.selectedRequest;
  protected readonly isLoading = this.adminQuoteRequestService.isLoading;
  protected readonly hasError = this.adminQuoteRequestService.hasError;

  ngOnInit(): void {
    this.idUrlState.set(this.activatedRoute.snapshot.paramMap.get('id'));
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    this.adminQuoteRequestService.loadQuoteRequestById(id);
  }
}
