import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type { SendMailOptions } from 'nodemailer';
import * as hbs from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

interface SendEmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly templateCache: Map<string, hbs.TemplateDelegate> = new Map();

  constructor() {
    const smtpHost = process.env.SMTP_HOST || 'smtp.ethereal.email';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpSecure = process.env.SMTP_SECURE === 'true';

    this.logger.debug(
      `SMTP config: host=${smtpHost}, port=${smtpPort}, secure=${smtpSecure}`,
    );

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    this.logger.debug('EmailService transporter initialized');
  }

  async sendNotificationEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<SendEmailResult> {
    const mailOptions: SendMailOptions = {
      from: process.env.SMTP_FROM || 'DreamFitness <noreply@dreamfitness.club>',
      to,
      subject,
      html,
    };

    this.logger.debug(`Sending email to ${to} with subject: ${subject}`);

    try {
      const rawResult = await this.transporter.sendMail(mailOptions);

      const emailResult: SendEmailResult = {
        messageId: rawResult.messageId,
        accepted: rawResult.accepted.map((a) =>
          typeof a === 'string' ? a : a.address,
        ),
        rejected: rawResult.rejected.map((r) =>
          typeof r === 'string' ? r : r.address,
        ),
      };

      this.logger.log(`Email sent to ${to}: ${emailResult.messageId}`);

      if (emailResult.rejected.length > 0) {
        this.logger.warn(
          `Email rejected for: ${emailResult.rejected.join(', ')}`,
        );
      }

      return emailResult;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email to ${to}: ${errorMessage}`);
      throw error;
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
      // Try multiple possible template locations to support both webpack and tsc builds
      const possiblePaths = [
        // For tsc build (non-webpack): templates are copied alongside the JS files
        path.join(__dirname, 'templates', `${name}.hbs`),
        // For webpack build: templates are copied to the root of dist folder
        path.join(process.cwd(), 'email', 'templates', `${name}.hbs`),
        // Alternative location for monorepo structure
        path.join(
          process.cwd(),
          'apps',
          'notification-service',
          'src',
          'email',
          'templates',
          `${name}.hbs`,
        ),
      ];

      let templatePath: string | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          templatePath = p;
          break;
        }
      }

      if (!templatePath) {
        throw new Error(
          `Template '${name}.hbs' not found. Searched paths: ${possiblePaths.join(', ')}`,
        );
      }

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
