// src/quiz/quiz.controller.ts
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // GET ALL QUIZZES
  @Get('all')
  async getAllQuizzes() {
    try {
      const quizzes = await this.quizService.getAllQuizzes();
      return { success: true, data: quizzes };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // GET SINGLE QUIZ
  @Get(':id')
  async getQuiz(@Param('id') id: string) {
    try {
      const quiz = await this.quizService.getQuiz(Number(id));
      return { success: true, data: quiz };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // GENERATE QUIZ (AI)
  @Post('generate')
  async generateQuiz(@Body() body: any) {
    if (!body.topic) {
      return { success: false, message: 'Topic required' };
    }

    try {
      const quiz = await this.quizService.generateQuiz(body.topic);
      return { success: true, data: quiz };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // SAVE QUIZ
  @Post('save')
  async saveQuiz(@Body() data: any) {
    if (!data.topic || !data.questions) {
      return { success: false, message: 'Topic and questions required' };
    }

    try {
      const quiz = await this.quizService.saveQuiz(data);
      return { success: true, data: quiz };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // ASSIGN QUIZ TO ALL STUDENTS
  @Post('assign-all')
  async assignToAllStudents(@Body() data: any) {
    if (!data.quizId) {
      return { success: false, message: 'quizId required' };
    }

    try {
      const result = await this.quizService.assignQuizToAll(
        data.quizId,
        data.deadline,
      );
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // SUBMIT QUIZ
  @Post(':id/submit')
  async submitQuiz(@Param('id') id: string, @Body() body: any) {
    if (!body.userId || !body.answers) {
      return { success: false, message: 'userId and answers required' };
    }

    try {
      const result = await this.quizService.submitAttempt(
        body.userId,
        Number(id),
        body.answers,
      );
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // GET ANALYTICS
  @Get(':id/analytics')
  async getAnalytics(@Param('id') id: string) {
    try {
      const analytics = await this.quizService.getQuizAnalytics(Number(id));
      return { success: true, data: analytics };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
