import { inject, Injectable } from '@angular/core';

import { SUPABASE_CLIENT } from '../../../core/config/supabase-client.token';
import { QuoteRequest, QuoteRequestInsert } from '../models/quote-request.model';

const QUOTE_ATTACHMENTS_BUCKET = 'quote-request-attachments';

@Injectable({
  providedIn: 'root',
})
export class QuoteRequestService {
  private readonly supabaseClient = inject(SUPABASE_CLIENT);

  async createQuoteRequest(request: QuoteRequest, attachment: File | null): Promise<void> {
    const attachmentPath = attachment ? await this.uploadAttachment(attachment) : null;

    const quoteRequestInsert: QuoteRequestInsert = {
      name: request.name,
      email: request.email,
      phone: request.phone || null,
      event_type: request.eventType,
      event_date: request.eventDate || null,
      guest_count: request.guestCount,
      location: request.location || null,
      dietary_requirements: request.dietaryRequirements || null,
      additional_information: request.additionalInformation || null,
      privacy_accepted: request.privacyAccepted,
      attachment_path: attachmentPath,
      attachment_name: attachment?.name ?? null,
      attachment_type: attachment?.type ?? null,
      attachment_size: attachment?.size ?? null,
    };

    const { error } = await this.supabaseClient.from('quote_requests').insert(quoteRequestInsert);

    if (error) {
      throw error;
    }
  }

  private async uploadAttachment(attachment: File): Promise<string> {
    const safeFileName = this.sanitizeFileName(attachment.name);
    const attachmentPath = `${crypto.randomUUID()}/${safeFileName}`;

    const { data, error } = await this.supabaseClient.storage
      .from(QUOTE_ATTACHMENTS_BUCKET)
      .upload(attachmentPath, attachment, {
        contentType: attachment.type,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    return data.path;
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .toLowerCase();
  }
}
