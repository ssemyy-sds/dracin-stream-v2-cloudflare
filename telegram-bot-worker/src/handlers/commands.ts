import { Env, InlineKeyboard } from '../index';
import { checkAPIHealth, checkAllAPIs } from './health';
import { getConfig, updateConfig, addSwitchHistory } from '../services/kv';
import { API_CONFIGS } from '../config';

const API_IDS = API_CONFIGS.map(api => api.id);
// Map API IDs to human readable names from config
const API_NAMES: Record<string, string> = {};
API_CONFIGS.forEach(api => {
    API_NAMES[api.id] = api.name;
});

// Response type with optional keyboard
export interface CommandResponse {
    text: string;
    keyboard?: InlineKeyboard;
}

// Main menu keyboard
function getMainMenuKeyboard(): InlineKeyboard {
    return [
        [
            { text: '📊 Status', callback_data: 'cmd_status' },
            { text: '📋 List APIs', callback_data: 'cmd_list' }
        ],
        [
            { text: '🔍 Health Check', callback_data: 'cmd_check' },
            { text: '📈 Stats', callback_data: 'cmd_stats' }
        ],
        [
            { text: '📊 Report', callback_data: 'cmd_report' },
            { text: '🔄 Switch API', callback_data: 'cmd_switch_menu' }
        ]
    ];
}

// Switch API keyboard
function getSwitchMenuKeyboard(): InlineKeyboard {
    const keyboard: InlineKeyboard = [];

    // Add API buttons in pairs
    for (let i = 0; i < API_CONFIGS.length; i += 2) {
        const row: { text: string; callback_data: string }[] = [];
        row.push({
            text: `${i + 1}. ${API_CONFIGS[i].name.split('(')[1]?.replace(')', '') || API_CONFIGS[i].name}`,
            callback_data: `switch_${API_CONFIGS[i].id}`
        });
        if (i + 1 < API_CONFIGS.length) {
            row.push({
                text: `${i + 2}. ${API_CONFIGS[i + 1].name.split('(')[1]?.replace(')', '') || API_CONFIGS[i + 1].name}`,
                callback_data: `switch_${API_CONFIGS[i + 1].id}`
            });
        }
        keyboard.push(row);
    }

    // Add back button
    keyboard.push([{ text: '⬅️ Back to Menu', callback_data: 'cmd_menu' }]);

    return keyboard;
}

// Back to menu keyboard
function getBackKeyboard(): InlineKeyboard {
    return [[{ text: '⬅️ Back to Menu', callback_data: 'cmd_menu' }]];
}

export async function handleCommand(message: string, env: Env): Promise<CommandResponse> {
    const [command, ...args] = message.trim().split(' ');

    switch (command) {
        case '/start':
        case '/help':
            return getHelpMessage();

        case '/status':
            return await getStatus(env);

        case '/list':
            return await listAPIs(env);

        case '/check':
            return await checkAllAPIsCommand(env);

        case '/switch':
            return await switchAPI(args[0], env);

        case '/report':
            return await getDetailedReport(env);

        case '/stats':
            return await getStats(env);

        default:
            return {
                text: '❓ Unknown command. Use the buttons below:',
                keyboard: getMainMenuKeyboard()
            };
    }
}

export async function handleCallbackQuery(data: string, env: Env): Promise<CommandResponse> {
    // Handle main commands
    if (data === 'cmd_menu' || data === 'cmd_help') {
        return getHelpMessage();
    }
    if (data === 'cmd_status') {
        return await getStatus(env);
    }
    if (data === 'cmd_list') {
        return await listAPIs(env);
    }
    if (data === 'cmd_check') {
        return await checkAllAPIsCommand(env);
    }
    if (data === 'cmd_report') {
        return await getDetailedReport(env);
    }
    if (data === 'cmd_stats') {
        return await getStats(env);
    }
    if (data === 'cmd_switch_menu') {
        return getSwitchMenu(env);
    }

    // Handle API switch
    if (data.startsWith('switch_')) {
        const apiId = data.replace('switch_', '');
        return await switchAPI(apiId, env);
    }

    // Handle switch confirmation
    if (data.startsWith('confirm_switch_')) {
        const apiId = data.replace('confirm_switch_', '');
        return await forceSwitch(apiId, env);
    }

    return {
        text: '❓ Unknown action',
        keyboard: getMainMenuKeyboard()
    };
}

async function getSwitchMenu(env: Env): Promise<CommandResponse> {
    const config = await getConfig(env);
    const activeApi = API_NAMES[config.activeApiId] || config.activeApiId;

    return {
        text: `🔄 <b>Switch API</b>\n\n` +
            `Current: <b>${activeApi}</b>\n\n` +
            `Select an API to switch to:`,
        keyboard: getSwitchMenuKeyboard()
    };
}

function getHelpMessage(): CommandResponse {
    return {
        text: `
🤖 <b>Dracin API Manager Bot</b>

Manage your streaming APIs with buttons below!

<b>Quick Actions:</b>
• 📊 Status - Current active API
• 📋 List - All 4 APIs with status
• 🔍 Check - Health check all APIs
• 📈 Stats - Usage statistics
• 📊 Report - Detailed health report
• 🔄 Switch - Change active API

Use the buttons to navigate:
    `.trim(),
        keyboard: getMainMenuKeyboard()
    };
}

