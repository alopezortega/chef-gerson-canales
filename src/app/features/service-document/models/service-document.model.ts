import { SupportedLanguage } from "../../../core/models/supported-language.type";

export interface ServiceDocument {
  id: string;
  storagePath: string;
  originalName: string;
  mimeType: string;
  size: number;
  language: SupportedLanguage;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceDocumentRow {
  id: string;
  storage_path: string;
  original_name: string;
  mime_type: string;
  size: number;
  language: SupportedLanguage;
  created_at: string;
  updated_at: string;
}
