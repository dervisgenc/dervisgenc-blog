"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatDay } from "@/lib/format";

export interface Series<K extends string> {
  key: K;
  label: string;
  color: string;
}

interface TrendChartProps<K extends string> {
  data: Array<{ day: string } & Record<K, number>>;
  series: Series<K>[];
  height?: number;
}

/** Daily time series as overlaid areas, used for site and per-post traffic. */
export function TrendChart<K extends string>({ data, series, height = 280 }: TrendChartProps<K>) {
  // Gradient ids must be unique per chart instance.
  const chartId = useId();
  const gradientId = (key: string) => `${chartId}-fill-${key}`;

  return (
    <div className="space-y-2">
      <ul className="flex flex-wrap justify-end gap-x-4 gap-y-1 px-2 text-xs text-zinc-500 dark:text-zinc-400">
        {series.map((item) => (
          <li key={item.key} className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
            {item.label}
          </li>
        ))}
      </ul>
      <div style={{ height }} className="w-full text-zinc-500 dark:text-zinc-400">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              {series.map((item) => (
                <linearGradient key={item.key} id={gradientId(item.key)} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={item.color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={item.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.15} vertical={false} />
            <XAxis
              dataKey="day"
              tickFormatter={formatDay}
              tick={{ fill: "currentColor", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis allowDecimals={false} tick={{ fill: "currentColor", fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              labelFormatter={(label) => formatDay(String(label))}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid rgb(161 161 170 / 0.3)",
                background: "var(--tooltip-bg)",
                color: "var(--tooltip-fg)",
                fontSize: 12,
              }}
            />
            {series.map((item) => (
              <Area
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={2}
                fill={`url(#${gradientId(item.key)})`}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
