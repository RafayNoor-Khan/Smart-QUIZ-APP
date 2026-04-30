// src/assignment/assignment.controller.ts
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AssignmentService } from './assignment.service';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  // INSTRUCTOR: Assign quiz to a student
  @Post('create')
  async createAssignment(@Body() data: any) {
    if (!data.userId || !data.quizId) {
      return { success: false, message: 'userId and quizId required' };
    }

    try {
      const assignment = await this.assignmentService.assignQuiz(data);
      return { success: true, data: assignment };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // STUDENT: Get all my assignments
  @Get('user/:userId')
  async getStudentAssignments(@Param('userId') userId: string) {
    try {
      const assignments = await this.assignmentService.getUserAssignments(
        Number(userId),
      );
      return { success: true, data: assignments };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // STUDENT: Get pending assignments
  @Get('user/:userId/pending')
  async getPendingAssignments(@Param('userId') userId: string) {
    try {
      const assignments = await this.assignmentService.getPendingAssignments(
        Number(userId),
      );
      return { success: true, data: assignments };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // STUDENT: Get completed assignments
  @Get('user/:userId/completed')
  async getCompletedAssignments(@Param('userId') userId: string) {
    try {
      const assignments = await this.assignmentService.getCompletedAssignments(
        Number(userId),
      );
      return { success: true, data: assignments };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}