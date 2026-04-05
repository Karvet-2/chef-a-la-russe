import nodemailer from 'nodemailer'

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  )
}

function getTransporter() {
  if (!isSmtpConfigured()) return null
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const secure = process.env.SMTP_SECURE === '1' || port === 465
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const fromAddress = () =>
  process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@localhost'

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const transporter = getTransporter()
  if (!transporter) {
    throw new Error('SMTP не настроен (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)')
  }

  const subject = 'Сброс пароля — Chef a la Russe'
  const text = `Здравствуйте.\n\nДля установки нового пароля перейдите по ссылке (действует 1 час):\n${resetLink}\n\nЕсли вы не запрашивали сброс, проигнорируйте это письмо.\n`
  const html = `
    <p>Здравствуйте.</p>
    <p>Для установки нового пароля нажмите на кнопку ниже (ссылка действует 1 час).</p>
    <p><a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#0F172A;color:#fff;text-decoration:none;border-radius:8px;">Сбросить пароль</a></p>
    <p>Или скопируйте адрес в браузер:<br/><small>${resetLink}</small></p>
    <p>Если вы не запрашивали сброс пароля, удалите это письмо.</p>
  `

  await transporter.sendMail({
    from: fromAddress(),
    to,
    subject,
    text,
    html,
  })
}
