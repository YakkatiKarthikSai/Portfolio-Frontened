import html
import json
import os
import urllib.error
import urllib.request

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))


app = FastAPI(
    title="Karthik Sai Yakkati Portfolio API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ContactMessage(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(default="", max_length=30)
    subject: str = Field(default="", max_length=200)
    message: str = Field(..., min_length=10, max_length=3000)


@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "service": "portfolio-api"
    }


@app.post("/api/contact")
async def contact(data: ContactMessage):

    api_key = os.getenv("RESEND_API_KEY")
    receiver_email = os.getenv("CONTACT_EMAIL")

    if not api_key or not receiver_email:
        raise HTTPException(
            status_code=500,
            detail="Email service is not configured."
        )

    name = html.escape(data.name)
    email = html.escape(str(data.email))
    phone = html.escape(data.phone) if data.phone else "Not provided"
    subject = html.escape(data.subject) if data.subject else "No subject"
    message = html.escape(data.message).replace("\n", "<br>")

    email_payload = {
        "from": "Portfolio Contact <onboarding@resend.dev>",
        "to": [receiver_email],
        "subject": f"Portfolio Contact — {subject}",
        "reply_to": str(data.email),
        "html": f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 650px;
            margin: 0 auto;
            padding: 25px;
            color: #222;
        ">

            <h2>New Portfolio Contact</h2>

            <p>
                You received a new message through your portfolio website.
            </p>

            <hr>

            <p>
                <strong>Name:</strong><br>
                {name}
            </p>

            <p>
                <strong>Email:</strong><br>
                {email}
            </p>

            <p>
                <strong>Phone:</strong><br>
                {phone}
            </p>

            <p>
                <strong>Subject:</strong><br>
                {subject}
            </p>

            <p>
                <strong>Message:</strong><br>
                {message}
            </p>

            <hr>

            <p style="color:#777;font-size:13px;">
                Sent from Karthik Sai Yakkati's portfolio website.
            </p>

        </div>
        """
    }

    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(email_payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Karthik-Sai-Yakkati-Portfolio/1.0",
        },
        method="POST",
    )

    try:

        with urllib.request.urlopen(request, timeout=10) as response:
            result = json.loads(
                response.read().decode("utf-8")
            )

        return {
            "success": True,
            "message": "Your message has been sent successfully.",
            "id": result.get("id")
        }

    except urllib.error.HTTPError as error:

        error_body = error.read().decode(
            "utf-8",
            errors="ignore"
        )

        print("Resend API error:", error_body)

        raise HTTPException(
            status_code=502,
            detail="Unable to deliver the message right now."
        )

    except urllib.error.URLError:

        raise HTTPException(
            status_code=502,
            detail="Email service is temporarily unavailable."
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Something went wrong while sending the message."
        )
