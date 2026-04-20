import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { SentMessageInfo } from 'nodemailer';
import * as hbs from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly templateCache: Map<string, hbs.TemplateDelegate> = new Map();

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendNotificationEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result: SentMessageInfo = await this.transporter.sendMail({
        from:
          process.env.SMTP_FROM || 'DreamFitness <noreply@dreamfitness.club>',
        to,
        subject,
        html,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.log(`Email sent to ${to}: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
    }
  }

  async sendTemplatedEmail(
    to: string,
    templateName: string,
    context: Record<string, unknown>,
  ): Promise<void> {
    const html = this.compileTemplate(templateName, context);
    const subject = this.getSubjectForTemplate(templateName);
    await this.sendNotificationEmail(to, subject, html);
  }

  private compileTemplate(
    name: string,
    context: Record<string, unknown>,
  ): string {
    let template = this.templateCache.get(name);

    if (!template) {
      const templatePath = path.join(__dirname, 'templates', `${name}.hbs`);
      const templateString = fs.readFileSync(templatePath, 'utf-8');
      template = hbs.compile(templateString);
      this.templateCache.set(name, template);
    }

    return template(context);
  }

  private getSubjectForTemplate(name: string): string {
    const subjects: Record<string, string> = {
      'booking-confirmation': 'Подтверждение записи на тренировку',
      'booking-cancellation': 'Отмена записи на тренировку',
      'balance-change': 'Изменение баланса',
      'training-reminder': 'Напоминание о тренировке',
      'waitlist-joined': 'Вы добавлены в лист ожидания',
      'waitlist-promoted': 'Место освободилось!',
    };
    return subjects[name] || 'Уведомление от DreamFitness';
  }
}
