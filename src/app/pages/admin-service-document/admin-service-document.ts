import { DatePipe } from "@angular/common";
import {
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";

import { SupportedLanguage } from "../../core/models/supported-language.type";
import { ServiceDocumentService } from "../../features/service-document/services/service-document.service";

@Component({
  selector: "admin-service-document",
  imports: [DatePipe, TranslatePipe],
  templateUrl: "./admin-service-document.html",
  styleUrl: "./admin-service-document.scss",
})
export class AdminServiceDocument implements OnInit {
  private readonly serviceDocumentService = inject(
    ServiceDocumentService,
  );

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>(
    "serviceDocumentInput",
  );

  protected readonly selectedLanguage = signal<SupportedLanguage>("es");

  protected readonly currentDocument = computed(() =>
    this.serviceDocumentService.getDocument(
      this.selectedLanguage(),
    )
  );

  protected readonly isLoading = this.serviceDocumentService.isLoading;

  protected readonly isUploading = this.serviceDocumentService.isUploading;

  protected readonly isDeleting = this.serviceDocumentService.isDeleting;

  protected readonly hasError = this.serviceDocumentService.hasError;

  protected readonly selectedFile = signal<File | null>(null);

  protected readonly uploadSuccess = signal(false);

  protected readonly deleteSuccess = signal(false);

  protected readonly invalidFile = signal(false);

  private readonly deleteConfirmationOpenState = signal(false);

  protected readonly deleteConfirmationOpen = this.deleteConfirmationOpenState
    .asReadonly();

  ngOnInit(): void {
    this.loadSelectedLanguageDocument();
  }

  protected selectLanguage(
    language: SupportedLanguage,
  ): void {
    if (
      language === this.selectedLanguage() ||
      this.isUploading() ||
      this.isDeleting()
    ) {
      return;
    }

    this.selectedLanguage.set(language);

    this.uploadSuccess.set(false);
    this.deleteSuccess.set(false);
    this.invalidFile.set(false);
    this.deleteConfirmationOpenState.set(false);

    this.resetFileInput();
    this.loadSelectedLanguageDocument();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.uploadSuccess.set(false);
    this.deleteSuccess.set(false);
    this.invalidFile.set(false);

    if (!file) {
      this.resetFileInput();
      return;
    }

    if (file.type !== "application/pdf") {
      this.resetFileInput();
      this.invalidFile.set(true);
      return;
    }

    this.selectedFile.set(file);
  }

  protected uploadDocument(): void {
    const file = this.selectedFile();

    if (!file || this.isUploading()) {
      return;
    }

    this.uploadSuccess.set(false);
    this.deleteSuccess.set(false);

    this.serviceDocumentService
      .uploadDocument(
        file,
        this.selectedLanguage(),
      )
      .subscribe({
        next: () => {
          this.resetFileInput();
          this.uploadSuccess.set(true);
        },
        error: () => {
          this.uploadSuccess.set(false);
        },
      });
  }

  protected requestDeleteDocument(): void {
    if (!this.currentDocument() || this.isDeleting()) {
      return;
    }

    this.deleteConfirmationOpenState.set(true);
  }

  protected cancelDeleteDocument(): void {
    if (this.isDeleting()) {
      return;
    }

    this.deleteConfirmationOpenState.set(false);
  }

  protected confirmDeleteDocument(): void {
    if (!this.currentDocument() || this.isDeleting()) {
      return;
    }

    this.uploadSuccess.set(false);
    this.deleteSuccess.set(false);

    this.serviceDocumentService
      .deleteCurrentDocument(
        this.selectedLanguage(),
      )
      .subscribe({
        next: () => {
          this.deleteConfirmationOpenState.set(false);
          this.resetFileInput();
          this.deleteSuccess.set(true);
        },
        error: () => {
          this.deleteSuccess.set(false);
        },
      });
  }

  private loadSelectedLanguageDocument(): void {
    this.serviceDocumentService
      .loadCurrentDocument(
        this.selectedLanguage(),
      )
      .subscribe();
  }

  private resetFileInput(): void {
    this.selectedFile.set(null);

    const input = this.fileInput()?.nativeElement;

    if (input) {
      input.value = "";
    }
  }
}
