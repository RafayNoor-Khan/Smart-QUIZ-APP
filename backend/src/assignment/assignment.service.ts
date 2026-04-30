// src/assignment/assignment.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssignmentService {
  constructor(private prisma: PrismaService) {}

  async assignQuiz(data: any) {
    if (!data.userId || !data.quizId) {
      throw new Error('userId and quizId required');
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        userId: data.userId,
        quizId: data.quizId,
        deadline: data.deadline ? new Date(data.deadline) : null,
        weightage: data.weightage || 1,
        status: 'pending',
      },
      include: { quiz: true },
    });

    return assignment;
  }

  async getUserAssignments(userId: number) {
    return this.prisma.assignment.findMany({
      where: { userId },
      include: {
        quiz: { select: { id: true, topic: true } },
      },
      orderBy: { deadline: 'asc' },
    });
  }

  async getPendingAssignments(userId: number) {
    return this.prisma.assignment.findMany({
      where: { userId, status: 'pending' },
      include: {
        quiz: { select: { id: true, topic: true } },
      },
      orderBy: { deadline: 'asc' },
    });
  }

  async getCompletedAssignments(userId: number) {
    return this.prisma.assignment.findMany({
      where: { userId, status: 'completed' },
      include: {
        quiz: { select: { id: true, topic: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}