import Head from "next/head";
import React from "react";

const siteTitle = "MSC & Co";
const titleSeparator = "|";

function SEO({ pageTitle, brand = null }) {
  const brandTitle = brand ? `${brand} - ${siteTitle}` : siteTitle;
  const fullTitle = pageTitle ? `${pageTitle} ${titleSeparator} ${brandTitle}` : brandTitle;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content="MSC & Co - Multi-brand music distribution and publishing platform. YHWH MSC for gospel/christian music. Audio MSC for general music and licensing." />
      <meta name="keywords" content="music distribution, publishing, licensing, gospel music, christian music, film music, TV music, sync licensing" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content="MSC & Co - Multi-brand music distribution and publishing platform" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://mscandco.com" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content="MSC & Co - Multi-brand music distribution and publishing platform" />
    </Head>
  );
}

export default SEO;
