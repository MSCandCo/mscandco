import Head from 'next/head';

const SEO = ({ pageTitle, description = "MSC & Co - Multi-brand music distribution and publishing platform" }) => {
  return (
    <Head>
      <title>{pageTitle ? `${pageTitle} | MSC & Co` : 'MSC & Co'}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default SEO;
