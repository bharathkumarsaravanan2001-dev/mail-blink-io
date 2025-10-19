import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, RefreshCw, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { TempEmail } from '@/types/email';

interface EmailGeneratorProps {
  tempEmail: TempEmail | null;
  onGenerate: () => void;
  isLoading: boolean;
}

export const EmailGenerator = ({ tempEmail, onGenerate, isLoading }: EmailGeneratorProps) => {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    if (tempEmail?.email_address) {
      await navigator.clipboard.writeText(tempEmail.email_address);
      toast({
        title: "Copied!",
        description: "Email address copied to clipboard",
      });
    }
  };

  const getTimeRemaining = () => {
    if (!tempEmail) return null;
    const expiresAt = new Date(tempEmail.expires_at);
    return formatDistanceToNow(expiresAt, { addSuffix: true });
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Your Temporary Email</h2>
          <Button
            onClick={onGenerate}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Generate New
          </Button>
        </div>

        {tempEmail ? (
          <>
            <div className="flex items-center gap-2 p-4 bg-secondary rounded-lg">
              <code className="email-mono flex-1 text-lg text-primary break-all">
                {tempEmail.email_address}
              </code>
              <Button
                onClick={copyToClipboard}
                variant="ghost"
                size="icon"
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Expires {getTimeRemaining()}</span>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Click "Generate New" to create a temporary email address</p>
          </div>
        )}
      </div>
    </Card>
  );
};
