import Container from "@/components/container";
import Header from "@/components/header";
import axios from "axios";
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  HiCheck,
  HiExclamationCircle,
  HiInformationCircle,
} from "react-icons/hi2";
import { SocialLogins } from "./login";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

export default function Home() {
  const [error, setError] = useState();
  const [feedback, setFeedback] = useState();
  const router = useRouter();

  return (
    <MainLayout>
      <SEO pageTitle="Register" />
      <section className="py-8 md:py-20">
        <Container className="!max-w-md">
          <div className="space-y-0.5">
            <p className="text-2xl font-bold">
              Listen <span className="text-gray-300">to Full Songs.</span>
            </p>
            <p className="text-2xl font-bold">
              Download <span className="text-gray-300">Temp Tracks.</span>
            </p>
            <p className="text-2xl font-bold">
              Create <span className="text-gray-300">Projects.</span>
            </p>
          </div>

          <p className="py-6">Start a free account. No credit card needed.</p>
          {error && (
            <Alert color="failure" className="mb-6" icon={HiInformationCircle}>
              <span>
                <span className="font-semibold">Failure: </span>
                {error}
              </span>
            </Alert>
          )}

          {feedback && (
            <Alert color="success" className="mb-6" icon={HiCheck}>
              <span>{feedback}</span>
            </Alert>
          )}

          <Formik
            onSubmit={async (values) => {
              try {
                await axios.post(
                  `${process.env.NEXT_PUBLIC_STRAPI}/api/auth/local/register`,
                  {
                    firstName: values.firstName,
                    username: values.email,
                    email: values.email,
                    password: values.password,
                  }
                );
                setError("");
                setFeedback(
                  "Your account was created. You'll be redirected to Login page."
                );
                setTimeout(() => {
                  router.push("/login");
                }, 4000);
              } catch (error) {
                setError(
                  (error?.response?.data?.error?.details?.errors || [])[0]
                    ?.message ||
                    error?.response?.data?.error?.message ||
                    "Something went wrong"
                );
              }
            }}
            validate={(values) => {
              const errors = {};
              if (!values.firstName)
                errors.firstName = "Please enter your First name";
              if (!values.email) errors.email = "Please enter your Email";
              if (!values.password) errors.password = "Please enter a Password";
              if (values.password && values.password.length < 6)
                errors.password = "Password should be at least 6 characters";
              return errors;
            }}
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              password: "",
            }}
          >
            {({
              values,
              handleChange,
              handleSubmit,
              touched,
              errors,
              isSubmitting,
            }) => (
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="firstName" value="First name" />
                    </div>
                    <TextInput
                      id="firstName"
                      type="text"
                      placeholder="John"
                      onChange={handleChange}
                      value={values.firstName}
                      helperText={touched.firstName && errors.firstName}
                      color={touched.firstName && errors.firstName && "failure"}
                    />
                  </div>
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="lastName" value="Last name" />
                    </div>
                    <TextInput
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      onChange={handleChange}
                      value={values.lastName}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="email" value="Email" />
                  </div>
                  <TextInput
                    id="email"
                    type="email"
                    placeholder="name@mail.com"
                    onChange={handleChange}
                    value={values.email}
                    helperText={touched.email && errors.email}
                    color={touched.email && errors.email && "failure"}
                  />
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="password" value="Password" />
                  </div>
                  <TextInput
                    id="password"
                    type="password"
                    onChange={handleChange}
                    value={values.password}
                    helperText={touched.password && errors.password}
                    color={touched.password && errors.password && "failure"}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner aria-label="Form submitting" />}
                  <span className={isSubmitting && "pl-3"}>Register</span>
                </Button>
              </form>
            )}
          </Formik>
          <div className="border-t border-gray-200 my-6"></div>
          <SocialLogins action="Register" />
          <p className="mt-8 text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </p>
        </Container>
      </section>
    </MainLayout>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }

  return {
    props: {},
  };
}
