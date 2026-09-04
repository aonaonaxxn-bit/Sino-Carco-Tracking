exports.handler = async function (event) {

  // รับเฉพาะ POST จาก LINE
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 200,
      body: "OK"
    };
  }

  // URL ของ Google Apps Script
  const gasUrl = process.env.GAS_WEBHOOK_URL;

  if (!gasUrl) {
    console.error("GAS_WEBHOOK_URL is not configured");

    return {
      statusCode: 500,
      body: "GAS_WEBHOOK_URL is not configured"
    };
  }

  try {

    const headers = {
      "Content-Type":
        event.headers["content-type"] ||
        "application/json"
    };

    // ส่ง LINE signature ต่อไปด้วย
    if (event.headers["x-line-signature"]) {
      headers["x-line-signature"] =
        event.headers["x-line-signature"];
    }

    const body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : event.body || "";

    // ส่งต่อไป Google Apps Script
    const response = await fetch(gasUrl, {
      method: "POST",
      headers: headers,
      body: body
    });

    const text = await response.text();

    console.log("Google Apps Script status:", response.status);
    console.log("Google Apps Script response:", text);

    // ให้ LINE ได้ 200 OK
    return {
      statusCode: 200,
      body: "OK"
    };

  } catch (error) {

    console.error("Webhook proxy error:", error);

    return {
      statusCode: 500,
      body: "Webhook proxy error"
    };
  }
};
