import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AssignmentService } from './assignment.service';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly service: AssignmentService) {}

  @Post('create')
  async create(@Body() data: any) {
    const result = await this.service.assignQuiz(data);
    return { success: true, data: result };
  }

  @Get('user/:userId')
  async getAll(@Param('userId') userId: string) {
    return {
      success: true,
      data: await this.service.getUserAssignments(+userId),
    };
  }

  @Get('user/:userId/pending')
  async getPending(@Param('userId') userId: string) {
    return {
      success: true,
      data: await this.service.getPendingAssignments(+userId),
    };
  }

  @Get('user/:userId/completed')
  async getCompleted(@Param('userId') userId: string) {
    return {
      success: true,
      data: await this.service.getCompletedAssignments(+userId),
    };
  }
}