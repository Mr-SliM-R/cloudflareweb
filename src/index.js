// Cloudflare Worker entrypoint for Workers Static Assets.
// This handles dynamic API routes and lets Cloudflare serve the website files.

const services = new Set([
  "Security Assessment",
  "Cloud Architecture",
  "Compliance Readiness",
  "Incident Response"
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/status" && request.method === "GET") {
      return sendJson({
        ok: true,
        service: "SecureTech Solutions dynamic API",
        runtime: "Cloudflare Workers Static Assets",
        serverTime: new Date().toISOString(),
        colo: request.cf?.colo || "unknown"
      });
    }

    if (url.pathname === "/api/contact") {
      if (request.method === "POST") {
        return handleContactRequest(request);
      }

      return sendJson({ ok: false, message: "Use POST to submit the contact form." }, 405);
    }

    if (url.pathname.startsWith("/api/")) {
      return sendJson({ ok: false, message: "API route not found." }, 404);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleContactRequest(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return sendJson({ ok: false, message: "Please send JSON data." }, 415);
    }

    const body = await request.json();
    const submission = {
      name: cleanText(body.name, 80),
      email: cleanText(body.email, 120),
      service: cleanText(body.service, 80),
      message: cleanText(body.message, 1000)
    };

    const errors = validateSubmission(submission);

    if (Object.keys(errors).length > 0) {
      return sendJson({ ok: false, errors }, 400);
    }

    const requestId = crypto.randomUUID();
    const receivedAt = new Date().toISOString();

    console.log("SecureTech contact request", {
      requestId,
      receivedAt,
      name: submission.name,
      email: submission.email,
      service: submission.service,
      messageLength: submission.message.length
    });

    return sendJson({
      ok: true,
      requestId,
      receivedAt,
      message: "Thanks. Your request reached the Cloudflare Worker successfully."
    });
  } catch (error) {
    console.error("Contact request error", error);
    return sendJson({ ok: false, message: "The request could not be processed." }, 500);
  }
}

function validateSubmission(submission) {
  const errors = {};

  if (!submission.name) {
    errors.name = "Name is required.";
  }

  if (!submission.email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!submission.service) {
    errors.service = "Select a service.";
  } else if (!services.has(submission.service)) {
    errors.service = "Select one of the listed services.";
  }

  if (!submission.message) {
    errors.message = "Project details are required.";
  } else if (submission.message.length < 10) {
    errors.message = "Please add a little more detail.";
  }

  return errors;
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function sendJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}
