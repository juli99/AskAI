import logging
from email.message import EmailMessage

import aiosmtplib

from app.config import settings

logger = logging.getLogger(__name__)


class EmailNotConfiguredError(RuntimeError):
    pass


async def send_email(to_address: str, subject: str, plain_body: str, html_body: str) -> None:
    if not settings.smtp_user or not settings.smtp_password:
        raise EmailNotConfiguredError("SMTP_USER and SMTP_PASSWORD must be set in .env")

    msg = EmailMessage()
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg["To"] = to_address
    msg["Subject"] = subject
    msg.set_content(plain_body)
    msg.add_alternative(html_body, subtype="html")

    await aiosmtplib.send(
        msg,
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        username=settings.smtp_user,
        password=settings.smtp_password,
        start_tls=True,
    )


async def send_verification_code(to_address: str, display_name: str, code: str) -> None:
    subject = f"AskAI verification code: {code}"
    plain = (
        f"Hi {display_name},\n\n"
        f"Your AskAI verification code is: {code}\n\n"
        f"This code expires in {settings.verification_code_ttl_minutes} minutes.\n"
        "If you didn't request this, please ignore this email.\n"
    )
    html = f"""\
<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f8fafc;padding:24px;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <h2 style="margin:0 0 16px;color:#0f172a;">AskAI verification</h2>
    <p style="color:#334155;margin:0 0 16px;">Hi {display_name},</p>
    <p style="color:#334155;margin:0 0 16px;">Your verification code is:</p>
    <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#2563eb;text-align:center;padding:16px;background:#eff6ff;border-radius:8px;">{code}</div>
    <p style="color:#64748b;margin:16px 0 0;font-size:13px;">This code expires in {settings.verification_code_ttl_minutes} minutes. If you didn't request this, please ignore this email.</p>
  </div>
</body></html>"""
    try:
        await send_email(to_address, subject, plain, html)
    except Exception:
        logger.exception("Failed to send verification email to %s", to_address)
        raise
