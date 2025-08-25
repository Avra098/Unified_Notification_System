export async function handleWebhook(data) {
  try {
    const { event, email, messageId, date } = data;

    switch (event) {
      case 'delivered':
        console.log(` Email delivered to ${email} at ${date}`);
        break;
      case 'opened':
        console.log(` Email opened by ${email} at ${date}`);
        break;
      case 'clicked':
        console.log(` Email link clicked by ${email} at ${date}`);
        break;
      case 'bounced':
        console.log(` Email to ${email} bounced at ${date}`);
        break;
      case 'spam':
        console.log(` Email to ${email} marked as spam`);
        break;
      default:
        console.log(` Event received:`, data);
    }

    return { success: true, message: "Webhook processed successfully" };
  } catch (error) {
    return { success: false, error: error.message || "Unknown webhook error" };
  }
}
