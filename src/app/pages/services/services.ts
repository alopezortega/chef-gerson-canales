import { Component, inject, OnInit, signal } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { finalize } from "rxjs";

import { ServiceDocumentService } from "../../features/service-document/services/service-document.service";
import { FinalCta } from "../../shared/components/final-cta/final-cta";

@Component({
  selector: "app-services",
  imports: [TranslatePipe, FinalCta],
  templateUrl: "./services.html",
  styleUrl: "./services.scss",
})
export class ServicesComponent implements OnInit {
  private readonly serviceDocumentService = inject(
    ServiceDocumentService,
  );

  protected readonly currentDocument =
    this.serviceDocumentService.currentDocument;

  protected readonly isDocumentLoading = this.serviceDocumentService.isLoading;

  protected readonly isDownloading = signal(false);

  protected readonly downloadError = signal(false);

  ngOnInit(): void {
    this.serviceDocumentService
      .loadCurrentDocument()
      .subscribe();
  }

  protected downloadServiceDocument(): void {
    const document = this.currentDocument();

    if (!document || this.isDownloading()) {
      return;
    }

    this.downloadError.set(false);
    this.isDownloading.set(true);

    this.serviceDocumentService
      .createDownloadSignedUrl(document.storagePath)
      .pipe(
        finalize(() => {
          this.isDownloading.set(false);
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
        error: () => {
          this.downloadError.set(true);
        },
      });
  }
}
