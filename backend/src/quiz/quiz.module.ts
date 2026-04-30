import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  controllers: [QuizController],
  providers: [QuizService],
  imports: [PrismaModule],
})
export class QuizModule {}
