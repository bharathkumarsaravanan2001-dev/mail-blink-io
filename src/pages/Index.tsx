import { useState, useEffect } from 'react';
import { EmailGenerator } from '@/components/EmailGenerator';
import { InboxList } from '@/components/InboxList';
import { EmailDetail } from '@/components/EmailDetail';
import { SEO } from '@/components/SEO';
import { SetupMessage } from '@/components/SetupMessage';
import { supabase, API_URL, isSupabaseConfigured } from '@/lib/supabase';
import { TempEmail, ReceivedEmail } from '@/types/email';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [tempEmail, setTempEmail] = useState<TempEmail | null>(null);
  const [emails, setEmails] = useState<ReceivedEmail[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEmails, setIsFetchingEmails] = useState(false);
  const { toast } = useToast();

  // Generate a new temporary email
  const generateTempEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/generate-email`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to generate email');
      
      const data = await response.json();
      setTempEmail(data.tempEmail);
      setEmails([]);
      setSelectedEmailId(null);
      
      // Store in localStorage for persistence
      localStorage.setItem('tempEmail', JSON.stringify(data.tempEmail));
      
      toast({
        title: "Success!",
        description: "New temporary email created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate email. Make sure backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch emails for current temp email
  const fetchEmails = async () => {
    if (!tempEmail || !supabase) return;
    
    setIsFetchingEmails(true);
    try {
      const { data, error } = await supabase
        .from('received_emails')
        .select('*')
        .eq('temp_email_id', tempEmail.id)
        .order('received_at', { ascending: false });

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setIsFetchingEmails(false);
    }
  };

  // Subscribe to real-time email updates
  useEffect(() => {
    if (!tempEmail || !supabase) return;

    // Initial fetch
    fetchEmails();

    // Set up real-time subscription
    const channel = supabase
      .channel('received-emails')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'received_emails',
          filter: `temp_email_id=eq.${tempEmail.id}`,
        },
        (payload) => {
          setEmails((prev) => [payload.new as ReceivedEmail, ...prev]);
          toast({
            title: "New Email!",
            description: "You've received a new email",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tempEmail]);

  // Check for expired email
  useEffect(() => {
    if (!tempEmail) return;

    const checkExpiration = () => {
      const expiresAt = new Date(tempEmail.expires_at);
      if (new Date() > expiresAt) {
        setTempEmail(null);
        setEmails([]);
        localStorage.removeItem('tempEmail');
        toast({
          title: "Email Expired",
          description: "Your temporary email has expired",
          variant: "destructive",
        });
      }
    };

    const interval = setInterval(checkExpiration, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [tempEmail]);

  // Load temp email from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('tempEmail');
    if (stored) {
      const parsed = JSON.parse(stored);
      const expiresAt = new Date(parsed.expires_at);
      if (new Date() < expiresAt) {
        setTempEmail(parsed);
      } else {
        localStorage.removeItem('tempEmail');
      }
    }
  }, []);

  const selectedEmail = emails.find((e) => e.id === selectedEmailId);

  // Show setup message if Supabase is not configured
  if (!isSupabaseConfigured) {
    return <SetupMessage />;
  }

  return (
    <>
      <SEO />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-primary">TempMail</h1>
            <p className="text-sm text-muted-foreground">Disposable email addresses that expire in 1 hour</p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="space-y-6">
            <EmailGenerator
              tempEmail={tempEmail}
              onGenerate={generateTempEmail}
              isLoading={isLoading}
            />

            {tempEmail && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Inbox</h2>
                  {isFetchingEmails && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                </div>

                {selectedEmail ? (
                  <EmailDetail
                    email={selectedEmail}
                    onBack={() => setSelectedEmailId(null)}
                  />
                ) : (
                  <InboxList
                    emails={emails}
                    selectedEmailId={selectedEmailId}
                    onSelectEmail={setSelectedEmailId}
                  />
                )}
              </section>
            )}
          </div>
        </main>

        <footer className="border-t border-border mt-16 py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2025 TempMail. All temporary emails expire after 1 hour.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
