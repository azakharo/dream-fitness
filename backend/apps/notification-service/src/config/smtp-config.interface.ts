export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string | undefined;
  password: string | undefined;
  from: string;
}
