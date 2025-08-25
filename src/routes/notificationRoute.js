// src/routes/notificationRoute.js
import express from "express";
import { sendNotification } from "../controllers/notificationController.js";
import { sendSuccess, sendError } from "../helpers/responseHelper.js";
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Unified Notification API
 */

/**
 * @swagger
 * /notify:
 *   post:
 *     summary: Send a notification via Email, SMS, WhatsApp, or Push
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channel
 *               - payload
 *             properties:
 *               channel:
 *                 type: string
 *                 enum: [email, sms, whatsapp, push]
 *                 description: Notification channel
 *               payload:
 *                 type: object
 *                 description: Channel-specific payload
 *           examples:
 *             Email:
 *               value:
 *                 channel: "email"
 *                 payload:
 *                   to: "avranil0707@gmail.com"
 *                   subject: "Test Email"
 *                   html: "<h1>Welcome!</h1><p>This is a test.</p>"
 *             EmailMultiple:
 *               value:
 *                 channel: "email"
 *                 payload:
 *                   to: [
 *                     { "email": "avra6011@gmail.com", "name": "Avra" },
 *                     { "email": "abhranilsen5@gmail.com", "name": "Abhranil" }
 *                   ]
 *                   cc: [
 *                     { "email": "abhranilsen98@gmail.com", "name": "Abhranil" }
 *                   ]
 *                   templateId: 1
 *                   attachments: [
 *                     { "path": "C:/Users/abhra/Downloads/3rd sem result.pdf" }
 *                   ]
 *             SMS:
 *               value:
 *                 channel: "sms"
 *                 payload:
 *                   to: "+916289964216"
 *                   message: "Hello! Test SMS via Twilio."
 *             WhatsApp:
 *               value:
 *                 channel: "whatsapp"
 *                 payload:
 *                   to: "+916289964216"
 *                   template:
 *                     template_name: "hello_world"
 *             Push:
 *               value:
 *                 channel: "push"
 *                 payload:
 *                   token: "your_fcm_device_token_here"
 *                   title: "Test Push"
 *                   body: "Hello from Postman"
 *                   data:
 *                     extraKey: "extraValue"
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */

router.post("/notify", async (req, res) => {
  try {
    await sendNotification(req, res); 
    // controller already uses sendSuccess/sendError
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});


router.post("/webhook", async (req, res) => {
  try {
    const data = req.body;
    console.log(" Webhook received:", JSON.stringify(data, null, 2));

    // Brevo events
    if (data.event) {
      switch (data.event) {
        case "delivered":
          console.log(` Email delivered to ${data.email} at ${data.date}`);
          break;
        case "opened":
          console.log(` Email opened by ${data.email} at ${data.date}`);
          break;
        case "click":
          console.log(` Email link clicked by ${data.email}`);
          break;
        case "hard_bounce":
        case "soft_bounce":
          console.log(` Email bounced for ${data.email}`);
          break;
        case "spam":
          console.log(` Email marked as spam by ${data.email}`);
          break;
        case "unsubscribed":
          console.log(` ${data.email} unsubscribed`);
          break;
        default:
          console.log(" Other Brevo event:", data.event);
      }
    }

    // Twilio events
    if (data.MessageStatus) {
      console.log(` Twilio status: ${data.MessageStatus}, To=${data.To}`);
    }

    return sendSuccess(res, null, "Webhook processed");
  } catch (error) {
    console.error(" Webhook error:", error.message);
    return sendError(res, error.message, 500);
  }
});

export default router;
