export interface TempEmail {
  id: string;
  email_address: string;
  created_at: string;
  expires_at: string;
}

export interface ReceivedEmail {
  id: string;
  temp_email_id: string;
  from_address: string;
  subject: string;
  body_text: string;
  body_html: string;
  received_at: string;
}
