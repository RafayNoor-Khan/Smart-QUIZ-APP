import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('students')
  async getAllStudents() {
    const data = await this.userService.getAllStudents();
    return { success: true, data };
  }

  @Get('students/:id/report')
  async getReport(@Param('id') id: string) {
    const data = await this.userService.getStudentReport(+id);
    return { success: true, data };
  }

  @Get('dashboard/:id')
  async getDashboard(@Param('id') id: string) {
    const data = await this.userService.getStudentDashboard(+id);
    return { success: true, data };
  }
}
