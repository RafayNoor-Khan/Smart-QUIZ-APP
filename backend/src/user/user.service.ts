import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // GET ALL STUDENTS
  // =========================
  async getAllStudents() {
    return this.prisma.user.findMany({
      where: { role: 'student' },
    });
  }

  // =========================
  // STUDENT REPORT (INSTRUCTOR VIEW)
  // =========================
  async getStudentReport(id: number) {
    if (!id || id < 1) return null;

    const student = await this.prisma.user.findUnique({
      where: { id },
      include: {
        attempts: { include: { quiz: true } },
        assignments: {
          where: { status: 'pending' },
          include: { quiz: true },
        },
      },
    });

    if (!student) {
      return { error: 'User not found' };
    }

    return student;
  }

  // =========================
  // STUDENT DASHBOARD
  // =========================
  async getStudentDashboard(id: number) {
    if (!id || id < 1) return null;

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