import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('mail.host')!;
    const port = this.configService.get<number>('mail.port')!;
    const fromAddress = this.configService.get<string>('mail.from')!;
    const fromName = this.configService.get<string>('mail.fromName')!;

    this.from = `"${fromName}" <${fromAddress}>`;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
    });
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    const subject = 'Підтвердження email — АЛЬКОР';

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a1628; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">АЛЬКОР</h1>
        </div>
        <div style="padding: 32px; color: #e2e8f0;">
          <p style="font-size: 16px; margin: 0 0 16px;">Вітаємо! Ваш код підтвердження:</p>
          <div style="background: #050b14; border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3b82f6;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #94a3b8; margin: 0;">Код дійсний протягом 15 хвилин. Якщо ви не реєструвалися на АЛЬКОР, проігноруйте цей лист.</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
    }
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('frontendUrl')!;
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const subject = 'Скидання паролю — АЛЬКОР';

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a1628; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">АЛЬКОР</h1>
        </div>
        <div style="padding: 32px; color: #e2e8f0;">
          <p style="font-size: 16px; margin: 0 0 16px;">Ви запросили скидання паролю. Натисніть кнопку нижче:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">Скинути пароль</a>
          </div>
          <p style="font-size: 13px; color: #94a3b8; margin: 16px 0 0; word-break: break-all;">Або скопіюйте посилання: ${resetUrl}</p>
          <p style="font-size: 14px; color: #94a3b8; margin: 16px 0 0;">Посилання дійсне протягом 1 години. Якщо ви не запитували скидання, проігноруйте цей лист.</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
    }
  }
}
