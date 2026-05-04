// src/quiz/quiz.controller.ts

import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly service: QuizService) {}

  // =========================
  // GET ALL QUIZZES
  // =========================
  @Get('all')
  async getAll() {
    const data = await this.service.getAllQuizzes();
    return { success: true, data };
  }

  // =========================
  // GENERATE QUIZ (AI)
  // =========================
  @Post('generate')
  async generate(@Body() body: any) {
    const { topic, numberOfQuestions } = body;
    return this.service.generateQuiz(topic, numberOfQuestions);
  }

  // =========================
  // SAVE QUIZ
  // =========================
  @Post('save')
  async save(@Body() data: any) {
    const quiz = await this.service.saveQuiz(data);

    if (!quiz) {
      return { success: false, message: 'Failed to save quiz' };
    }

    return { success: true, data: quiz };
  }

  // =========================
  // ASSIGN QUIZ TO ALL
  // =========================
  @Post('assign-all')
  async assignAll(@Body() body: any) {
    const { quizId, deadline } = body;

    const result = await this.service.assignQuizToAll(quizId, deadline);

    return { success: true, data: result };
  }

  // =========================
  // SUBMIT QUIZ
  // =========================
  @Post(':quizId/submit')
  async submit(@Param('quizId') quizId: string, @Body() body: any) {
    const { userId, answers } = body;

    const result = await this.service.submitAttempt(+userId, +quizId, answers);

    return result;
  }

  // =========================
  // ANALYTICS
  // =========================
  @Get(':id/analytics')
  async analytics(@Param('id') id: string) {
    const data = await this.service.getQuizAnalytics(+id);
    return { success: true, data };
  }

  // =========================
  // DELETE QUIZ ✅ NEW
  // =========================
  @Delete(':id')
  async deleteQuiz(@Param('id') id: string) {
    const deleted = await this.service.deleteQuiz(+id);

    if (!deleted) {
      return { success: false, message: 'Failed to delete quiz' };
    }

    return { success: true, message: 'Quiz deleted successfully', data: deleted };
  }

  // =========================
  // GET SINGLE QUIZ
  // =========================
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.service.getQuiz(+id);
    return { success: true, data };
  }
}