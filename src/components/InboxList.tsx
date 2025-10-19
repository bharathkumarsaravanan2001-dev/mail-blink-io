import { Card } from '@/components/ui/card';
import { Mail, Inbox as InboxIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ReceivedEmail } from '@/types/email';

interface InboxListProps {
  emails: ReceivedEmail[];
  selectedEmailId: string | null;
  onSelectEmail: (emailId: string) => void;
}

export const InboxList = ({ emails, selectedEmailId, onSelectEmail }: InboxListProps) => {
  if (emails.length === 0) {
    return (
      <Card className="p-8 bg-card border-border">
        <div className="text-center space-y-3">
          <InboxIcon className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">No emails yet</p>
          <p className="text-sm text-muted-foreground">
            Emails sent to your temporary address will appear here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-border bg-card border-border">
      {emails.map((email) => (
        <button
          key={email.id}
          onClick={() => onSelectEmail(email.id)}
          className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${
            selectedEmailId === email.id ? 'bg-secondary' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-1" />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-medium text-foreground truncate">{email.subject}</p>
              <p className="text-sm text-muted-foreground truncate email-mono">
                From: {email.from_address}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(email.received_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </button>
      ))}
    </Card>
  );
};
