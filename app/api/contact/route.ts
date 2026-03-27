import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FORM_LABELS: Record<string, string> = {
  general: "Contato Geral",
  "trabalhe-conosco": "Trabalhe Conosco",
  ouvidoria: "Ouvidoria",
};

export async function POST(req: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await req.json();
    const { nome, email, telefone, assunto, mensagem, curriculo, formType } = body;

    if (!nome || !email || !assunto || !mensagem) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
    }

    const formLabel = FORM_LABELS[formType] ?? "Contato";
    const toEmail = process.env.RESEND_TO_EMAIL ?? "contato@sededomovimento.art";
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: #6A00FF; padding: 24px 32px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">Sede do Movimento — ${formLabel}</h1>
        </div>
        <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e5e5; border-top: none;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: 600; width: 140px; color: #555;">Nome</td><td style="padding: 8px 0;">${nome}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #555;">E-mail</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #6A00FF;">${email}</a></td></tr>
            ${telefone ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #555;">Telefone</td><td style="padding: 8px 0;">${telefone}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; font-weight: 600; color: #555;">Assunto</td><td style="padding: 8px 0;">${assunto}</td></tr>
            ${curriculo ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #555;">Currículo</td><td style="padding: 8px 0;"><a href="${curriculo}" style="color: #6A00FF;">${curriculo}</a></td></tr>` : ""}
          </table>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
          <p style="font-weight: 600; color: #555; margin: 0 0 8px;">Mensagem</p>
          <p style="margin: 0; line-height: 1.7; white-space: pre-line;">${mensagem}</p>
        </div>
        <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 16px;">
          Enviado via formulário em sededomovimento.art
        </p>
      </div>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `[${formLabel}] ${assunto} — ${nome}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao enviar. Tente novamente." }, { status: 500 });
  }
}
