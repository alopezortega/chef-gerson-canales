import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../../environments/environment";
import { SupportedLanguage } from "../../../core/models/supported-language.type";
import { ServiceDocument } from "../models/service-document.model";

@Injectable({
  providedIn: "root",
})
export class ServiceDocumentApiService {
  private readonly http = inject(HttpClient);
  private readonly supabaseUrl = environment.supabase.url;
  private readonly apiUrl = `${this.supabaseUrl}/functions/v1`;

  getCurrentDocument(
    language: SupportedLanguage,
  ): Observable<ServiceDocument | null> {
    return this.http.get<ServiceDocument | null>(
      `${this.apiUrl}/service-document`,
      {
        params: {
          language,
        },
      },
    );
  }

  createDownloadSignedUrl(
    storagePath: string,
  ): Observable<string> {
    return this.http.get<string>(
      `${this.apiUrl}/service-document/download`,
      {
        params: {
          path: storagePath,
        },
      },
    );
  }

  uploadDocument(
    file: File,
    language: SupportedLanguage,
  ): Observable<ServiceDocument> {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("language", language);

    return this.http.post<ServiceDocument>(
      `${this.apiUrl}/service-document`,
      formData,
    );
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/service-document/${id}`,
    );
  }
}
