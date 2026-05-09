exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let name, email;
  try {
    const body = JSON.parse(event.body);
    name = body.name || "";
    email = body.email || "";
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid body" }) };
  }

  if (!email || !email.includes("@")) {
    return { statusCode: 400, body: JSON.stringify({ error: "Valid email required" }) };
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key not configured" }) };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        attributes: { FIRSTNAME: name.split(" ")[0] },
        listIds: [5],
        updateEnabled: true,
      }),
    });

    const text = await response.text();

    if (response.ok || response.status === 204) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } else {
      console.error("Brevo error:", response.status, text);
      return { statusCode: 500, body: JSON.stringify({ error: "Brevo error", detail: text }) };
    }
  } catch (err) {
    console.error("Network error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
