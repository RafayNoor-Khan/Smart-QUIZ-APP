import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =========================
  // REGISTER
  // =========================
  @Post('register')
  async register(@Body() body: any) {
    const { name, email, password, role } = body;

    const result = await this.authService.register(
      name,
      email,
      password,
      role,
    );

    return result;
  }

  // =========================
  // LOGIN
  // =========================
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  // =========================
  // PROFILE
  // =========================
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return { success: true, data: req.user };
  }
}