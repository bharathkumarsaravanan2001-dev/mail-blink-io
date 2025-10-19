import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ReceivedEmail } from '@/types/email';

interface EmailDetailProps {
  email: ReceivedEmail;
  onBack: () => void;
}

export const EmailDetail = ({ email, onBack }: EmailDetailProps) => {
  return (
    <Card className="p-6 bg-card border-border space-y-4">
      <Button
        onClick={onBack}
        variant="ghost"
        size="sm"
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Inbox
      </Button>

      <div className="space-y-3 pb-4 border-b border-border">
        <h2 className="text-2xl font-semibold text-foreground">{email.subject}</h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-muted-foreground">From:</span>
            <span className="email-mono text-foreground">{email.from_address}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground">Received:</span>
            <span className="text-foreground">
              {format(new Date(email.received_at), 'PPpp')}
            </span>
          </div>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        {email.body_html ? (
          <div
            className="text-foreground"
            dangerouslySetInnerHTML={{ __html: email.body_html }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-foreground font-sans">
            {email.body_text}
          </pre>
        )}
      </div>
    </Card>
  );
};