async function getStatus(env: Env): Promise<CommandResponse> {
    const config = await getConfig(env);
    const apiName = API_NAMES[config.activeApiId as keyof typeof API_NAMES] || config.activeApiId;
    const stats = config.apiStats[config.activeApiId] || {};

    return {
        text: `
📊 <b>Current API Status</b>

🟢 <b>Active:</b> ${apiName}
🆔 <b>ID:</b> <code>${config.activeApiId}</code>
⏰ <b>Switched:</b> ${new Date(config.lastSwitchTime).toLocaleString()}
📈 <b>Success Rate:</b> ${calculateSuccessRate(stats)}%
⚡ <b>Avg Response:</b> ${stats.avgResponseTime || 0}ms
🏥 <b>Health:</b> ${getHealthEmoji(stats.lastHealthStatus)} ${stats.lastHealthStatus || 'unknown'}
    `.trim(),
        keyboard: [
            [
                { text: '🔍 Health Check', callback_data: 'cmd_check' },
                { text: '🔄 Switch API', callback_data: 'cmd_switch_menu' }
            ],
            [{ text: '⬅️ Back to Menu', callback_data: 'cmd_menu' }]
        ]
    };
}

async function listAPIs(env: Env): Promise<CommandResponse> {
    const config = await getConfig(env);
    let message = '📋 <b>Available APIs (4 total)</b>\n\n';

    for (const apiId of API_IDS) {
        const isActive = config.activeApiId === apiId;
        const stats = config.apiStats[apiId] || {};
        const apiName = API_NAMES[apiId as keyof typeof API_NAMES] || apiId;

        message += `${isActive ? '🟢' : '⚪'} <b>${apiName}</b>\n`;
        message += `   ID: <code>${apiId}</code>\n`;
        message += `   Health: ${getHealthEmoji(stats.lastHealthStatus)} ${stats.lastHealthStatus || 'unknown'}\n`;
        message += `   Success Rate: ${calculateSuccessRate(stats)}%\n`;
        message += `   Avg Response: ${stats.avgResponseTime || 0}ms\n\n`;
    }

    return {
        text: message,
        keyboard: [
            [
                { text: '🔍 Health Check', callback_data: 'cmd_check' },
                { text: '🔄 Switch API', callback_data: 'cmd_switch_menu' }
            ],
            [{ text: '⬅️ Back to Menu', callback_data: 'cmd_menu' }]
        ]
    };
}

async function checkAllAPIsCommand(env: Env): Promise<CommandResponse> {
    const results = await checkAllAPIs(env);
    let message = '🔍 <b>Health Check Results (All 4 APIs)</b>\n\n';

    for (const result of results) {
        const apiName = API_NAMES[result.apiId as keyof typeof API_NAMES] || result.apiId;
        message += `${result.healthy ? '✅' : '❌'} <b>${apiName}</b>\n`;
        message += `   Status: ${result.status}\n`;
        message += `   Response: ${result.responseTime}ms\n\n`;
    }

    // Add recommendation
    const healthyAPIs = results.filter(r => r.healthy);
    const switchButtons: InlineKeyboard = [];

    if (healthyAPIs.length === 0) {
        message += '⚠️ <b>WARNING:</b> All APIs are down!';
    } else {
        const config = await getConfig(env);
        const currentHealthy = results.find(r => r.apiId === config.activeApiId)?.healthy;

        if (!currentHealthy && healthyAPIs.length > 0) {
            const bestAPI = healthyAPIs[0];
            const apiName = API_NAMES[bestAPI.apiId as keyof typeof API_NAMES] || bestAPI.apiId;
            message += `\n💡 <b>Recommendation:</b> Switch to ${apiName}`;
            switchButtons.push([
                { text: `🔄 Switch to ${apiName.split('(')[1]?.replace(')', '') || apiName}`, callback_data: `switch_${bestAPI.apiId}` }
            ]);
        }
    }

    return {
        text: message,
        keyboard: [
            ...switchButtons,
            [{ text: '🔄 Switch API', callback_data: 'cmd_switch_menu' }],
            [{ text: '⬅️ Back to Menu', callback_data: 'cmd_menu' }]
        ]
    };
}

