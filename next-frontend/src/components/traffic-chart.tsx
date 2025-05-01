"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DailyTrafficStat } from '@/types';
import { useTheme } from "next-themes"; // Import useTheme

interface TrafficChartProps {
    data: DailyTrafficStat[];
    isLoading: boolean;
}

// Custom Tooltip Formatter
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Date
                        </span>
                        <span className="font-bold text-muted-foreground">
                            {label}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Views
                        </span>
                        <span className="font-bold" style={{ color: 'hsl(var(--chart-1))' }}>
                            {payload[0].value}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Visitors
                        </span>
                        <span className="font-bold" style={{ color: 'hsl(var(--chart-2))' }}>
                            {payload[1].value}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};


export default function TrafficChart({ data, isLoading }: TrafficChartProps) {
    const { theme } = useTheme(); // Get current theme

    // Define colors based on theme - adjust HSL values as needed
    const colors = {
        light: {
            views: 'hsl(183 93% 35%)', // Cyan-like
            visitors: 'hsl(221 83% 53%)', // Blue-like
            grid: 'hsl(214.3 31.8% 91.4%)', // zinc-200
            text: 'hsl(215.4 16.3% 46.9%)', // zinc-500
            tooltipBg: 'hsl(0 0% 100%)', // white
            tooltipBorder: 'hsl(214.3 31.8% 91.4%)', // zinc-200
        },
        dark: {
            views: 'hsl(183 93% 45%)', // Brighter Cyan-like
            visitors: 'hsl(221 83% 63%)', // Brighter Blue-like
            grid: 'hsl(215 20.2% 30%)', // zinc-800 adjusted
            text: 'hsl(215 20.2% 65.1%)', // zinc-400
            tooltipBg: 'hsl(224 71% 4%)', // zinc-950
            tooltipBorder: 'hsl(215 20.2% 30%)', // zinc-800 adjusted
        },
    };

    const currentColors = theme === 'dark' ? colors.dark : colors.light;

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No traffic data available for the selected period.
            </div>
        );
    }

    // Format date for XAxis tick
    const formatDateTick = (dateStr: string) => {
        const date = new Date(dateStr);
        // Show Month/Day, e.g., 1/23
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{
                    top: 5,
                    right: 10, // Add some right margin
                    left: -15, // Adjust left margin to pull Y-axis closer
                    bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke={currentColors.grid} vertical={false} />
                <XAxis
                    dataKey="date"
                    stroke={currentColors.text}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatDateTick}
                    // interval="preserveStartEnd" // Show first and last tick
                    // minTickGap={30} // Adjust gap between ticks
                    tick={{ dy: 10 }} // Move ticks down slightly
                />
                <YAxis
                    stroke={currentColors.text}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    width={30} // Reduce width allocated for Y-axis labels
                />
                <Tooltip
                    cursor={false}
                    content={<CustomTooltip />}
                    contentStyle={{
                        backgroundColor: currentColors.tooltipBg,
                        borderColor: currentColors.tooltipBorder,
                        borderRadius: '0.5rem', // Match shadcn border radius
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // Match shadcn shadow-sm
                    }}
                />
                <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ top: -5, right: 10 }} // Adjust legend position
                    formatter={(value, entry) => (
                        <span style={{ color: currentColors.text }}>{value}</span>
                    )}
                />
                <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={currentColors.views} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={currentColors.views} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={currentColors.visitors} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={currentColors.visitors} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="views"
                    stroke={currentColors.views}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                    strokeWidth={2}
                    name="Views" // Name for Legend and Tooltip
                    dot={false}
                />
                <Area
                    type="monotone"
                    dataKey="unique_visitors"
                    stroke={currentColors.visitors}
                    fillOpacity={1}
                    fill="url(#colorVisitors)"
                    strokeWidth={2}
                    name="Unique Visitors" // Name for Legend and Tooltip
                    dot={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
