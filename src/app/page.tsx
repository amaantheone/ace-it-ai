import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import LandingClient from "./landing-client";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    redirect("/home");
  }
  return <LandingClient />;
}