async function switchAPI(apiId: string, env: Env): Promise<CommandResponse> {
    if (!apiId) {
        return getSwitchMenu(env);
    }

    if (!API_IDS.includes(apiId)) {
        return {
            text: `❌ Invalid API ID. Choose from the buttons below:`,
            keyboard: getSwitchMenuKeyboard()
        };
    }

    const config = await getConfig(env);

    if (config.activeApiId === apiId) {
        const apiName = API_NAMES[apiId as keyof typeof API_NAMES];
        return {
            text: `ℹ️ ${apiName} is already active`,
            keyboard: getBackKeyboard()
        };
    }

    // Check if target API is healthy
    const health = await checkAPIHealth(apiId, env);
    if (!health.healthy) {
        return {
            text: `⚠️ <b>Warning:</b> ${API_NAMES[apiId as keyof typeof API_NAMES]} appears unhealthy!\n\n` +
                `Status: ${health.status}\n` +
                `Response: ${health.responseTime}ms\n\n` +
                `Do you want to switch anyway?`,
            keyboard: [
                [
                    { text: '✅ Yes, Switch Anyway', callback_data: `confirm_switch_${apiId}` },
                    { text: '❌ Cancel', callback_data: 'cmd_switch_menu' }
                ]
            ]
        };
    }

    return await performSwitch(apiId, env);
}

async function forceSwitch(apiId: string, env: Env): Promise<CommandResponse> {
    return await performSwitch(apiId, env);
}

async function performSwitch(apiId: string, env: Env): Promise<CommandResponse> {
    const config = await getConfig(env);
    const oldApiId = config.activeApiId;
    config.activeApiId = apiId;
    config.lastSwitchTime = new Date().toISOString();

    await addSwitchHistory(env, {
        from: oldApiId,
        to: apiId,
        timestamp: new Date().toISOString(),
        reason: 'Manual switch via Telegram',
        triggeredBy: 'admin'
    });

    await updateConfig(env, config);

    const oldApiName = API_NAMES[oldApiId as keyof typeof API_NAMES];
    const newApiName = API_NAMES[apiId as keyof typeof API_NAMES];

    return {
        text: `✅ <b>API Switched Successfully</b>\n\n` +
            `From: ${oldApiName}\n` +
            `To: ${newApiName}\n` +
            `Time: ${new Date().toLocaleString()}\n\n` +
            `🌐 Users will now use ${newApiName}`,
        keyboard: [
            [
                { text: '📊 View Status', callback_data: 'cmd_status' },
                { text: '🔍 Health Check', callback_data: 'cmd_check' }
            ],
            [{ text: '⬅️ Back to Menu', callback_data: 'cmd_menu' }]
        ]
    };
}

async function getDetailedReport(env: Env): Promise<CommandResponse> {
    const config = await getConfig(env);
    const results = await checkAllAPIs(env);

    let message = '📊 <b>Detailed API Report</b>\n\n';
    message += `🟢 <b>Active:</b> ${API_NAMES[config.activeApiId as keyof typeof API_NAMES] || config.activeApiId}\n\n`;

    message += '<b>All APIs Health:</b>\n\n';
    for (const result of results) {
        const apiName = API_NAMES[result.apiId as keyof typeof API_NAMES] || result.apiId;
        const stats = config.apiStats[result.apiId] || {};

        message += `${result.healthy ? '✅' : '❌'} <b>${apiName}</b>\n`;
        message += `   Current: ${result.status} (${result.responseTime}ms)\n`;
        message += `   Success: ${stats.successCount || 0} | Errors: ${stats.errorCount || 0}\n`;
        message += `   Rate: ${calculateSuccessRate(stats)}%\n`;
        message += `   Last Check: ${stats.lastHealthCheck ? new Date(stats.lastHealthCheck).toLocaleString() : 'Never'}\n\n`;
    }

    // Recent switches
    if (config.switchHistory.length > 0) {
        message += '<b>Recent Switches:</b>\n';
        const recent = config.switchHistory.slice(-3).reverse();
        for (const sw of recent) {
            const fromName = API_NAMES[sw.from as keyof typeof API_NAMES] || sw.from;
            const toName = API_NAMES[sw.to as keyof typeof API_NAMES] || sw.to;
            message += `• ${fromName} → ${toName}\n`;
            message += `  ${new Date(sw.timestamp).toLocaleString()}\n`;
        }
    }

    return {
        text: message,
        keyboard: getBackKeyboard()
    };
}

async function getStats(env: Env): Promise<CommandResponse> {
    const config = await getConfig(env);

    let message = '📈 <b>API Usage Statistics</b>\n\n';

    for (const apiId of API_IDS) {
        const stats = config.apiStats[apiId] || {};
        const total = (stats.successCount || 0) + (stats.errorCount || 0);
        const apiName = API_NAMES[apiId as keyof typeof API_NAMES] || apiId;

        message += `<b>${apiName}</b>\n`;
        message += `   Total Requests: ${total}\n`;
        message += `   Success: ${stats.successCount || 0} (${calculateSuccessRate(stats)}%)\n`;
        message += `   Errors: ${stats.errorCount || 0}\n`;
        message += `   Avg Response: ${stats.avgResponseTime || 0}ms\n\n`;
    }

    return {
        text: message,
        keyboard: getBackKeyboard()
    };
}

function calculateSuccessRate(stats: any): number {
    if (!stats) return 0;
    const total = (stats.successCount || 0) + (stats.errorCount || 0);
    if (total === 0) return 0;
    return Math.round((stats.successCount / total) * 100);
}

function getHealthEmoji(status: string): string {
    switch (status) {
        case 'healthy': return '🟢';
        case 'unhealthy': return '🔴';
        default: return '🟡';
    }
}
