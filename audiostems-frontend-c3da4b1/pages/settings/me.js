import { useUser } from '@/components/providers/SupabaseProvider';
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { apiRoute } from "@/lib/utils";
import axios from "axios";
import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { Formik } from "formik";
import React from "react";

function MePage() {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;

  return (
    <MainLayout>
      <SEO pageTitle="Me" />
      <section className="py-8 md:py-28 max-w-lg mx-auto">
        <Formik
          enableReinitialize
          initialValues={{
            firstName: user?.given_name || "",
            lastName: user?.family_name || "",
          }}
          onSubmit={async (values) => {
            const token = await getAccessTokenSilently();
            await axios.put(
              apiRoute(`/users/${user?.sub}`),
              {
                firstName: values.firstName,
                lastName: values.lastName,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
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
