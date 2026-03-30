import ServicesSelection from "@/components/ServicesSelection";

export default async function ServicePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id;

    return (
        <div className="min-h-screen bg-[#FDFAF5] pt-24 pb-16">
            <div className="container mx-auto px-4 md:px-6">
                <ServicesSelection
                    initialServiceId={id}
                    lockServiceSelection
                    title="Select A Sacred Location"
                    subtitle="Choose a location, review the available packages, and continue to payment for your ritual booking."
                />
            </div>
        </div>
    );
}
