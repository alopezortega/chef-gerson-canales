import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { TranslatePipe } from "@ngx-translate/core";
import { finalize, switchMap } from "rxjs";

import { LanguageService } from "../../core/services/language.service";
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

  private readonly languageService = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly currentLanguage = this.languageService.currentLanguage;

  protected readonly currentDocument = computed(() =>
    this.serviceDocumentService.getDocument(
      this.currentLanguage(),
    )
  );

  protected readonly isDocumentLoading = this.serviceDocumentService.isLoading;

  protected readonly isDownloading = signal(false);

  protected readonly downloadError = signal(false);

  private readonly currentLanguage$ = toObservable(
    this.currentLanguage,
  );

  ngOnInit(): void {
    this.currentLanguage$
      .pipe(
        switchMap((language) =>
          this.serviceDocumentService.loadCurrentDocument(
            language,
          )
        ),
        takeUntilDestroyed(this.destroyRef),
      )
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
