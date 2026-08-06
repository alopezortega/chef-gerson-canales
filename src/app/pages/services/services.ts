import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { ServiceDocumentService } from '../../features/service-document/services/service-document.service';

@Component({
  selector: 'app-services',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class ServicesComponent implements OnInit {
  private readonly serviceDocumentService = inject(ServiceDocumentService);

  protected readonly currentDocument = this.serviceDocumentService.currentDocument;

  protected readonly isDocumentLoading = this.serviceDocumentService.isLoading;

  protected readonly isDownloading = signal(false);
  protected readonly downloadError = signal(false);

  ngOnInit(): void {
    void this.serviceDocumentService.loadCurrentDocument();
  }

  protected async downloadServiceDocument(): Promise<void> {
    const document = this.currentDocument();

    if (!document || this.isDownloading()) {
      return;
    }

    this.downloadError.set(false);
    this.isDownloading.set(true);

    try {
      const signedUrl = await this.serviceDocumentService.createDownloadSignedUrl(
        document.storagePath,
      );

      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      this.downloadError.set(true);
    } finally {
      this.isDownloading.set(false);
    }
  }
}
