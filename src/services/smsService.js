import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();


const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async ({ to, message }) => {
  try {
    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    console.log(" SMS sent:", sms.sid); 
    return { success: true, data: sms };
  } catch (error) {
    console.error(" SMS sending failed:", error.message);
    return {
      success: false,
      error: `SMS sending failed: ${error.message}`,
    };
  }
};