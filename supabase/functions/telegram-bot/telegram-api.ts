
import { TelegramMessage } from './types.ts';

export const sendTelegramMessage = async (
  botToken: string,
  message: TelegramMessage
) => {
  console.log('Sending response message:', message.text);

  const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  console.log('Calling Telegram API:', telegramApiUrl);

  const telegramResponse = await fetch(telegramApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...message,
      parse_mode: 'HTML'
    }),
  });

  const telegramResponseText = await telegramResponse.text();
  console.log('Telegram API response status:', telegramResponse.status);
  console.log('Telegram API response body:', telegramResponseText);

  if (!telegramResponse.ok) {
    console.error('Telegram API error:', telegramResponseText);
  } else {
    console.log('Message sent successfully to Telegram');
  }

  return telegramResponse.ok;
};
