import Head from "next/head";
import React from "react";

const siteTitle = "Audiostems";
const titleSeparator = "|";

function SEO({ pageTitle }) {
  return (
    <Head>
      <title>
        {pageTitle ? `${pageTitle} ${titleSeparator} ${siteTitle}` : siteTitle}
      </title>
    </Head>
  );
}

export default SEO;
