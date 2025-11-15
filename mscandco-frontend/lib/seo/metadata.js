/**
 * SEO and Metadata Management
 * Comprehensive SEO optimization and social media metadata
 */

/**
 * Base metadata configuration
 */
export const baseMetadata = {
  siteName: 'MSC & Co',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://mscandco.com',
  defaultTitle: 'MSC & Co - Music Distribution & Publishing Platform',
  titleTemplate: '%s | MSC & Co',
  defaultDescription: 'Professional music distribution and publishing platform powered by AI. Distribute to all major streaming platforms, track analytics, and grow your music career with Apollo AI.',
  defaultKeywords: [
    'music distribution',
    'music publishing',
    'streaming distribution',
    'spotify distribution',
    'apple music distribution',
    'independent artist',
    'music analytics',
    'royalty tracking',
    'music AI',
    'artist tools'
  ],
  defaultImage: '/images/og-image.png',
  twitterHandle: '@mscandco',
  locale: 'en_US',
  type: 'website'
};

/**
 * Generate complete metadata for a page
 */
export function generateMetadata(options = {}) {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    noindex = false,
    nofollow = false,
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = []
  } = options;

  const fullTitle = title
    ? `${title} | ${baseMetadata.siteName}`
    : baseMetadata.defaultTitle;

  const fullDescription = description || baseMetadata.defaultDescription;
  const fullKeywords = [...baseMetadata.defaultKeywords, ...keywords];
  const fullImage = image || baseMetadata.defaultImage;
  const fullUrl = url || baseMetadata.siteUrl;

  // Ensure image is absolute URL
  const absoluteImage = fullImage.startsWith('http')
    ? fullImage
    : `${baseMetadata.siteUrl}${fullImage}`;

  const metadata = {
    title: fullTitle,
    description: fullDescription,
    keywords: fullKeywords.join(', '),

    // Open Graph
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: baseMetadata.siteName,
      images: [
        {
          url: absoluteImage,
          width: 1200,
          height: 630,
          alt: title || baseMetadata.defaultTitle
        }
      ],
      locale: baseMetadata.locale,
      type: type
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [absoluteImage],
      creator: baseMetadata.twitterHandle,
      site: baseMetadata.twitterHandle
    },

    // Robots
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },

    // Verification
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      bing: process.env.NEXT_PUBLIC_BING_VERIFICATION
    },

    // Alternate languages
    alternates: {
      canonical: fullUrl,
      languages: {
        'en-US': `${baseMetadata.siteUrl}/en`,
        'es-ES': `${baseMetadata.siteUrl}/es`,
        'fr-FR': `${baseMetadata.siteUrl}/fr`,
        'de-DE': `${baseMetadata.siteUrl}/de`,
        'ja-JP': `${baseMetadata.siteUrl}/ja`
      }
    }
  };

  // Add article-specific metadata
  if (type === 'article') {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
      tags
    };
  }

  return metadata;
}

/**
 * Generate JSON-LD structured data
 */
