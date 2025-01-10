"use client";

import React, { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, Users } from "lucide-react";
import QuizPerformance from "./QuizPerformanceChart";
import { LessonCompletion } from "./LessonCompletionChart";
import { dashboard } from "@/app/admin/dashboard/dashboard.schema";

type Props = {
  dashboard: dashboard;
};

const MainDashboard: FC<Props> = ({ dashboard }) => {
  return (
    <div className="p-8 pt-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Learning Analytics Dashboard
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Number of Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.totalUsers ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total number of users registered on the platform
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.totalActiveUsers ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Number of users who have completed at least one lesson in the past
              30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Quiz Score
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                ((dashboard.averageQuizScore?.pass ?? 0) /
                  (dashboard.averageQuizScore?.attempts ?? 1)) *
                100
              ).toFixed(2)}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Average score of all quizzes attempted from{" "}
              {dashboard.averageQuizScore?.pass ?? 0} passes out of{" "}
              {dashboard.averageQuizScore?.attempts ?? 0} attempts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <QuizPerformance data={dashboard.quizPerformance} />
        <LessonCompletion data={dashboard.lessonCompletion} />
      </div>
    </div>
  );
};
export default MainDashboard;
