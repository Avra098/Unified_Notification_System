import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export const sendEmail = async (payload) => {
  try {
    const { to, cc, subject, html, templateId, params, attachments } = payload;

    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    // Sender
    sendSmtpEmail.sender = {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME || "Notification Service"
    };

    //  Recipients
    if (typeof to === "string") {
      sendSmtpEmail.to = [{ email: to }];
    } else if (Array.isArray(to)) {
      sendSmtpEmail.to = to
        .filter(r => r.email)
        .map(r => ({ email: r.email, name: r.name || undefined }));
    } else if (to && to.email) {
      sendSmtpEmail.to = [{ email: to.email, name: to.name || undefined }];
    } else {
      throw new Error("Invalid 'to' field: must be string, object, or array of objects with 'email'.");
    }

    //  CC
    if (cc && Array.isArray(cc)) {
      sendSmtpEmail.cc = cc
        .filter(r => r.email)
        .map(r => ({ email: r.email, name: r.name || undefined }));
    }

    //  Template or raw content
    if (templateId) {
      sendSmtpEmail.templateId = templateId;
      if (params) sendSmtpEmail.params = params;
    } else {
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
    }

    //  Attachments (support both { path } and { name, content })
    if (attachments?.length) {
      sendSmtpEmail.attachment = attachments.map(file => {
        if (file.path) {
          const absolutePath = path.resolve(file.path);
          const fileContent = fs.readFileSync(absolutePath).toString("base64");
          return {
            name: path.basename(absolutePath),
            content: fileContent
          };
        }
        return {
          name: file.name,
          content: file.content
        };
      });
    }

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(" Email sent:", response.body);
    return response.body;
  } catch (error) {
    console.error(" Error sending email:", error.response?.body || error);
    throw error;
  }
};
