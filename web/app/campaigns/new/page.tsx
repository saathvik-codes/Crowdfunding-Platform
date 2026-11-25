"use client";
import CampaignForm from "@/components/CampaignForm";
import { useGuard } from "@/components/ui";

export default function NewCampaign() {
  const { ready } = useGuard({ role: ["entrepreneur"] });
  return ready ? <CampaignForm /> : null;
}
