import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuizModule } from './quiz/quiz.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AssignmentModule } from './assignment/assignment.module';

@Module({
  imports: [QuizModule, PrismaModule, UserModule, AuthModule, AssignmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
