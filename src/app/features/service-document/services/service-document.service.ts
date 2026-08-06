import { inject, Injectable, signal } from '@angular/core';

import { SUPABASE_CLIENT } from '../../../core/config/supabase-client.token';
import type { ServiceDocument, ServiceDocumentRow } from '../models/service-document.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceDocumentService {
  private readonly supabaseClient = inject(SUPABASE_CLIENT);

  private readonly currentDocumentState = signal<ServiceDocument | null>(null);

  readonly currentDocument = this.currentDocumentState.asReadonly();

  private readonly loadingState = signal<boolean>(false);

  readonly isLoading = this.loadingState.asReadonly();

  private readonly errorState = signal<boolean>(false);

  readonly hasError = this.errorState.asReadonly();

  private readonly uploadingState = signal<boolean>(false);

  readonly isUploading = this.uploadingState.asReadonly();

  private readonly deletingState = signal<boolean>(false);

  readonly isDeleting = this.deletingState.asReadonly();

  async loadCurrentDocument(): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set(false);

    try {
      const { data, error } = await this.supabaseClient
        .from('service_documents')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        this.currentDocumentState.set(null);
        return;
      }

      const documentRow = data as ServiceDocumentRow;
      const mappedDocument = this.mapServiceDocumentRow(documentRow);

      this.currentDocumentState.set(mappedDocument);
    } catch (error) {
      console.error('Unable to load service document:', error);
      this.currentDocumentState.set(null);
      this.errorState.set(true);
      throw error;
    } finally {
      this.loadingState.set(false);
    }
  }

  async uploadDocument(file: File): Promise<void> {
    this.uploadingState.set(true);
    this.errorState.set(false);

    const previousDocument = this.currentDocumentState();
    let newStoragePath: string | null = null;

    try {
      const safeFileName = this.sanitizeFileName(file.name);

      newStoragePath = `${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await this.supabaseClient.storage
        .from('service-documents')
        .upload(newStoragePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const documentMetadata = {
        storage_path: newStoragePath,
        original_name: file.name,
        mime_type: file.type,
        size: file.size,
        updated_at: new Date().toISOString(),
      };

      const { data, error: databaseError } = previousDocument
        ? await this.supabaseClient
            .from('service_documents')
            .update(documentMetadata)
            .eq('id', previousDocument.id)
            .select('*')
            .single()
        : await this.supabaseClient
            .from('service_documents')
            .insert(documentMetadata)
            .select('*')
            .single();

      if (databaseError) {
        throw databaseError;
      }

      const documentRow = data as ServiceDocumentRow;
      const mappedDocument = this.mapServiceDocumentRow(documentRow);

      this.currentDocumentState.set(mappedDocument);

      if (previousDocument && previousDocument.storagePath !== newStoragePath) {
        const { error: previousFileDeleteError } = await this.supabaseClient.storage
          .from('service-documents')
          .remove([previousDocument.storagePath]);

        if (previousFileDeleteError) {
          console.error('Unable to delete previous service document:', previousFileDeleteError);
        }
      }
    } catch (error) {
      console.error('Unable to upload service document:', error);
      this.errorState.set(true);

      if (newStoragePath) {
        const activeStoragePath = this.currentDocumentState()?.storagePath;

        if (activeStoragePath !== newStoragePath) {
          const { error: cleanupError } = await this.supabaseClient.storage
            .from('service-documents')
            .remove([newStoragePath]);

          if (cleanupError) {
            console.error('Unable to clean up failed service document upload:', cleanupError);
          }
        }
      }

      throw error;
    } finally {
      this.uploadingState.set(false);
    }
  }

  async deleteCurrentDocument(): Promise<void> {
    const currentDocument = this.currentDocumentState();

    if (!currentDocument) {
      return;
    }

    this.deletingState.set(true);
    this.errorState.set(false);

    try {
      const { error: databaseError } = await this.supabaseClient
        .from('service_documents')
        .delete()
        .eq('id', currentDocument.id);

      if (databaseError) {
        throw databaseError;
      }

      this.currentDocumentState.set(null);

      const { error: storageError } = await this.supabaseClient.storage
        .from('service-documents')
        .remove([currentDocument.storagePath]);

      if (storageError) {
        console.error('Unable to delete service document file:', storageError);
      }
    } catch (error) {
      console.error('Unable to delete service document:', error);
      this.errorState.set(true);
      throw error;
    } finally {
      this.deletingState.set(false);
    }
  }

  async createDownloadSignedUrl(storagePath: string): Promise<string> {
    this.errorState.set(false);

    try {
      const { data, error } = await this.supabaseClient.storage
        .from('service-documents')
        .createSignedUrl(storagePath, 60);

      if (error) {
        throw error;
      }

      if (!data.signedUrl) {
        throw new Error('Supabase did not return a signed document URL.');
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Unable to create service document signed URL:', error);
      this.errorState.set(true);
      throw error;
    }
  }

  private mapServiceDocumentRow(documentRow: ServiceDocumentRow): ServiceDocument {
    return {
      id: documentRow.id,
      storagePath: documentRow.storage_path,
      originalName: documentRow.original_name,
      mimeType: documentRow.mime_type,
      size: documentRow.size,
      createdAt: documentRow.created_at,
      updatedAt: documentRow.updated_at,
    };
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9.-]/g, '');
  }
}
