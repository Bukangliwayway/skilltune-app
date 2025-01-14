export type QuizPerformanceData = {
  bardisplay: string;
  tooltipdisplayquiz: string;
  attempts: number;
  passed: number;
};

export type QuizPerformanceProps = {
  data: QuizPerformanceData[];
};

export type LessonCompletionData = {
  lesson: string;
  users: number;
  totalUsers: number;
};

export type LessonCompletionProps = {
  data: LessonCompletionData[];
};

export type dashboard = {
  totalUsers: number;
  averageQuizScore: {
    pass: number;
    attempts: number;
  };
  totalActiveUsers: number;
  quizPerformance: {
    bardisplay: string;
    tooltipdisplayquiz: string;
    attempts: number;
    passed: number;
  }[];
  lessonCompletion: {
    lesson: string;
    users: number;
    totalUsers: number;
  }[];
};
