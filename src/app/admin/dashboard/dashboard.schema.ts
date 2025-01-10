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
    quiz: string;
    pass: number;
    attempts: number;
  }[];
  lessonCompletion: {
    lesson: string;
    users: number;
  }[];
};
