import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { name, feedback, apiId, token } = await request.json() as { name?: string, feedback: string, apiId?: string, token: string };

        if (!feedback) {
            return json({ error: 'Feedback is required' }, { status: 400 });
        }

        const telegramToken = env.TELEGRAM_BOT_TOKEN;
        const chatId = env.ADMIN_CHAT_ID;
        const turnstileSecret = env.TURNSTILE_SECRET_KEY;

        if (!telegramToken || !chatId) {
            console.error('Missing Telegram configuration');
            return json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Verify Turnstile Token
        const trResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secret: turnstileSecret,
                response: token,
            }),
        });

        const trData = await trResponse.json() as any;

        if (!trData.success) {
            console.error('Turnstile verification failed:', trData);
            return json({ error: 'Security verification failed' }, { status: 403 });
        }

        const messageText = `
<b>🔔 New Feedback / Report</b>

<b>👤 Name:</b> ${name || 'Anonymous'}
<b>🔌 API ID:</b> ${apiId || 'Unknown'}
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
