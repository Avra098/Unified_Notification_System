import axios from "axios";

const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_VERSION = "v19.0"; // safer than v22.0 unless you tested

/**
 * Send a WhatsApp text message
 * @param {Object} options
 * @param {string} options.to - Recipient phone number in international format
 * @param {string} options.message - Text message body
 */
export async function sendWhatsApp({ to, template }) {
  try {
    if (!to || !template.template_name) {
      throw new Error("WhatsApp payload must include 'to' and 'message'");
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    // const payload = {
    //   messaging_product: "whatsapp",
    //   to,
    //   type: "text",
    //   text: { body: message },
    // };
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: template.template_name,
        language: { code: "en_US" },
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log(" WhatsApp sent successfully:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(" WhatsApp sending failed:",error.response?.data?.error || error.message);
    return {
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.message ||
        "Unknown WhatsApp error",
    };
  }
}
