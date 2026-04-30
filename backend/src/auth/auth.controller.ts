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

  // 1. REGISTER
  @Post('register')
  register(@Body() body: any) {
    // We send all 4 required arguments to the service
    return this.authService.register(
      body.name,
      body.email,
      body.password,
      body.role,
    );
  }

  // 2. LOGIN
  // UseGuards(LocalAuthGuard) handles the email/password check via Strategy
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    // At this point, req.user is already populated by LocalStrategy
    return this.authService.login(req.user);
  }

  // 3. PROFILE
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
