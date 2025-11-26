import OpenAI from "openai";
import 'dotenv/config'; // loads .env locally

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'messages'" });
    }

    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Call OpenAI Chat API
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo", // safer for testing
      messages,
      max_tokens: 500
    });

    // Always return a valid assistant message
    const assistant = completion.choices?.[0]?.message ?? {
      role: "assistant",
      content: "Sorry, no response from the assistant."
    };

    return res.status(200).json({ assistant });
  } catch (err) {
    console.error("OpenAI error:", err);

    // Friendly error message
    const errorMsg =
      err.code === "insufficient_quota"
        ? "OpenAI quota exceeded. Please try later."
        : "Error communicating with OpenAI API.";

    return res.status(500).json({
      assistant: { role: "assistant", content: errorMsg },
      error: errorMsg
    });
  }
}
