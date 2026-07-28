import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (dto.role && user.role !== dto.role) {
      throw new UnauthorizedException(`Access denied. ${dto.role} privileges required.`);
    }

    const { password, ...safeUser } = user;
    return {
      user: safeUser,
      token: `token_${safeUser.role.toLowerCase()}_${safeUser.id}`,
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new BadRequestException('An account with this email already exists.');
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        password: dto.password,
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
        role: Role.CUSTOMER,
      },
    });

    const { password, ...safeUser } = user;
    return {
      user: safeUser,
      token: `token_customer_${safeUser.id}`,
    };
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
