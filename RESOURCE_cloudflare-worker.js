
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // Handle browser security checks
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: corsHeaders }
      );
    }

    try {
      // Retrieve secure API key
      const apiKey = env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error("OpenAI API key is missing.");
      }

      // Get conversation history
      const userInput = await request.json();
      const messages = userInput.messages;

      if (!Array.isArray(messages) || messages.length === 0) {
        return new Response(
          JSON.stringify({ error: "Invalid messages." }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Connect to OpenAI
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: messages,
            max_completion_tokens: 300
          })
        }
      );

      const data = await response.json();

      return new Response(
        JSON.stringify(data),
        {
          status: response.status,
          headers: corsHeaders
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Unable to process your request.",
          details: error.message
        }),
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }
  }
};

