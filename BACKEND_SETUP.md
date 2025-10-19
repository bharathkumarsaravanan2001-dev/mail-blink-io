# Backend Setup Instructions

This temporary email application requires:
1. **Node.js + Express Backend** (you'll deploy this externally)
2. **Supabase Database** (your own Supabase project)
3. **Email Service Provider** (MailGun or SendGrid with inbound email parsing)
4. **Custom Domain** with MX records

---

## 1. Supabase Database Setup

### Create a Supabase Project
1. Go to https://supabase.com and create a new project
2. Copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### Run These SQL Migrations

```sql
-- Create temp_emails table
CREATE TABLE public.temp_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create received_emails table
CREATE TABLE public.received_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temp_email_id UUID REFERENCES public.temp_emails(id) ON DELETE CASCADE,
  from_address TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.temp_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.received_emails ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access)
CREATE POLICY "Allow public read temp_emails" ON public.temp_emails
  FOR SELECT USING (true);

CREATE POLICY "Allow public read received_emails" ON public.received_emails
  FOR SELECT USING (true);

-- Enable realtime for received_emails
ALTER PUBLICATION supabase_realtime ADD TABLE public.received_emails;
```

---

## 2. Node.js + Express Backend

Create a new folder for your backend and set up the following:

### Install Dependencies

```bash
npm init -y
npm install express cors dotenv @supabase/supabase-js body-parser
```

### Create `.env` file

```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
TEMP_EMAIL_DOMAIN=yourdomain.com
MAILGUN_API_KEY=your_mailgun_api_key (if using MailGun)
```

### Create `server.js`

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Generate a new temporary email
app.post('/api/generate-email', async (req, res) => {
  try {
    // Generate random email address
    const randomString = Math.random().toString(36).substring(2, 12);
    const emailAddress = `${randomString}@${process.env.TEMP_EMAIL_DOMAIN}`;
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Insert into database
    const { data, error } = await supabase
      .from('temp_emails')
      .insert([
        {
          email_address: emailAddress,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({ tempEmail: data });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ error: 'Failed to generate email' });
  }
});

// Webhook endpoint for receiving emails (MailGun/SendGrid will POST here)
app.post('/api/webhook/inbound-email', async (req, res) => {
  try {
    // Parse email data (format varies by provider)
    const { recipient, sender, subject, 'body-plain': bodyText, 'body-html': bodyHtml } = req.body;

    // Find the temp email in database
    const { data: tempEmail, error: findError } = await supabase
      .from('temp_emails')
      .select('*')
      .eq('email_address', recipient)
      .single();

    if (findError || !tempEmail) {
      console.log('Temp email not found:', recipient);
      return res.status(404).json({ error: 'Email address not found' });
    }

    // Check if expired
    if (new Date(tempEmail.expires_at) < new Date()) {
      console.log('Email expired:', recipient);
      return res.status(410).json({ error: 'Email address expired' });
    }

    // Insert received email
    const { error: insertError } = await supabase
      .from('received_emails')
      .insert([
        {
          temp_email_id: tempEmail.id,
          from_address: sender,
          subject: subject || '(No Subject)',
          body_text: bodyText || '',
          body_html: bodyHtml || '',
        },
      ]);

    if (insertError) throw insertError;

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing inbound email:', error);
    res.status(500).json({ error: 'Failed to process email' });
  }
});

// Cleanup expired emails (run this periodically with cron)
app.post('/api/cleanup-expired', async (req, res) => {
  try {
    const { error } = await supabase
      .from('temp_emails')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error cleaning up:', error);
    res.status(500).json({ error: 'Failed to cleanup' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Deploy Your Backend

Deploy to platforms like:
- **Heroku**: `heroku create && git push heroku main`
- **Railway**: Connect your GitHub repo
- **Render**: Deploy from GitHub
- **DigitalOcean App Platform**

---

## 3. Email Service Provider Setup

### Option A: MailGun (Recommended)

1. Sign up at https://mailgun.com
2. Add your domain and verify DNS records
3. Configure **Inbound Routes**:
   - Go to Receiving → Routes
   - Match Recipient: `.*@yourdomain.com`
   - Forward to: `https://your-backend-url.com/api/webhook/inbound-email`
4. Copy your API key to `.env`

### Option B: SendGrid

1. Sign up at https://sendgrid.com
2. Configure **Inbound Parse**:
   - Go to Settings → Inbound Parse
   - Add hostname: `yourdomain.com`
   - Destination URL: `https://your-backend-url.com/api/webhook/inbound-email`

---

## 4. Domain & MX Records Setup

Configure these DNS records at your domain registrar:

**For MailGun:**
```
Type: MX
Host: @
Value: mxa.mailgun.org
Priority: 10

Type: MX
Host: @
Value: mxb.mailgun.org
Priority: 10
```

**For SendGrid:**
```
Type: MX
Host: @
Value: mx.sendgrid.net
Priority: 10
```

---

## 5. Frontend Environment Variables

Create a `.env` file in your React project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://your-backend-url.com
```

---

## 6. Testing

1. Start your backend: `node server.js`
2. Generate a temp email in the frontend
3. Send an email to the generated address from Gmail/Outlook
4. Watch it appear in the inbox!

---

## 7. Production Checklist

- [ ] Backend deployed and running
- [ ] Supabase database configured
- [ ] Email service provider configured
- [ ] MX records propagated (can take 24-48 hours)
- [ ] Frontend environment variables set
- [ ] Set up cron job to call `/api/cleanup-expired` every hour
- [ ] Test sending emails from multiple providers

---

## Architecture Flow

```
External Email → Your Domain (MX Records) 
→ Email Provider (MailGun/SendGrid) 
→ Your Backend Webhook (/api/webhook/inbound-email)
→ Supabase Database (received_emails table)
→ Frontend (Real-time updates via Supabase)
```

---

## Need Help?

- MailGun Docs: https://documentation.mailgun.com/en/latest/user_manual.html#receiving-messages
- SendGrid Inbound Parse: https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook
- Supabase Realtime: https://supabase.com/docs/guides/realtime
