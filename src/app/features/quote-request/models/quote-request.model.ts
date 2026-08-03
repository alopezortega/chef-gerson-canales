export interface QuoteRequest {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  location: string;
  dietaryRequirements: string;
  additionalInformation: string;
  privacyAccepted: boolean;
}

export interface QuoteRequestInsert {
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
}
