"use client";

import { Award, TrendingUp } from "lucide-react";
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
import { QuizPerformanceProps } from "@/app/admin/dashboard/dashboard.schema";

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

export function QuizPerformance({ data }: QuizPerformanceProps) {
  const averagePassingRate = data.reduce(
    (acc, curr) => ({
      totalPassed: acc.totalPassed + curr.passed,
      totalAttempts: acc.totalAttempts + curr.attempts,
    }),
    { totalPassed: 0, totalAttempts: 0 }
  );

  const passingRatePercentage =
    averagePassingRate.totalAttempts > 0
      ? (averagePassingRate.totalPassed / averagePassingRate.totalAttempts) *
        100
      : 0;
  return (
    <Card className="col-span-2 h-full">
      <CardHeader>
        <CardTitle>Quiz Performance</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer
              data={data}
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
          Overall Quiz Performance Rate {passingRatePercentage.toFixed(1)}%{" "}
          <Award className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Analysis based on {data.length} quiz submissions
        </div>
      </CardFooter>
    </Card>
  );
}

export default QuizPerformance;
