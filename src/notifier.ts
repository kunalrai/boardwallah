import type { Notifier } from "./services";

export class ConsoleNotifier implements Notifier {
  async sendWhatsApp(to: string, message: string): Promise<boolean> {
    console.error(`[dev whatsapp -> ${to}] ${message}`);
    return true;
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    console.error(`[dev sms -> ${to}] ${message}`);
    return true;
  }
}

export class NoopNotifier implements Notifier {
  async sendWhatsApp(): Promise<boolean> {
    return false;
  }

  async sendSms(): Promise<boolean> {
    return false;
  }
}

interface HttpNotifierOptions {
  whatsappToken?: string;
  whatsappPhoneNumberId?: string;
  whatsappApiVersion?: string;
  smsUrl?: string;
  smsToken?: string;
}

export class HttpNotifier implements Notifier {
  private readonly options: HttpNotifierOptions;

  constructor(options: HttpNotifierOptions) {
    this.options = options;
  }

  async sendWhatsApp(to: string, message: string): Promise<boolean> {
    if (!this.options.whatsappToken || !this.options.whatsappPhoneNumberId) return false;
    const version = this.options.whatsappApiVersion ?? "v21.0";
    const response = await fetch(
      `https://graph.facebook.com/${version}/${this.options.whatsappPhoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.options.whatsappToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/^\+/, ""),
          type: "text",
          text: { body: message },
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    return response.ok;
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    if (!this.options.smsUrl) return false;
    const response = await fetch(this.options.smsUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.options.smsToken ? { authorization: `Bearer ${this.options.smsToken}` } : {}),
      },
      body: JSON.stringify({ to, message }),
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok;
  }
}

export function createNotifier(env: Record<string, string | undefined> = process.env): Notifier {
  const options: HttpNotifierOptions = {
    whatsappToken: env.WHATSAPP_TOKEN,
    whatsappPhoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    whatsappApiVersion: env.WHATSAPP_API_VERSION,
    smsUrl: env.SMS_API_URL,
    smsToken: env.SMS_API_TOKEN,
  };
  if (options.whatsappToken || options.smsUrl) return new HttpNotifier(options);
  if (env.NODE_ENV === "production") return new NoopNotifier();
  return new ConsoleNotifier();
}
