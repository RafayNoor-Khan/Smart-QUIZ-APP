import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 1. INSTRUCTOR: Get all students for the "Assign Quiz" dropdown
  @Get('students')
  getAllStudents() {
    return this.userService.getAllStudents();
  }

  // 2. INSTRUCTOR: Get a detailed report for a specific student
  @Get('students/:id/report')
  getReport(@Param('id') id: string) {
    return this.userService.getStudentReport(Number(id));
  }

  // 3. STUDENT: Get data for their own dashboard (Pending quizzes + history)
  @Get('dashboard/:id')
  getDashboard(@Param('id') id: string) {
    return this.userService.getStudentDashboard(Number(id));
  }
}