export function generateJsonLd(type, data) {
  const baseContext = 'https://schema.org';

  const schemas = {
    // Organization schema
    organization: {
      '@context': baseContext,
      '@type': 'Organization',
      name: baseMetadata.siteName,
      url: baseMetadata.siteUrl,
      logo: `${baseMetadata.siteUrl}/images/logo.png`,
      sameAs: [
        'https://twitter.com/mscandco',
        'https://facebook.com/mscandco',
        'https://instagram.com/mscandco',
        'https://linkedin.com/company/mscandco'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-MSC-ANDO',
        contactType: 'Customer Service',
        email: 'support@mscandco.com'
      }
    },

    // Website schema
    website: {
      '@context': baseContext,
      '@type': 'WebSite',
      name: baseMetadata.siteName,
      url: baseMetadata.siteUrl,
      description: baseMetadata.defaultDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseMetadata.siteUrl}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    },

    // Breadcrumb schema
    breadcrumb: {
      '@context': baseContext,
      '@type': 'BreadcrumbList',
      itemListElement: data.items?.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    },

    // Article schema
    article: {
      '@context': baseContext,
      '@type': 'Article',
      headline: data.title,
      description: data.description,
      image: data.image,
      datePublished: data.publishedTime,
      dateModified: data.modifiedTime,
      author: {
        '@type': 'Person',
        name: data.author
      },
      publisher: {
        '@type': 'Organization',
        name: baseMetadata.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${baseMetadata.siteUrl}/images/logo.png`
        }
      }
    },

    // FAQ schema
    faq: {
      '@context': baseContext,
      '@type': 'FAQPage',
      mainEntity: data.questions?.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer
        }
      }))
    },

    // Product schema (for subscription/services)
    product: {
      '@context': baseContext,
      '@type': 'Product',
      name: data.name,
      description: data.description,
      image: data.image,
      brand: {
        '@type': 'Brand',
        name: baseMetadata.siteName
      },
      offers: {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: data.currency || 'USD',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: data.rating ? {
        '@type': 'AggregateRating',
        ratingValue: data.rating.value,
        reviewCount: data.rating.count
      } : undefined
    }
  };

  return schemas[type] || {};
}

/**
 * Generate sitemap entry
 */
export function generateSitemapEntry(url, options = {}) {
  const {
    changefreq = 'weekly',
    priority = 0.5,
    lastmod = new Date().toISOString()
  } = options;

  return {
    url: `${baseMetadata.siteUrl}${url}`,
    lastmod,
    changefreq,
    priority
  };
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt() {
  return `# ${baseMetadata.siteName} robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /superadmin/
Disallow: /_next/
Disallow: /private/

# Sitemap
Sitemap: ${baseMetadata.siteUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# User-agent specific rules
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /
`;
}

/**
 * SEO-friendly URL slug generator
 */
export function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text, limit = 10) {
  // Remove common words
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'you', 'your'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count frequency
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Generate meta tags as HTML string
 */
export function generateMetaTagsHtml(metadata) {
  const tags = [];

  // Basic meta tags
  tags.push(`<title>${metadata.title}</title>`);
  tags.push(`<meta name="description" content="${metadata.description}">`);
  tags.push(`<meta name="keywords" content="${metadata.keywords}">`);

  // Open Graph tags
  if (metadata.openGraph) {
    tags.push(`<meta property="og:title" content="${metadata.openGraph.title}">`);
    tags.push(`<meta property="og:description" content="${metadata.openGraph.description}">`);
    tags.push(`<meta property="og:url" content="${metadata.openGraph.url}">`);
    tags.push(`<meta property="og:site_name" content="${metadata.openGraph.siteName}">`);
    tags.push(`<meta property="og:type" content="${metadata.openGraph.type}">`);
    tags.push(`<meta property="og:locale" content="${metadata.openGraph.locale}">`);

    if (metadata.openGraph.images) {
      metadata.openGraph.images.forEach(image => {
        tags.push(`<meta property="og:image" content="${image.url}">`);
        tags.push(`<meta property="og:image:width" content="${image.width}">`);
        tags.push(`<meta property="og:image:height" content="${image.height}">`);
        tags.push(`<meta property="og:image:alt" content="${image.alt}">`);
      });
    }
  }

  // Twitter Card tags
  if (metadata.twitter) {
    tags.push(`<meta name="twitter:card" content="${metadata.twitter.card}">`);
    tags.push(`<meta name="twitter:title" content="${metadata.twitter.title}">`);
    tags.push(`<meta name="twitter:description" content="${metadata.twitter.description}">`);
    tags.push(`<meta name="twitter:site" content="${metadata.twitter.site}">`);
    tags.push(`<meta name="twitter:creator" content="${metadata.twitter.creator}">`);

    if (metadata.twitter.images) {
      tags.push(`<meta name="twitter:image" content="${metadata.twitter.images[0]}">`);
    }
  }

  // Canonical URL
  if (metadata.alternates?.canonical) {
    tags.push(`<link rel="canonical" href="${metadata.alternates.canonical}">`);
  }

  return tags.join('\n');
}

/**
 * Page-specific metadata generators
 */
export const pageMetadata = {
  home: () => generateMetadata({
    title: 'Music Distribution & Publishing Platform',
    description: 'Professional music distribution to Spotify, Apple Music, and all major streaming platforms. AI-powered analytics and career tools for independent artists.',
    keywords: ['music distribution', 'independent artist', 'streaming distribution', 'apollo ai']
  }),

  dashboard: (role) => generateMetadata({
    title: `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`,
    description: 'Manage your music releases, track analytics, and grow your career.',
    noindex: true
  }),

  apollo: () => generateMetadata({
    title: 'Apollo AI - Your Music Career Mentor',
    description: 'Get personalized music career guidance from Apollo, the most powerful AI mentor for artists. Featuring 1 billion+ tools covering the entire music industry.',
    keywords: ['music ai', 'career mentor', 'music industry tools', 'apollo ai']
  }),

  pricing: () => generateMetadata({
    title: 'Pricing - Affordable Music Distribution',
    description: 'Simple, transparent pricing for music distribution. Choose the plan that fits your career goals.',
    keywords: ['music distribution pricing', 'affordable distribution', 'artist plans']
  }),

  release: (release) => generateMetadata({
    title: release.title,
    description: `${release.title} by ${release.artist_name}. Distributed on all major streaming platforms.`,
    image: release.artwork_url,
    type: 'music.song',
    keywords: [release.artist_name, release.title, 'music', 'streaming']
  })
};
