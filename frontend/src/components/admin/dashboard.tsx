"use client";

import { Eye, FileText, Heart, Plus, Share2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { buttonClasses } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { admin } from "@/lib/browser-api";
import { formatCount, plural } from "@/lib/format";

import { Segmented } from "./segmented";
import { StatCard } from "./stat-card";
import { TopPostsTable } from "./top-posts-table";
import { TrendChart } from "./trend-chart";
import { useAdminQuery } from "./use-admin-query";

const RANGES = [
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
];

export function Dashboard() {
  const [days, setDays] = useState(30);
  const summary = useAdminQuery("summary", () => admin.statsSummary());
  const daily = useAdminQuery(`daily-${days}`, () => admin.dailyStats(days));
  const top = useAdminQuery(`top-${days}`, () => admin.topPosts(days, 10));
  const s = summary.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {s
              ? `${plural(s.posts_published, "published post")} · ${plural(s.posts_draft, "draft")}`
              : "Loading overview…"}
          </p>
        </div>
        <Link href="/admin/posts/new" className={buttonClasses("primary", "md")}>
          <Plus className="size-4" aria-hidden /> New post
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total views" value={s?.total_views} icon={Eye} detail={s && `${formatCount(s.views_today)} today`} />
        <StatCard
          label="Visitors (30 days)"
          value={s?.visitors_30d}
          icon={Users}
          detail={s && `${formatCount(s.visitors_today)} today · ${formatCount(s.views_30d)} views`}
        />
        <StatCard label="Likes" value={s?.total_likes} icon={Heart} />
        <StatCard label="Shares" value={s?.total_shares} icon={Share2} />
      </div>

      <Card>
        <CardHeader
          title="Traffic"
          action={<Segmented label="Date range" value={days} options={RANGES} onChange={setDays} />}
        />
        <div className="p-4">
          {daily.data ? (
            <TrendChart
              data={daily.data}
              series={[
                { key: "views", label: "Views", color: "#14b8a6" },
                { key: "visitors", label: "Visitors", color: "#a1a1aa" },
              ]}
            />
          ) : (
            <div className="h-[280px] animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title={`Top posts · last ${days} days`}
          action={
            <Link href="/admin/posts" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              <FileText className="size-3.5" aria-hidden /> All posts
            </Link>
          }
        />
        {top.data ? (
          <TopPostsTable posts={top.data} />
        ) : (
          <div className="m-5 h-32 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
        )}
      </Card>
    </div>
  );
}
