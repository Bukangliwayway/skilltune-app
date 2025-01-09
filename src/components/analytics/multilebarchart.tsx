"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { bardisplay: "1", tooltipdisplayquiz: "Quiz 1", attempts: 186, passed: 80 },
  { bardisplay: "2", tooltipdisplayquiz: "Quiz 2", attempts: 305, passed: 200 },
  { bardisplay: "3", tooltipdisplayquiz: "Quiz 3", attempts: 237, passed: 120 },
  { bardisplay: "4", tooltipdisplayquiz: "Quiz 4", attempts: 230, passed: 190 },
  { bardisplay: "5", tooltipdisplayquiz: "Quiz 5", attempts: 209, passed: 130 },
  { bardisplay: "6", tooltipdisplayquiz: "Quiz 6", attempts: 214, passed: 140 },
  { bardisplay: "7", tooltipdisplayquiz: "Quiz 7", attempts: 186, passed: 80 },
  { bardisplay: "8", tooltipdisplayquiz: "Quiz 8", attempts: 305, passed: 200 },
  { bardisplay: "9", tooltipdisplayquiz: "Quiz 9", attempts: 237, passed: 120 },
  {
    bardisplay: "10",
    tooltipdisplayquiz: "Quiz 10",
    attempts: 273,
    passed: 190,
  },
  {
    bardisplay: "11",
    tooltipdisplayquiz: "Quiz 11",
    attempts: 209,
    passed: 130,
  },
  {
    bardisplay: "12",
    tooltipdisplayquiz: "Quiz 12",
    attempts: 214,
    passed: 140,
  },
];

const chartConfig = {
  attempts: {
    label: "attempts",
    color: "hsl(var(--chart-1))",
  },
  passed: {
    label: "passed",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function MultipleBarChart() {
  return (
    <Card className="col-span-2 h-full">
      <CardHeader>
        <CardTitle>Quiz Performance</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                bottom: 20,
                left: 30,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="bardisplay"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={(props) => {
                  const { active, payload } = props;
                  if (!active || !payload?.length) return null;

                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Quiz:</span>
                          <span>{payload[0].payload.tooltipdisplayquiz}</span>
                        </div>
                        {payload.map((entry) => (
                          <div
                            key={entry.name}
                            className="flex items-center gap-2"
                          >
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="font-medium">{entry.name}:</span>
                            <span>{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />

              <Bar
                dataKey="attempts"
                fill="var(--color-attempts)"
                radius={4}
                barSize={20}
              />
              <Bar
                dataKey="passed"
                fill="var(--color-passed)"
                radius={4}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this quiz <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 quizs
        </div>
      </CardFooter>
    </Card>
  );
}

export default MultipleBarChart;
