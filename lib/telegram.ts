type TelegramInlineButton = {
  text: string
  url?: string
  callback_data?: string
}

export type TelegramNotificationPayload = {
  title: string
  message: string
  projectToken?: string
  buttons?: TelegramInlineButton[][]
}

export async function sendTelegramNotification({
  title,
  message,
  projectToken,
  buttons,
}: TelegramNotificationPayload): Promise<{ success: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('[Telegram Bot] Skipped notification: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in environment variables.')
    return { success: false, error: 'Telegram credentials missing' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const defaultButtons: TelegramInlineButton[][] = projectToken
    ? [
        [
          { text: '📂 Admin дээр харах', url: `${siteUrl}/admin/projects/${projectToken}` },
          { text: '👀 Client харагдац', url: `${siteUrl}/client/${projectToken}` },
        ],
      ]
    : []

  const replyMarkup = buttons || defaultButtons

  const formattedText = `<b>${title}</b>\n\n${message}`

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedText,
        parse_mode: 'HTML',
        reply_markup: replyMarkup.length > 0 ? { inline_keyboard: replyMarkup } : undefined,
      }),
    })

    const data = await res.json()
    if (!data.ok) {
      console.error('[Telegram Bot Error]', data.description)
      return { success: false, error: data.description }
    }

    return { success: true }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Telegram Bot Exception]', errorMsg)
    return { success: false, error: errorMsg }
  }
}
