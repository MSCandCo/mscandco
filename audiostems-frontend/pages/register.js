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
} from "lucide-react";
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
      <SEO pageTitle="Artist Registration - AudioStems" />
      <section className="py-8 md:py-20">
        <Container className="!max-w-md">
          <div className="space-y-0.5">
            <p className="text-2xl font-bold">
              Distribute <span className="text-gray-300">Your Music.</span>
            </p>
            <p className="text-2xl font-bold">
              Reach <span className="text-gray-300">Global Audiences.</span>
            </p>
            <p className="text-2xl font-bold">
              Earn <span className="text-gray-300">Royalties.</span>
            </p>
          </div>

          <p className="py-6">Join AudioStems as an artist. Start your music distribution journey today.</p>
          {error && (
            <Alert color="failure" className="mb-6" icon={HiInformationCircle}>
              <span>
                <span className="font-semibold">Registration Error: </span>
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
                console.log("Submitting artist registration with values:", values);
                console.log("API URL:", `${process.env.NEXT_PUBLIC_STRAPI}/api/auth/local/register`);
                
                const response = await axios.post(
                  `${process.env.NEXT_PUBLIC_STRAPI}/api/auth/local/register`,
                  {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    username: values.email,
                    email: values.email,
                    password: values.password,
                  }
                );
                
                console.log("Artist registration successful:", response.data);
                setError("");
                
                if (response.data.nextStep === 'email_verification') {
                  // Store email for verification process
                  localStorage.setItem('registrationEmail', values.email);
                  localStorage.setItem('userData', JSON.stringify(response.data.user));
                  
                  setFeedback("Registration successful! Please check your email for verification code.");
                  setTimeout(() => {
                    router.push(`/verify-email?email=${values.email}`);
                  }, 2000);
                } else {
                  setFeedback(
                    "Your artist account was created successfully! Please check your email for a verification link to complete your registration."
                  );
                }
              } catch (error) {
                console.error("Artist registration error:", error);
                console.error("Error response:", error.response);
                
                let errorMessage = "Something went wrong";
                
                if (error.response?.data?.error?.details?.errors) {
                  // Strapi validation errors
                  const validationErrors = error.response.data.error.details.errors;
                  errorMessage = validationErrors.map(err => err.message).join(", ");
                } else if (error.response?.data?.error?.message) {
                  // Strapi general error
                  errorMessage = error.response.data.error.message;
                } else if (error.response?.data?.message) {
                  // Other API errors
                  errorMessage = error.response.data.message;
                } else if (error.message) {
                  // Network or other errors
                  errorMessage = error.message;
                }
                
                setError(errorMessage);
              }
            }}
            validate={(values) => {
              const errors = {};
              if (!values.firstName)
                errors.firstName = "Please enter your First name";
              if (!values.lastName)
                errors.lastName = "Please enter your Last name";
              if (!values.email) {
                errors.email = "Please enter your Email";
              } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
                errors.email = "Please enter a valid email address";
              }
              if (!values.password) {
                errors.password = "Please enter a Password";
              } else if (values.password.length < 6) {
                errors.password = "Password should be at least 6 characters";
              }
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
                      helperText={touched.lastName && errors.lastName}
                      color={touched.lastName && errors.lastName && "failure"}
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
                    placeholder="artist@example.com"
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
                    placeholder="••••••••"
                    onChange={handleChange}
                    value={values.password}
                    helperText={touched.password && errors.password}
                    color={touched.password && errors.password && "failure"}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    "Join as Artist"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-800">
                      Sign in
                    </Link>
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <SocialLogins />
              </form>
            )}
          </Formik>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What you'll get as an AudioStems artist:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Global music distribution to all major platforms</li>
              <li>• Professional publishing and royalty collection</li>
              <li>• Detailed analytics and performance insights</li>
              <li>• Direct support from our music industry experts</li>
              <li>• Keep 100% of your rights and ownership</li>
            </ul>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
