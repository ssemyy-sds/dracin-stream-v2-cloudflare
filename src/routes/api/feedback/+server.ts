import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { name, feedback } = await request.json() as { name?: string, feedback: string };

        if (!feedback) {
            return json({ error: 'Feedback is required' }, { status: 400 });
        }

        const token = env.TELEGRAM_BOT_TOKEN;
        const chatId = env.ADMIN_CHAT_ID;

        if (!token || !chatId) {
            console.error('Missing Telegram configuration');
            return json({ error: 'Server configuration error' }, { status: 500 });
        }

        const messageText = `
<b>🔔 New Feedback / Report</b>

<b>👤 Name:</b> ${name || 'Anonymous'}
<b>📝 Message:</b>
${feedback}
`;

        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: messageText,
                parse_mode: 'HTML',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Telegram API Error:', errorText);
            throw new Error(`Telegram API Error: ${errorText}`);
        }

        return json({ success: true });

    } catch (error) {
        console.error('Feedback Error:', error);
        return json({ error: 'Failed to send feedback' }, { status: 500 });
    }
};
