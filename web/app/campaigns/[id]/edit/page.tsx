"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CampaignForm from "@/components/CampaignForm";
import { Notice, useGuard } from "@/components/ui";
import { api, type Campaign } from "@/lib/api";

export default function EditCampaign() {
  const { id } = useParams<{ id: string }>();
  const { ready, user } = useGuard({ role: ["entrepreneur"] });
  const [c, setC] = useState<Campaign | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ campaign: Campaign }>(`/campaigns/${id}`, { auth: false }).then((r) => setC(r.campaign)).catch((e) => setError(e.message));
  }, [id]);
  if (!ready) return null;
  if (error) return <Notice kind="error">{error}</Notice>;
  if (!c) return null;
  if (c.creator_id !== user?.id) return <Notice kind="error">Only the creator can edit this campaign.</Notice>;
  return <CampaignForm existing={c} />;
}
