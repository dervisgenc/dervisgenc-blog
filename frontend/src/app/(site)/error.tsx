"use client";

import { CloudOff } from "lucide-react";

import { Notice } from "@/components/site/notice";
import { Button } from "@/components/ui/button";

export default function SiteError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <Notice icon={CloudOff} title="Something went wrong">
      <p>This page could not be loaded right now. Please try again in a minute.</p>
      <Button variant="secondary" size="sm" className="mt-6" onClick={retry}>
        Try again
      </Button>
    </Notice>
  );
}
