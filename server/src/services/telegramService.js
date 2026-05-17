/**
 * Telegram Bot Notification Service
 * Sends order notifications to a Telegram chat when a new order is placed
 */
const sendOrderNotification = async (order) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN' || !chatId || chatId === 'YOUR_TELEGRAM_CHAT_ID') {
    console.log('ℹ️  Telegram not configured — skipping notification');
    return;
  }

  let itemsList = order.items
    .map((item) => `  • ${item.name} (x${item.quantity}) — ${item.price * item.quantity} EGP`)
    .join('\n');

  // Include product image links in the message
  let imagesSection = '';
  const itemsWithImages = order.items.filter((item) => item.image);
  if (itemsWithImages.length > 0) {
    imagesSection = '\n\n🖼️ *Product Images:*\n' +
      itemsWithImages.map((item) => `  • [${item.name}](${item.image})`).join('\n');
  }

  const message =
    `🛒 *New Order — KarKora Shop*\n\n` +
    `👤 *Name:* ${order.name}\n` +
    `📞 *Phone:* ${order.phone}\n` +
    `📍 *Address:* ${order.address}\n\n` +
    `🧾 *Items:*\n${itemsList}` +
    imagesSection +
    `\n\n💰 *Total:* ${order.totalPrice} EGP\n` +
    `📋 *Order ID:* \`${order._id}\`\n` +
    `🕐 *Time:* ${new Date(order.createdAt).toLocaleString('ar-EG')}`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    }),
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description}`);
  }

  console.log('✅ Telegram notification sent');
};

module.exports = { sendOrderNotification };
