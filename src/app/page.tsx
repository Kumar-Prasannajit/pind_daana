import Hero from "@/components/Hero";
import AboutManima from "@/components/AboutManima";
import HomeFeaturedOfferings from "@/components/HomeFeaturedOfferings";
import ProcessFlow from "@/components/ProcessFlow";
import WhyChooseUs from "@/components/WhyChooseUs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

async function verifyToken(token: string, secret: string) {
  try {
    const secretKey = new TextEncoder().encode(secret);
    await jwtVerify(token, secretKey);
    return true;
  } catch (error) {
    return false;
  }
}

export default async function Home() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token")?.value;
  const agentToken = cookieStore.get("token")?.value;
  const clientToken = cookieStore.get("client_token")?.value;

  // Verify Admin Token
  if (adminToken) {
    const isValid = await verifyToken(adminToken, process.env.JWT_SECRET || "your-secret-key");
    if (isValid) redirect("/admin/dashboard");
  }

  // Verify Agent Token
  if (agentToken) {
    const isValid = await verifyToken(agentToken, process.env.JWT_SECRET || "your-secret-key");
    if (isValid) redirect("/agent/dashboard");
  }

  // Verify Client Token
  if (clientToken) {
    const isValid = await verifyToken(clientToken, process.env.JWT_SECRET || "default_secret");
    if (isValid) redirect("/client/dashboard");
  }

  return (
    <>
      <Hero />
      <HomeFeaturedOfferings />
      <AboutManima />
      <ProcessFlow />
      <WhyChooseUs />
    </>
  );
}
