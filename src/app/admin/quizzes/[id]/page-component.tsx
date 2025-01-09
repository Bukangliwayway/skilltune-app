import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQuizById } from "@/actions/quizzes";
import type { QuizDisplay } from "../quizzes.types";

export async function QuizDetailView({ params }: { params: { id: string } }) {
  const quizData = await getQuizById(Number(params.id));
  const quiz = quizData[0] as QuizDisplay;

  if (!quiz) {
    return <div className="text-center p-4">Quiz not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-gray-600">{quiz.description}</p>
      </div>

      <div className="space-y-8">
        {quiz.quiz_cards.map((card) => (
          <Card key={card.id} className="w-full">
            <CardHeader>
              <CardTitle className="text-xl">{card.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {card.choices.map((choice) => (
                  <div
                    key={choice.id}
                    className={`p-4 rounded-lg border ${
                      card.correct_choice_id === choice.id
                        ? "bg-green-600 text-white"
                        : "bg-white hover:bg-gray-50"
                    } cursor-pointer transition-colors duration-200`}
                  >
                    <p className="text-lg">{choice.choice}</p>
                  </div>
                ))}
              </div>
              {card.explanation && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{card.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
