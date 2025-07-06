import { userContext } from "@/components/contexts/userProvider";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { apiRoute } from "@/lib/utils";
import axios from "axios";
import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { Formik } from "formik";
import { useSession } from "next-auth/react";
import React, { use, useContext } from "react";

function MePage() {
  const user = useContext(userContext);
  const { data: userSession } = useSession();

  return (
    <MainLayout>
      <SEO pageTitle="Me" />
      <section className="py-8 md:py-28 max-w-lg mx-auto">
        <Formik
          enableReinitialize
          initialValues={{
            firstName: user?.firstName || "",
            lastName: user?.lastName,
          }}
          onSubmit={async (values) => {
            await axios.put(
              apiRoute(`/users/${user.id}`),
              {
                firstName: values.firstName,
                lastName: values.lastName,
              },
              {
                headers: {
                  Authorization: `Bearer ${userSession.jwt}`,
                },
              }
            );
          }}
        >
          {({ values, handleChange, handleSubmit, isSubmitting }) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="firstName" value="First name" />
                </div>
                <TextInput
                  id="firstName"
                  value={values.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="lastName" value="Last name" />
                </div>
                <TextInput
                  id="lastName"
                  value={values.lastName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-2">
                <Button
                  onClick={handleSubmit}
                  fullSized
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Spinner className="block !h-5 !w-5" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          )}
        </Formik>
      </section>
    </MainLayout>
  );
}

export default MePage;
