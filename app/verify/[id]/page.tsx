import { redirect } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default function BatchVerificationRoute({ params }: PageProps) {
  // Seamlessly redirect clean URL /verify/YUCA-XXXX to /verify?id=YUCA-XXXX
  redirect(`/verify?id=${encodeURIComponent(params.id)}`);
}
