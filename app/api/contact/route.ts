import { Resend } from "resend"
import { NextResponse } from "next/server"
import { createProject } from "@/lib/db"
import { sendTelegramNotification } from "@/lib/telegram"

const resend = new Resend(process.env.RESEND_API_KEY || "missing_key")

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"
const TO_EMAIL = process.env.RESEND_TO_EMAIL ?? "baysaauskhuu@gmail.com"

export async function POST(req: Request) {
  try {
    const { name, email, project, budget, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1. Create a Project Lead in Studio Store
    const newProject = await createProject({
      name: `${name} — ${project || 'Дизайны төсөл'}`,
      company: name,
      contactName: name,
      email,
      type: project || 'Brand Identity',
      status: 'lead',
    })

    // 2. Dispatch Real-time Telegram Alert to Designer
    await sendTelegramNotification({
      title: '📩 Портфолио сайтаас шинэ хүсэлт ирлээ!',
      message: `<b>Нэр:</b> ${name}\n<b>И-мэйл:</b> ${email}\n<b>Төслийн төрөл:</b> ${project || 'Тодорхойгүй'}\n<b>Төсөв:</b> ${budget || 'Ярилцах'}\n<b>Зурвас:</b> "${message}"`,
      projectToken: newProject.token,
    })

    // 3. Send Email via Resend if configured
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "missing_key") {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: TO_EMAIL,
          replyTo: email,
          subject: `New inquiry from ${name} (${project || 'Design'})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
              <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 24px;">New project inquiry</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #888; font-size: 12px; text-transform: uppercase; width: 130px;">Name</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 15px;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #888; font-size: 12px; text-transform: uppercase;">Email</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 15px;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #888; font-size: 12px; text-transform: uppercase;">Project type</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 15px;">${project || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #888; font-size: 12px; text-transform: uppercase;">Token Link</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 15px;"><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/client/brief/${newProject.token}">Start AI Brief</a></td>
                </tr>
              </table>
              <p style="font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.warn("[Resend warning]", emailErr)
      }
    }

    return NextResponse.json({
      success: true,
      projectToken: newProject.token,
      briefUrl: `/client/brief/${newProject.token}`,
    })
  } catch (err) {
    console.error("[Contact API error]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
