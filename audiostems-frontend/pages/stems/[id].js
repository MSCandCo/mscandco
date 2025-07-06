import Header from "@/components/header";
import MainLayout from "@/components/layouts/mainLayout";
import { MultiPlayer } from "@/components/multiPlayer";
import SEO from "@/components/seo";
import { apiRoute, resourceUrl } from "@/lib/utils";
import axios from "axios";
import React from "react";

function SingleStem({ stem }) {
  console.log(stem);
  return (
    <MainLayout>
      <SEO pageTitle={stem.attributes.title} />
      <div>
        <MultiPlayer stem={stem} />
      </div>
    </MainLayout>
  );
}

export default SingleStem;

export async function getServerSideProps(context) {
  const { id } = context.params;
  const { data } = await axios.get(apiRoute(`/stems/${id}?populate=deep`));

  return {
    props: {
      stem: data.data,
    },
  };
}
