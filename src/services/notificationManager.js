import axios from "axios";
import { sendEmail as brevoSendEmail } from "./emailService.js";
import { sendSMS as twilioSendSMS } from "./smsService.js";
import { sendWhatsApp as metaSendWhatsApp } from "./whatsappService.js";
import { sendPush as fcmSendPush } from "./pushService.js";

class NotificationManager {
  async send(channel, payload) {
    if (!payload) throw new Error("Missing payload");

    const channelPayload = payload[channel] || payload;

    console.log(` [Manager] Sending via ${channel}`);
    console.log(" Channel Payload:", JSON.stringify(channelPayload, null, 2));

    let result;

    try {
      switch (channel.toLowerCase()) {
        case "email": {
          const { to, subject, body, html, cc, attachments, templateId } =
            channelPayload;

          if (!to) throw new Error('Email payload must include "to"');

          if (templateId) {
            result = await brevoSendEmail({
              to,
              cc,
              attachments,
              templateId,
            });
          } else {
            if (!subject || (!body && !html)) {
              throw new Error(
                "Email payload must include subject and body or html when not using templateId"
              );
            }

            result = await brevoSendEmail({
              to,
              subject,
              text: body,
              html,
              cc,
              attachments,
            });
          }
          break;
        }

        case "sms": {
          const { to, message } = channelPayload;
          if (!to || !message)
            throw new Error('SMS payload must include "to" and "message"');
          result = await twilioSendSMS(channelPayload);
          break;
        }

        case "whatsapp": {
          const { to, message } = channelPayload;
          if (!to || !message)
            throw new Error(
              'WhatsApp payload must include "to" and "message"'
            );
          result = await metaSendWhatsApp(channelPayload);
          break;
        }

        case "push": {
          const { token, title, body } = channelPayload;
          if (!token || !title || !body)
            throw new Error(
              'Push payload must include "token", "title", and "body"'
            );
          result = await fcmSendPush(channelPayload);
          break;
        }

        default:
          throw new Error(`Unsupported notification channel: ${channel}`);
      }

      if (channelPayload.webhookUrl) {
        await this.notifyWebhook(channelPayload.webhookUrl, {
          channel,
          success: true,
          result,
        });
      }

      return result;
    } catch (err) {
      if (channelPayload.webhookUrl) {
        await this.notifyWebhook(channelPayload.webhookUrl, {
          channel,
          success: false,
          error: err.message,
        });
      }
      throw new Error(`Failed to send via ${channel}: ${err.message}`);
    }
  }

  async notifyWebhook(webhookUrl, data) {
    try {
      await axios.post(webhookUrl, data, { timeout: 5000 });
    } catch (err) {
      console.error(` Failed to notify webhook: ${err.message}`);
    }
  }
}

export default new NotificationManager();
