import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    await this.createAndLogVerificationCode(user.id, user.email);

    return { message: 'Verification code sent' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('Account is blocked');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      user: this.usersService.sanitize(user),
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    const tokenHash = await this.hashToken(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old session
    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.usersService.findById(session.userId);
    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('Account is blocked');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      user: this.usersService.sanitize(user),
      ...tokens,
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = await this.hashToken(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
    });

    if (session && !session.revokedAt) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal whether email exists
      return { ok: true };
    }

    const token = randomUUID();
    const tokenHash = await this.hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    this.logger.log(`Password reset token for ${email}: ${token}`);
    await this.mailService.sendPasswordReset(email, token);

    return { ok: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = await this.hashToken(token);
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      // Revoke all active sessions on password reset
      this.prisma.session.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { ok: true };
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid verification code');
    }

    if (user.emailVerified) {
      const tokens = await this.generateTokens(user.id, user.email, user.role);
      return { user: this.usersService.sanitize(user), ...tokens };
    }

    const codeHash = await this.hashToken(code);

    const verificationCode =
      await this.prisma.emailVerificationCode.findFirst({
        where: {
          userId: user.id,
          codeHash,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

    if (!verificationCode) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    await this.prisma.$transaction([
      this.prisma.emailVerificationCode.update({
        where: { id: verificationCode.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      }),
    ]);

    const updatedUser = await this.usersService.findById(user.id);
    const tokens = await this.generateTokens(
      updatedUser.id,
      updatedUser.email,
      updatedUser.role,
    );
    return { user: this.usersService.sanitize(updatedUser), ...tokens };
  }

  async resendVerificationCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.emailVerified) {
      return { ok: true };
    }

    await this.createAndLogVerificationCode(user.id, user.email);
    return { ok: true };
  }

  private async createAndLogVerificationCode(userId: string, email: string) {
    const code = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, '0');

    const codeHash = await this.hashToken(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.emailVerificationCode.create({
      data: { userId, codeHash, expiresAt },
    });

    this.logger.log(`Email verification code for ${email}: ${code}`);
    await this.mailService.sendVerificationCode(email, code);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload as any, {
      expiresIn: this.configService.get<string>('jwt.expiresIn')! as any,
    });

    const refreshToken = randomUUID();
    const refreshTokenHash = await this.hashToken(refreshToken);
    const refreshExpiresIn = this.configService.get<string>(
      'jwt.refreshExpiresIn',
    )!;
    const expiresAt = this.parseExpiry(refreshExpiresIn);

    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private async hashToken(token: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(expiry: string): Date {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7d

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }
}
