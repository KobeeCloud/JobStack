type EmployerNotificationInput = {
  to: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string | null;
  cvUrl?: string | null;
  coverLetter?: string | null;
};

export async function sendEmployerNotification(input: EmployerNotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { skipped: true } as const;
  }

  const from = process.env.RESEND_FROM_EMAIL || 'JobStack <no-reply@jobstack.pl>';
  const subject = `Nowa aplikacja: ${input.jobTitle}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 8px;">Nowa aplikacja na ofertę</h2>
      <p><strong>Stanowisko:</strong> ${input.jobTitle}</p>
      <p><strong>Firma:</strong> ${input.companyName}</p>
      <hr style="margin: 16px 0;" />
      <p><strong>Kandydat:</strong> ${input.candidateName}</p>
      <p><strong>Email:</strong> <a href="mailto:${input.candidateEmail}">${input.candidateEmail}</a></p>
      ${input.candidatePhone ? `<p><strong>Telefon:</strong> ${input.candidatePhone}</p>` : ''}
      ${input.cvUrl ? `<p><strong>CV:</strong> <a href="${input.cvUrl}" target="_blank">Pobierz</a></p>` : ''}
      ${input.coverLetter ? `<p><strong>List motywacyjny:</strong><br/>${input.coverLetter.replace(/\n/g, '<br/>')}</p>` : ''}
    </div>
  `;

  const text = `Nowa aplikacja na ofertę: ${input.jobTitle}\nFirma: ${input.companyName}\nKandydat: ${input.candidateName}\nEmail: ${input.candidateEmail}${input.candidatePhone ? `\nTelefon: ${input.candidatePhone}` : ''}${input.cvUrl ? `\nCV: ${input.cvUrl}` : ''}${input.coverLetter ? `\n\nList motywacyjny:\n${input.coverLetter}` : ''}`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject,
      html,
      text,
      reply_to: input.candidateEmail,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any)?.error || 'Failed to send email');
  }

  return { sent: true } as const;
}
