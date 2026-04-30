import { PrismaService } from 'src/prisma/prisma.service';
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import Groq from 'groq-sdk';

@Injectable()
export class QuizService {
  private groq: Groq;

  constructor(private prisma: PrismaService) {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async generateQuiz(topic: string) {
    if (!topic) {
      throw new BadRequestException('Topic required');
    }

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a quiz generator. Return ONLY valid JSON with this format:
{
  "topic": "string",
  "type": "mcq",
  "questions": [
    {
      "question": "string",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "answer": 0
    }
  ]
}`,
          },
          {
            role: 'user',
            content: `Create 5 MCQ questions on: ${topic}`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      // Fix: Check if content exists before parsing
      const content = response?.choices?.[0]?.message?.content;

      if (!content) {
        throw new InternalServerErrorException('AI returned empty response');
      }

      return JSON.parse(content); // Now content is guaranteed to be a string
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to generate quiz',
      );
    }
  }

  async saveQuiz(data: any) {
    if (!data.topic || !data.questions) {
      throw new Error('Topic and questions required');
    }

    return this.prisma.quiz.create({
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
  }

  async getAllQuizzes() {
    return this.prisma.quiz.findMany({
      include: { questions: true },
    });
  }

  async getQuiz(id: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!quiz) throw new Error('Quiz not found');
    return quiz;
  }

  async assignQuizToAll(quizId: number, deadline?: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new Error('Quiz not found');

    const students = await this.prisma.user.findMany({
      where: { role: 'student' },
    });

    let count = 0;
    for (const student of students) {
      const exists = await this.prisma.assignment.findFirst({
        where: { quizId, userId: student.id },
      });

      if (!exists) {
        await this.prisma.assignment.create({
          data: {
            quizId,
            userId: student.id,
            deadline: deadline ? new Date(deadline) : null,
            status: 'pending',
          },
        });
        count++;
      }
    }

    return { message: `Assigned to ${count} students`, count };
  }

  async submitAttempt(userId: number, quizId: number, answers: any[]) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) throw new Error('Quiz not found');

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (Number(answers[i]) === q.correctAnswer) {
        score++;
      }
    });

    const percentage = (score / quiz.questions.length) * 100;

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

    // Store individual answers
    for (let i = 0; i < quiz.questions.length; i++) {
      const isCorrect = Number(answers[i]) === quiz.questions[i].correctAnswer;
      await this.prisma.answer.create({
        data: {
          attemptId: attempt.id,
          questionId: quiz.questions[i].id,
          selectedOption: answers[i],
          isCorrect,
        },
      });
    }

    // Mark assignment as completed
    if (assignment) {
      await this.prisma.assignment.update({
        where: { id: assignment.id },
        data: { status: 'completed' },
      });
    }

    return { score, percentage: Math.round(percentage) };
  }

  async getQuizAnalytics(quizId: number) {
    const attempts = await this.prisma.attempt.findMany({
      where: { quizId },
    });

    const assignments = await this.prisma.assignment.findMany({
      where: { quizId },
    });

    if (attempts.length === 0) {
      return {
        totalAssigned: assignments.length,
        totalAttempts: 0,
        completionRate: 0,
        averageScore: 0,
        distribution: { excellent: 0, good: 0, average: 0, poor: 0 },
      };
    }

    const avgPercentage =
      attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length;

    return {
      totalAssigned: assignments.length,
      totalAttempts: attempts.length,
      completionRate: Math.round((attempts.length / assignments.length) * 100),
      averageScore: Math.round(avgPercentage),
      topPerformers: attempts.filter((a) => a.percentage >= 90).length,
      distribution: {
        excellent: attempts.filter((a) => a.percentage >= 90).length,
        good: attempts.filter((a) => a.percentage >= 70 && a.percentage < 90)
          .length,
        average: attempts.filter((a) => a.percentage >= 50 && a.percentage < 70)
          .length,
        poor: attempts.filter((a) => a.percentage < 50).length,
      },
    };
  }
}
