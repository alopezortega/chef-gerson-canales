import { DatePipe } from '@angular/common';
import { Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ServiceDocumentService } from '../../features/service-document/services/service-document.service';

@Component({
  selector: 'admin-service-document',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './admin-service-document.html',
  styleUrl: './admin-service-document.scss',
})
export class AdminServiceDocument implements OnInit {
  private readonly serviceDocumentService = inject(ServiceDocumentService);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('serviceDocumentInput');

  protected readonly currentDocument = this.serviceDocumentService.currentDocument;

  protected readonly isLoading = this.serviceDocumentService.isLoading;

  protected readonly isUploading = this.serviceDocumentService.isUploading;

  protected readonly isDeleting = this.serviceDocumentService.isDeleting;

  protected readonly hasError = this.serviceDocumentService.hasError;

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly uploadSuccess = signal(false);
  protected readonly deleteSuccess = signal(false);
  protected readonly invalidFile = signal(false);

  ngOnInit(): void {
    void this.serviceDocumentService.loadCurrentDocument();
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

    if (file.type !== 'application/pdf') {
      this.resetFileInput();
      this.invalidFile.set(true);
      return;
    }

    this.selectedFile.set(file);
  }

  protected async uploadDocument(): Promise<void> {
    const file = this.selectedFile();

    if (!file || this.isUploading()) {
      return;
    }

    this.uploadSuccess.set(false);
    this.deleteSuccess.set(false);

    try {
      await this.serviceDocumentService.uploadDocument(file);
      this.resetFileInput();
      this.uploadSuccess.set(true);
    } catch {
      this.uploadSuccess.set(false);
    }
  }

  protected async deleteDocument(): Promise<void> {
    if (!this.currentDocument() || this.isDeleting()) {
      return;
    }

    this.uploadSuccess.set(false);
    this.deleteSuccess.set(false);

    try {
      await this.serviceDocumentService.deleteCurrentDocument();
      this.resetFileInput();
      this.deleteSuccess.set(true);
    } catch {
      this.deleteSuccess.set(false);
    }
  }

  private resetFileInput(): void {
    this.selectedFile.set(null);

    const input = this.fileInput()?.nativeElement;

    if (input) {
      input.value = '';
    }
  }
}
