import { handleCommand, handleCallbackQuery } from './handlers/commands';

export interface Env {
    API_CONFIG: KVNamespace;
    TELEGRAM_BOT_TOKEN: string;
    ADMIN_CHAT_ID: string;
}

// Inline keyboard button type
export interface InlineButton {
    text: string;
    callback_data: string;
}

export type InlineKeyboard = InlineButton[][];

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }

        try {
            const update = await request.json() as any;

            // Handle callback queries (button presses)
            if (update.callback_query) {
                const callbackQuery = update.callback_query;
                const chatId = callbackQuery.message?.chat?.id?.toString();
                const callbackData = callbackQuery.data;
                const callbackQueryId = callbackQuery.id;

                // Verify it's from admin
                if (chatId !== env.ADMIN_CHAT_ID) {
                    await answerCallbackQuery(env, callbackQueryId, '⛔ Unauthorized');
                    return new Response('OK');
                }

                // Answer the callback to remove loading state
                await answerCallbackQuery(env, callbackQueryId);

                // Handle the callback action
                const result = await handleCallbackQuery(callbackData, env);
                await sendMessageWithKeyboard(env, chatId, result.text, result.keyboard);

                return new Response('OK');
            }

            // Handle regular messages
            const chatId = update.message?.chat?.id?.toString();

            if (chatId !== env.ADMIN_CHAT_ID) {
                if (chatId) {
                    await sendMessage(env, chatId, '⛔ Unauthorized. This bot is for admin use only.');
                }
                return new Response('OK');
            }

            const message = update.message?.text;
            if (!message) {
                return new Response('OK');
            }

            // Handle commands
            const result = await handleCommand(message, env);
            if (result.keyboard) {
                await sendMessageWithKeyboard(env, chatId, result.text, result.keyboard);
            } else {
                await sendMessage(env, chatId, result.text);
            }

            return new Response('OK');
        } catch (error) {
            console.error('Error:', error);
            return new Response('Error processing request', { status: 500 });
        }
    }
};

async function sendMessage(env: Env, chatId: string, text: string): Promise<void> {
    try {
        const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });
    } catch (err) {
        console.error('Failed to send telegram message:', err);
    }
}

async function sendMessageWithKeyboard(
    env: Env,
    chatId: string,
    text: string,
    keyboard?: InlineKeyboard
): Promise<void> {
    try {
        const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        const body: any = {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        };

        if (keyboard && keyboard.length > 0) {
            body.reply_markup = {
                inline_keyboard: keyboard
            };
        }

        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (err) {
        console.error('Failed to send telegram message:', err);
    }
}

async function answerCallbackQuery(
    env: Env,
    callbackQueryId: string,
    text?: string
): Promise<void> {
    try {
        const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text: text
            })
        });
    } catch (err) {
        console.error('Failed to answer callback query:', err);
    }
}
