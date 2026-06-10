import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";

export interface StackedBarChartData {
  date: string;
  campaigns: {
    [campaignName: string]: number;
  };
}

export interface StackedBarChartProps {
  data: StackedBarChartData[];
  height?: string | number;
  className?: string;
}

export function MessageStackedBarChart({
  data,
  height = 400,
  className = "",
}: StackedBarChartProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const campaignNames =
    data.length > 0
      ? Array.from(new Set(data.flatMap((d) => Object.keys(d.campaigns))))
      : [];

  const dates = data.map((d) => d.date);

  // Build alternating month backgrounds (each stripe covers only its own month's weeks)
  const monthGroups: { start: string; end: string }[] = [];
  let prevMonth = -1;
  let monthStart = "";
  let prevDate = "";
  for (const date of dates) {
    const d = new Date(`${date.slice(0, 10)}T12:00:00`);
    const monthKey = d.getFullYear() * 12 + d.getMonth();
    if (monthKey !== prevMonth) {
      if (prevMonth !== -1 && monthStart) {
        monthGroups.push({ start: monthStart, end: prevDate });
      }
      monthStart = date;
      prevMonth = monthKey;
    }
    prevDate = date;
  }
  if (monthStart) {
    monthGroups.push({ start: monthStart, end: prevDate });
  }

  const markAreas = monthGroups.map((group, i) => [
    {
      xAxis: group.start,
      itemStyle: {
        color: i % 2 === 0
          ? (isDarkMode ? "rgba(55, 65, 81, 0.25)" : "rgba(243, 244, 246, 0.6)")
          : "transparent",
      },
      label: { show: false },
    },
    { xAxis: group.end },
  ]);

  const series = campaignNames.map((campaignName, seriesIndex) => ({
    name: campaignName,
    type: "bar" as const,
    stack: "total",
    data: data.map((d) => d.campaigns[campaignName] || 0),
    emphasis: {
      focus: "series" as const,
    },
    markArea: seriesIndex === 0 ? { data: markAreas as never, silent: true } : undefined,
  }));

  const colors = isDarkMode
    ? ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb923c", "#22d3ee", "#e879f9"]
    : ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#f97316", "#06b6d4", "#d946ef"];

  const option: EChartsOption = {
    color: colors,
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      borderColor: isDarkMode ? "#374151" : "#e5e7eb",
      textStyle: {
        color: isDarkMode ? "#f9fafb" : "#111827",
      },
      formatter: (params: unknown) => {
        const items = params as Array<{
          seriesName: string;
          value: number;
          marker: string;
          axisValue: string;
        }>;
        if (!items || !items.length) return "";
        const total = items.reduce((sum, item) => sum + item.value, 0);
        // Build week range for tooltip
        const rawDate = items[0].axisValue;
        const start = new Date(`${rawDate.slice(0, 10)}T12:00:00`);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        const weekLabel = `${String(start.getDate()).padStart(2, "0")}/${String(start.getMonth() + 1).padStart(2, "0")} - ${String(end.getDate()).padStart(2, "0")}/${String(end.getMonth() + 1).padStart(2, "0")}`;
        let html = `<div class="font-medium mb-1">${weekLabel}</div>`;
        for (const item of items) {
          if (item.value > 0) {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
            html += `<div class="flex justify-between gap-4">
              ${item.marker} ${item.seriesName}
              <span class="font-medium">${item.value} (${pct}%)</span>
            </div>`;
          }
        }
        html += `<div class="flex justify-between gap-4 border-t pt-1 mt-1 font-bold">
          Total: ${total}
        </div>`;
        return html;
      },
    },
    legend: {
      data: campaignNames,
      textStyle: {
        color: isDarkMode ? "#f9fafb" : "#111827",
      },
      top: 0,
      left: "center",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "18%",
      top: "25%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: dates,
        axisLine: {
          lineStyle: {
            color: isDarkMode ? "#4b5563" : "#d1d5db",
          },
        },
        axisLabel: {
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          rotate: 0,
          formatter: (value: string) => {
            const start = new Date(`${value.slice(0, 10)}T12:00:00`);
            return `${String(start.getDate()).padStart(2, "0")}/${String(start.getMonth() + 1).padStart(2, "0")}`;
          },
        },
        splitLine: {
          show: false,
        },
      },
      {
        type: "category",
        position: "top",
        data: dates,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          interval: 0,
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          fontWeight: "bold",
          fontSize: 13,
          formatter: (() => {
            // Precompute which index gets the centered month label
            const monthLabelAtIdx: Record<number, string> = {};
            if (dates.length > 0) {
              const buckets: { start: number; end: number; label: string }[] = [];
              let startIdx = 0;
              let prevKey = -1;
              dates.forEach((date, idx) => {
                const d = new Date(`${date.slice(0, 10)}T12:00:00`);
                const key = d.getFullYear() * 12 + d.getMonth();
                if (key !== prevKey && prevKey !== -1) {
                  buckets.push({ start: startIdx, end: idx - 1, label: "" });
                  startIdx = idx;
                }
                prevKey = key;
              });
              buckets.push({ start: startIdx, end: dates.length - 1, label: "" });
              // Build labels from bucket dates
              buckets.forEach((bucket) => {
                const d = new Date(`${dates[bucket.start].slice(0, 10)}T12:00:00`);
                bucket.label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
                const midIdx = Math.floor((bucket.start + bucket.end) / 2);
                monthLabelAtIdx[midIdx] = bucket.label;
              });
            }
            return (_value: string, index: number) => monthLabelAtIdx[index] ?? "";
          })(),
        },
        splitLine: {
          show: false,
        },
      },
    ],
    yAxis: {
      type: "value",
      min: 0,
      axisLine: {
        lineStyle: {
          color: isDarkMode ? "#4b5563" : "#d1d5db",
        },
      },
      axisLabel: {
        color: isDarkMode ? "#9ca3af" : "#6b7280",
      },
      splitLine: {
        lineStyle: {
          color: isDarkMode ? "#374151" : "#f3f4f6",
        },
      },
    },
    series,
  };

  return (
    <div className={className}>
      <ReactECharts
        option={option}
        style={{ height, width: "100%" }}
        opts={{ renderer: "canvas" }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
}
