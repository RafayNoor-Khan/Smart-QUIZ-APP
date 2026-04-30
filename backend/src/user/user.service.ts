import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // For Instructor: List all students to assign them quizzes
  async getAllStudents() {
    return this.prisma.user.findMany({
      where: { role: 'student' },
    });
  }

  // For Instructor: See how a student is doing
  async getStudentReport(id: number) {
    const student = await this.prisma.user.findUnique({
      where: { id },
      include: {
        attempts: { include: { quiz: true } },
        assignments: { where: { status: 'pending' }, include: { quiz: true } },
      },
    });

    if (!student) return { error: 'User not found' };
    return student;
  }

  // For Student: See their own dashboard
  async getStudentDashboard(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        assignments: {
          where: { status: 'pending' },
          include: { quiz: true },
        },
        attempts: {
          orderBy: { createdAt: 'desc' },
          include: { quiz: true },
        },
      },
    });
  }
}