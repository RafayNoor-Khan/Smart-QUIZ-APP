import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string, role: string) {
    if (!email || !password || !name) {
      return { error: 'Missing required fields' };
    }

    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'Email already registered' };
    }

    // 2. Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 3. Create user
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
      },
    });

    return {
      message: 'User registered successfully',
      user,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
