import Container from "@/components/container";
import Header from "@/components/header";
import MainLayout from "@/components/layouts/mainLayout";
import { Button } from "flowbite-react";
import Link from "next/link";
import React from "react";
import { HiCheckBadge, HiCheckCircle } from "lucide-react";

function SuccessPage() {
  return (
    <MainLayout>
      <Container>
        <div className="pt-24 pb-16">
          <div className="flex flex-col items-center gap-4">
            <HiCheckCircle className="h-24 w-24 text-emerald-700" />
            <h1 className="text-4xl font-bold text-center">Success</h1>
            <p className="text-xl max-w-sm text-center text-gray-600">
              We have activated your Plan. You can continue browsing Audiostems.
            </p>
            <Button>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}

export default SuccessPage;
