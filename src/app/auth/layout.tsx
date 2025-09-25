import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CourseFlow - Authentication",
  description: "Login or Register to CourseFlow",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>{children}</>
  );
}

