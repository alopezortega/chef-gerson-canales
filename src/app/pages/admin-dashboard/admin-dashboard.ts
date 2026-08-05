import { Component, inject, OnInit } from '@angular/core';
import { AdminQuoteRequestService } from '../../features/quote-request/services/admin-quote-request.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'admin-dashboard',
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private readonly adminQuoteRequestService = inject(AdminQuoteRequestService);

  protected readonly requests = this.adminQuoteRequestService.requests;
  protected readonly isLoading = this.adminQuoteRequestService.isLoading;
  protected readonly hasError = this.adminQuoteRequestService.hasError;

  ngOnInit(): void {
    void this.adminQuoteRequestService.loadQuoteRequests();
  }
}
