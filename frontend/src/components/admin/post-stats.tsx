"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { admin } from "@/lib/browser-api";

import { TrendChart } from "./trend-chart";
import { useAdminQuery } from "./use-admin-query";

const DAYS = 30;

export function PostStats({ postId }: { postId: number }) {
  const { data } = useAdminQuery(`post-daily-${postId}`, () => admin.postDailyStats(postId, DAYS));

  return (
    <Card>
      <CardHeader title={`Last ${DAYS} days`} />
      <div className="p-3">
        {data ? (
          <TrendChart
            height={180}
            data={data}
            series={[
              { key: "views", label: "Views", color: "#14b8a6" },
              { key: "likes", label: "Likes", color: "#f43f5e" },
              { key: "shares", label: "Shares", color: "#a1a1aa" },
            ]}
          />
        ) : (
          <div className="h-[180px] animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
        )}
      </div>
    </Card>
  );
}
