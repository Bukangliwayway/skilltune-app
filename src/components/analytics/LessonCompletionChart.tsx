"use client";

import { BookCheck, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
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
import { LessonCompletionProps } from "@/app/admin/dashboard/dashboard.schema";

const chartData = [
  { lesson: "Lesson 1", users: 186, totalUsers: 400 },
  { lesson: "Lesson 2", users: 305, totalUsers: 400 },
  { lesson: "Lesson 3", users: 237, totalUsers: 400 },
  { lesson: "Lesson 4", users: 153, totalUsers: 400 },
  { lesson: "Lesson 5", users: 209, totalUsers: 400 },
  { lesson: "Lesson 6", users: 214, totalUsers: 400 },
  { lesson: "Lesson 7", users: 186, totalUsers: 400 },
  { lesson: "Lesson 8", users: 305, totalUsers: 400 },
  { lesson: "Lesson 9", users: 237, totalUsers: 400 },
  { lesson: "Lesson 10", users: 123, totalUsers: 400 },
  { lesson: "Lesson 11", users: 209, totalUsers: 400 },
  { lesson: "Lesson 12", users: 214, totalUsers: 400 },
];

const chartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

export function LessonCompletion({ data }: LessonCompletionProps) {
  const averageCompletion =
    (data.reduce((acc, curr) => acc + curr.users / curr.totalUsers, 0) /
      data.length) *
    100;

  const totalEnrolledStudents = data[0].totalUsers;
  const averageStudentsPerLesson = Math.round(
    data.reduce((acc, curr) => acc + curr.users, 0) / data.length
  );
  const completionRate =
    (data.reduce((acc, curr) => acc + curr.users / curr.totalUsers, 0) /
      data.length) *
    100;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Lesson Completion Overview</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart
            accessibilityLayer
            data={data ?? chartData}
            layout="vertical"
            margin={{
              right: 60,
              top: 0,
              bottom: 0,
            }}
            height={450}
            width={800}
            barSize={20}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="lesson"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="users" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="users"
              layout="vertical"
              fill="var(--color-users)"
              radius={4}
            >
              <LabelList
                dataKey="lesson"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="users"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Average Lesson Completion Rate {averageCompletion.toFixed(1)}%{" "}
          <BookCheck className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground flex flex-col gap-1">
          <span>
            We currently have {totalEnrolledStudents.toLocaleString()} students
            enrolled in the course. On average{" "}
            {averageStudentsPerLesson.toLocaleString()} students complete each
            lesson
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
