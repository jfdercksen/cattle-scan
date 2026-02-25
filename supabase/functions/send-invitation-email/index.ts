import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type InvitationEmailPayload = {
  to: string;
  company_name?: string | null;
  reference_id?: string | null;
  invitation_id?: string | null;
  listing_id?: string | null;
  type?: "new_user_invitation" | "existing_company_invitation" | "new_company_relationship";
  site_url?: string | null;
};

const getBaseUrl = (payload: InvitationEmailPayload) => {
  return (
    payload.site_url ||
    Deno.env.get("SITE_URL") ||
    Deno.env.get("PUBLIC_SITE_URL") ||
    "http://localhost:5173"
  );
};

const buildInvitationLink = (payload: InvitationEmailPayload) => {
  const baseUrl = getBaseUrl(payload);
  const invitationId = payload.invitation_id ?? "";

  if (payload.type === "new_user_invitation") {
    const emailParam = encodeURIComponent(payload.to);
    const invitationParam = invitationId ? `&invitation=${encodeURIComponent(invitationId)}` : "";
    return `${baseUrl}/invite-signup?email=${emailParam}${invitationParam}`;
  }

  return invitationId ? `${baseUrl}/seller/create-listing/${invitationId}` : `${baseUrl}/seller-dashboard`;
};

const buildEmailContent = (payload: InvitationEmailPayload) => {
  const companyName = payload.company_name || "a company";
  const reference = payload.reference_id ? `Reference: ${payload.reference_id}` : "";
  const inviteLink = buildInvitationLink(payload);

  const subject =
    payload.type === "new_user_invitation"
      ? `You're invited to join ${companyName}`
      : `New listing invitation from ${companyName}`;

  const intro =
    payload.type === "new_user_invitation"
      ? `You've been invited to join ${companyName} and complete a livestock listing.`
      : `You've been invited to complete a livestock listing for ${companyName}.`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>${subject}</h2>
      <p>${intro}</p>
      ${reference ? `<p><strong>${reference}</strong></p>` : ""}
      <p>
        <a href="${inviteLink}" style="display:inline-block; padding:10px 16px; background:#2563eb; color:#fff; text-decoration:none; border-radius:6px;">
          Open Invitation
        </a>
      </p>
      <p style="font-size: 12px; color: #6b7280;">If the button doesn't work, copy and paste this link: ${inviteLink}</p>
    </div>
  `;

  const text = `${intro}\n${reference}\nInvitation link: ${inviteLink}`.trim();

  return { subject, html, text };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as InvitationEmailPayload;

    if (!payload?.to) {
      return new Response(JSON.stringify({ error: "Missing recipient email." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");

    if (!resendApiKey || !fromEmail) {
      console.warn("Missing RESEND_API_KEY or RESEND_FROM_EMAIL.");
      return new Response(JSON.stringify({ ok: false, error: "Email service not configured." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html, text } = buildEmailContent(payload);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: payload.to,
        subject,
        html,
        text,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend error:", errorText);
      return new Response(JSON.stringify({ ok: false, error: errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await resendResponse.json();
    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-invitation-email error:", error);
    return new Response(JSON.stringify({ ok: false, error: "Unexpected error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
