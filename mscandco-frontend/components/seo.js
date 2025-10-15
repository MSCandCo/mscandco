import Head from 'next/head';

const SEO = ({ 
  pageTitle, 
  description = "MSC & Co - Multi-brand music distribution and publishing platform",
  ogImage = "/logos/MSCandCoLogoV2.svg",
  ogUrl,
  siteName = "MSC & Co"
}) => {
  const title = pageTitle ? `${pageTitle} | MSC & Co` : 'MSC & Co';
  const currentUrl = ogUrl || (typeof window !== 'undefined' ? window.location.href : 'https://staging.mscandco.com');
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@MSCandCo" />
      <meta name="twitter:creator" content="@MSCandCo" />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="MSC & Co" />
      <meta name="keywords" content="music distribution, digital music, independent artists, music publishing, streaming, MSC & Co" />
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#1f2937" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
    </Head>
  );
};

export default SEO;
