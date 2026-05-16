import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"
const TO_EMAIL   = process.env.RESEND_TO_EMAIL   ?? "baysaauskhuu@gmail.com"

export async function POST(req: Request) {
  try {
    const { name, email, project, budget, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New inquiry from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 24px;">New project inquiry</h2>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; width: 130px;">Name</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 15px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 15px;">${email}</td>
            </tr>
            ${project ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Project type</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 15px;">${project}</td>
            </tr>` : ""}
            ${budget ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Budget</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 15px;">${budget}</td>
            </tr>` : ""}
          </table>

          <div>
            <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Message</p>
            <p style="font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("[Resend error]", JSON.stringify(error))
      return NextResponse.json({ error: error.message ?? "Failed to send email" }, { status: 500 })
    }

    console.log("[Resend ok] id:", data?.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[Contact API error]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
