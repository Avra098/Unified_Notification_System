// src/controllers/notificationController.js
import { sendEmail } from "../services/emailService.js";
import { sendSMS } from "../services/smsService.js";
import { sendPush } from "../services/pushService.js";
import { sendWhatsApp } from "../services/whatsappService.js";
import { sendSuccess, sendError } from "../helpers/responseHelper.js";
/**
 * Unified response wrapper
 */
const wrapResponse = async (fn, payload) => {
  try {
    const result = await fn(payload);
    // If the result itself is a failure, propagate that
    if (result && result.success === false) {
      return { success: false, error: result.error || "Unknown error" };
    }
    return { success: true, data: result };
  } catch (err) {
    console.error(" Channel error:", err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data || err.message || "Unknown error",
    };
  }
};

/**
 * Notification Controller
 */
export const sendNotification = async (req, res) => {
  const { channel, payload } = req.body;

  if (!channel || !payload) {
    return sendError(res, "Channel and payload are required", 400);
  }

  console.log(`[ROUTE] Incoming request for channel=${channel}`);
  console.log("Payload:", JSON.stringify(payload, null, 2));


  let response;

  switch (channel) {
    case "email":
      response = await wrapResponse(sendEmail, payload);
      break;

    case "sms":
      response = await wrapResponse(sendSMS, payload);
      break;

    case "whatsapp":
      response = await wrapResponse(sendWhatsApp, payload);
      break;

    case "push":
      response = await wrapResponse(sendPush, payload.push || payload);
      break;

    default:
      return sendError(res, "Unsupported channel", 400);
  }

  if (response.success) {
    return sendSuccess(res, response.data, "Notification sent successfully");
  } else {
    return sendError(res, response.error, 500);
  }
};
