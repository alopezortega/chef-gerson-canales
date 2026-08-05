export type QuoteRequestStatus = 'pending' | 'contacted' | 'closed';

export interface AdminQuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  eventType: string;
  eventDate: string | null;
  guestCount: number;
  location: string | null;
  dietaryRequirements: string | null;
  additionalInformation: string | null;
  privacyAccepted: boolean;
  attachmentPath: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  attachmentSize: number | null;
  status: QuoteRequestStatus;
  createdAt: string;
}

export interface AdminQuoteRequestRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  event_type: string;
  event_date: string | null;
  guest_count: number;
  location: string | null;
  dietary_requirements: string | null;
  additional_information: string | null;
  privacy_accepted: boolean;
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  attachment_size: number | null;
  status: QuoteRequestStatus;
  created_at: string;
}
