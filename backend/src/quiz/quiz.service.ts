import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class QuizService {
  private groq: Groq;

  constructor(private prisma: PrismaService) {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  // ✅ Helper: delay (DRY)
  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ✅ Helper: calculate score (DRY)
  private calculateScore(questions: any[], answers: number[]) {
    let score = 0;

    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });

    const percentage = Math.round((score / questions.length) * 100);

    return { score, percentage };
  }

  // ✅ Helper: validate AI questions
  private validateQuestions(questions: any[]) {
    return questions
      .map((q) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
          return null;
        }

        const answerIndex = typeof q.answer === 'number' ? q.answer : 0;

        if (answerIndex < 0 || answerIndex > 3) return null;

        return {
          question: String(q.question).trim(),
          options: q.options.map((opt: any) => String(opt).trim()),
          answer: answerIndex,
        };
      })
      .filter((q) => q !== null);
  }

  // =========================
  // GENERATE QUIZ (AI)
  // =========================
  async generateQuiz(topic: string, numberOfQuestions: number = 10) {
    if (!topic) {
      return { success: false, message: 'Topic is required' };
    }

    const numQuestions = Math.min(Math.max(numberOfQuestions, 1), 100);

    try {
      let allQuestions: any[] = [];
      const batchSize = 5;
      const totalBatches = Math.ceil(numQuestions / batchSize);

      for (let batch = 0; batch < totalBatches && allQuestions.length < numQuestions; batch++) {
        const remaining = numQuestions - allQuestions.length;
        const count = Math.min(batchSize, remaining);

        const prompt = `Generate exactly ${count} MCQ questions about "${topic}".

Return ONLY this JSON array:
[
  {"question": "Q?", "options": ["A","B","C","D"], "answer": 0}
]`;

        try {
          const response = await this.groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: 1500,
          });

          const content = response?.choices?.[0]?.message?.content;
          if (!content) continue;

          const match = content.match(/\[[\s\S]*\]/);
          if (!match) continue;

          const parsed = JSON.parse(match[0]);
          if (!Array.isArray(parsed)) continue;

          const valid = this.validateQuestions(parsed);
          allQuestions.push(...valid);

        } catch (err: any) {
          // retry if rate limited
          if (err.message?.includes('rate_limit')) {
            await this.sleep(3000);
            batch--;
            continue;
          }
        }

        // small delay between batches
        if (batch < totalBatches - 1) {
          await this.sleep(800);
        }
      }

      if (allQuestions.length === 0) {
        return {
          success: false,
          message: 'Failed to generate questions',
        };
      }

      return {
        success: true,
        data: {
          topic,
          type: 'mcq',
          questions: allQuestions.slice(0, numQuestions),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to generate quiz',
      };
    }
  }

  // =========================
  // SAVE QUIZ
  // =========================
  async saveQuiz(data: any) {
    if (!data?.topic || !data?.questions?.length || data.questions.length > 100) {
      return null;
    }

    try {
      return await this.prisma.quiz.create({
        data: {
          topic: data.topic,
          type: data.type || 'mcq',
          questions: {
            create: data.questions.map((q: any) => ({
              text: q.question,
              options: q.options,
              correctAnswer: q.answer,
            })),
          },
        },
        include: { questions: true },
      });
    } catch {
      return null;
    }
  }

  // =========================
  // GET QUIZZES
  // =========================
  async getAllQuizzes() {
    try {
      return await this.prisma.quiz.findMany({
        include: { questions: true },
      });
    } catch {
      return null;
    }
  }

  async getQuiz(id: number) {
    if (!id || id < 1) return null;

    try {
      return await this.prisma.quiz.findUnique({
        where: { id },
        include: { questions: true },
      });
    } catch {
      return null;
    }
  }
  async deleteQuiz(id: number) {
  if (!id || id < 1) return null;

  try {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) return null;

    // Delete related records in order
    await this.prisma.answer.deleteMany({
      where: { question: { quizId: id } },
    });

    await this.prisma.attempt.deleteMany({ where: { quizId: id } });

    await this.prisma.assignment.deleteMany({ where: { quizId: id } });

    await this.prisma.question.deleteMany({ where: { quizId: id } });

    const deleted = await this.prisma.quiz.delete({ where: { id } });

    return deleted;
  } catch {
    return null;
  }
  }

  // =========================
  // ASSIGN TO ALL STUDENTS (optimized)
  // =========================
  async assignQuizToAll(quizId: number, deadline?: string) {
    try {
      const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
      if (!quiz) return null;

      const students = await this.prisma.user.findMany({
        where: { role: 'student' },
        select: { id: true },
      });

      const existing = await this.prisma.assignment.findMany({
        where: { quizId },
        select: { userId: true },
      });

      const existingIds = new Set(existing.map((e) => e.userId));

      const newAssignments = students
        .filter((s) => !existingIds.has(s.id))
        .map((s) => ({
          quizId,
          userId: s.id,
          deadline: deadline ? new Date(deadline) : null,
          status: 'pending',
        }));

      await this.prisma.assignment.createMany({ data: newAssignments });

      return {
        message: `Assigned to ${newAssignments.length} students`,
        assignedCount: newAssignments.length,
      };
    } catch {
      return null;
    }
  }

  // =========================
  // SUBMIT QUIZ
  // =========================
  async submitAttempt(userId: number, quizId: number, answers: number[]) {
    try {
      const quiz = await this.prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: true },
      });

      if (!quiz || answers.length !== quiz.questions.length) return null;

      const { score, percentage } = this.calculateScore(
        quiz.questions,
        answers,
      );

      const assignment = await this.prisma.assignment.findFirst({
        where: { userId, quizId },
      });

      const attempt = await this.prisma.attempt.create({
        data: {
          userId,
          quizId,
          assignmentId: assignment?.id,
          score,
          percentage,
        },
      });

      // save answers
      await this.prisma.answer.createMany({
        data: quiz.questions.map((q, i) => ({
          attemptId: attempt.id,
          questionId: q.id,
          selectedOption: answers[i],
          isCorrect: answers[i] === q.correctAnswer,
        })),
      });

      if (assignment) {
        await this.prisma.assignment.update({
          where: { id: assignment.id },
          data: { status: 'completed' },
        });
      }

      return { score, percentage };
    } catch {
      return null;
    }
  }

  // =========================
  // ANALYTICS
  // =========================
  async getQuizAnalytics(quizId: number) {
    if (!quizId || quizId < 1) return null;

    try {
      const attempts = await this.prisma.attempt.findMany({ where: { quizId } });
      const assignments = await this.prisma.assignment.findMany({ where: { quizId } });

      if (attempts.length === 0) {
        return {
          totalAssigned: assignments.length,
          totalAttempts: 0,
          completionRate: 0,
          averageScore: 0,
          distribution: { excellent: 0, good: 0, average: 0, poor: 0 },
        };
      }

      const avg =
        attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length;

      return {
        totalAssigned: assignments.length,
        totalAttempts: attempts.length,
        completionRate: Math.round((attempts.length / assignments.length) * 100),
        averageScore: Math.round(avg),
        topPerformers: attempts.filter((a) => a.percentage >= 90).length,
        distribution: {
          excellent: attempts.filter((a) => a.percentage >= 90).length,
          good: attempts.filter((a) => a.percentage >= 70 && a.percentage < 90).length,
          average: attempts.filter((a) => a.percentage >= 50 && a.percentage < 70).length,
          poor: attempts.filter((a) => a.percentage < 50).length,
        },
      };
    } catch {
      return null;
    }
  }
}