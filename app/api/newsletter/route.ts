import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Reject emails longer than the RFC 5321 maximum
const MAX_EMAIL_LENGTH = 254;

export async function POST(req: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email } = await req.json();

    if (
      !email ||
      typeof email !== "string" ||
      email.length > MAX_EMAIL_LENGTH ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    // If Resend Audience ID is configured, add contact to the list
    if (process.env.RESEND_AUDIENCE_ID) {
      await resend.contacts.create({
        email,
        audienceId: process.env.RESEND_AUDIENCE_ID,
        unsubscribed: false,
      });
    }

    // Welcome email to subscriber
    await resend.emails.send({
      from: "Sede do Movimento <noreply@sededomovimento.art>",
      to: email,
      subject: "Bem-vindo(a) à nossa newsletter!",
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #111;">
          <h1 style="font-size: 22px; font-weight: 800; margin-bottom: 12px; color: #6A00FF;">
            Você está dentro! 🎉
          </h1>
          <p style="font-size: 15px; line-height: 1.6; color: #444; margin-bottom: 20px;">
            Obrigado por se inscrever na newsletter da <strong>Sede do Movimento</strong>.
            A partir de agora você receberá novidades sobre espetáculos, cursos, eventos e conteúdo exclusivo sobre o mundo das artes cênicas.
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #444; margin-bottom: 32px;">
            Fique de olho na sua caixa de entrada — a próxima novidade vem aí!
          </p>
          <a href="https://sededomovimento.art" style="display: inline-block; background: #6A00FF; color: #fff; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 9999px; text-decoration: none;">
            Visitar o site
          </a>
          <p style="font-size: 11px; color: #aaa; margin-top: 32px;">
            Você se inscreveu em sededomovimento.art. Para cancelar a inscrição, responda este e-mail com "Cancelar".
          </p>
        </div>
      `,
    });

    // Admin notification
    const adminEmail = process.env.RESEND_TO_EMAIL;
    if (adminEmail) {
      await resend.emails.send({
        from: "Sede do Movimento <noreply@sededomovimento.art>",
        to: adminEmail,
        subject: `Nova inscrição na newsletter: ${email}`,
        html: `<p>Novo inscrito na newsletter: <strong>${email}</strong></p>`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter]", err);
    return NextResponse.json({ error: "Erro ao processar inscrição." }, { status: 500 });
  }
}
