import Hero from "@/components/Hero";
import dynamic from "next/dynamic";
import AboutManima from "@/components/AboutManima";

const Services = dynamic(() => import("@/components/Services"), {
  loading: () => (
    <section id="Services" className="bg-[#FDFAF0] relative py-12 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse"></div>
          <div className="h-1 w-12 bg-gray-200 mx-auto mt-2 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="block h-64 w-full rounded-[2rem] bg-gray-200 shadow-md" />
            ))}
        </div>
      </div>
    </section>
  )
});
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
      <AboutManima />
      <Services />
      <ProcessFlow />
      <WhyChooseUs />
    </>
  );
}
