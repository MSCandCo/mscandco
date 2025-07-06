import { useRouter } from "next/router";
import React, { useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { getCsrfToken, signIn } from "next-auth/react";
import Header from "@/components/header";
import Container from "@/components/container";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { Button, Label, TextInput } from "flowbite-react";
import Link from "next/link";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";

function LoginPage({ csrfToken }) {
  const [error, setError] = useState();
  const [feedback, setFeedback] = useState();
  const router = useRouter();

  return (
    <MainLayout>
      <SEO pageTitle="Login" />
      <section className="py-8 md:py-28">
        <Container className="!max-w-md">
          <p className="text-2xl font-bold pb-12 text-center">Login</p>
          <form
            className="flex flex-col gap-4"
            method="post"
            action="/api/auth/callback/credentials"
          >
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

            <div>
              <div className="mb-2 block">
                <Label htmlFor="username" value="Email" />
              </div>
              <TextInput
                name="username"
                id="username"
                type="email"
                placeholder="name@mail.com"
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="Password" />
              </div>
              <TextInput id="password" name="password" type="password" />
            </div>

            <Button type="submit">Login</Button>
          </form>
          <div className="border-t border-gray-200 my-6"></div>

          <SocialLogins />

          <p className="mt-8 text-center">
            Do not have an account?{" "}
            <Link href="/register" className="underline">
              Register
            </Link>
          </p>
        </Container>
      </section>
    </MainLayout>
  );
}

export const SocialLogins = ({ action = "Login" }) => (
  <div className="flex gap-2 flex-col">
    <button
      className="bg-white py-2 px-4 border border-gray-200 rounded flex gap-4 justify-center items-center font-semibold"
      onClick={() => signIn("google")}
    >
      <FaGoogle className="h-6 w-6" />
      {action} with Google
    </button>
    <button
      className=" bg-white py-2 px-4 border border-gray-200 rounded flex gap-4 justify-center items-center font-semibold"
      onClick={() => signIn("facebook")}
    >
      <FaFacebook className="h-6 w-6" />
      {action} with Facebook
    </button>
  </div>
);

export default LoginPage;

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }

  return {
    props: {
      csrfToken: (await getCsrfToken(context)) || null,
    },
  };
}
