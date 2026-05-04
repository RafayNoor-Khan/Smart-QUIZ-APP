import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssignmentService {
  constructor(private prisma: PrismaService) {}

  // ✅ Properly typed include (FIXES ALL ERRORS)
  private assignmentInclude: Prisma.AssignmentInclude = {
    quiz: {
      select: {
        id: true,
        topic: true,
        questions: true,
      },
    },
    attempts: {
      select: {
        id: true,
        score: true,
        percentage: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' as Prisma.SortOrder }, // ✅ FIX
      take: 1,
    },
  };

  async assignQuiz(data: any) {
    if (!data.userId || !data.quizId) {
      throw new BadRequestException('userId and quizId required');
    }

    return this.prisma.assignment.create({
      data: {
        userId: data.userId,
        quizId: data.quizId,
        deadline: data.deadline ? new Date(data.deadline) : null,
        weightage: data.weightage ?? 1,
        status: 'pending',
      },
      include: { quiz: true },
    });
  }

  private getAssignments(where: Prisma.AssignmentWhereInput, orderBy: Prisma.AssignmentOrderByWithRelationInput) {
    return this.prisma.assignment.findMany({
      where,
      include: this.assignmentInclude,
      orderBy,
    });
  }

  async getUserAssignments(userId: number) {
    return this.getAssignments(
      { userId },
      { deadline: 'asc' as Prisma.SortOrder }, // ✅ FIX
    );
  }

  async getPendingAssignments(userId: number) {
    return this.getAssignments(
      { userId, status: 'pending' },
      { deadline: 'asc' as Prisma.SortOrder }, // ✅ FIX
    );
  }

  async getCompletedAssignments(userId: number) {
    const assignments = await this.getAssignments(
      { userId, status: 'completed' },
      { createdAt: 'desc' as Prisma.SortOrder }, // ✅ FIX
    );

    // ✅ Now TS knows attempts exists
    return assignments.map((a) => ({
      ...a,
      attemptId: a.attempts?.[0]?.id || null,
      score: a.attempts?.[0]?.score,
      percentage: a.attempts?.[0]?.percentage,
      submittedAt: a.attempts?.[0]?.createdAt,
    }));
  }
}