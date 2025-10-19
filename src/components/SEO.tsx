import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export const SEO = ({
  title = 'TempMail - Disposable Temporary Email Address',
  description = 'Free temporary email addresses that expire in 1 hour. Protect your privacy with disposable email for spam protection and anonymous registration.',
  keywords = 'temporary email, disposable email, temp mail, fake email, anonymous email, spam protection, privacy',
  ogImage = '/og-image.png',
}: SEOProps) => {
  const fullTitle = title.includes('TempMail') ? title : `${title} | TempMail`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="1 days" />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
};
