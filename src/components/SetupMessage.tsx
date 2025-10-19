import { Card } from '@/components/ui/card';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SetupMessage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl p-8 bg-card border-border space-y-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-8 w-8 text-primary shrink-0" />
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-foreground">
              Backend Setup Required
            </h1>
            
            <div className="space-y-3 text-muted-foreground">
              <p>
                To use this temporary email application, you need to set up:
              </p>
              
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Create a Supabase project and run the database migrations</li>
                <li>Deploy the Node.js + Express backend (code provided)</li>
                <li>Configure an email service provider (MailGun or SendGrid)</li>
                <li>Set up MX records on your domain</li>
                <li>Add environment variables to this project</li>
              </ol>
            </div>

            <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-foreground">Required Environment Variables:</p>
              <code className="email-mono text-sm block text-primary">
                VITE_SUPABASE_URL=your_supabase_url<br />
                VITE_SUPABASE_ANON_KEY=your_supabase_anon_key<br />
                VITE_API_URL=https://your-backend-url.com
              </code>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => window.open('/BACKEND_SETUP.md', '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Complete Setup Instructions
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              All setup instructions including backend code, SQL migrations, and email provider configuration 
              are available in the <span className="email-mono text-primary">BACKEND_SETUP.md</span> file.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
