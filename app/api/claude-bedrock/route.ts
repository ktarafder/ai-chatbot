import { BedrockRuntimeClient, ConverseCommand, ConversationRole, Message } from "@aws-sdk/client-bedrock-runtime";

export async function POST(req: Request): Promise<Response> {
  // Create a Bedrock Runtime client in the AWS Region you want to use.
  const client = new BedrockRuntimeClient({ region: "us-east-1" });

  // Set the model ID, e.g., Claude 3 Haiku.
  const modelId = "anthropic.claude-3-haiku-20240307-v1:0";

  try {
    // Parse the request body and ensure it's typed
    const { message }: { message: string } = await req.json();
    console.log(`Received message: ${message}`);

    if (!message) {
      return new Response(JSON.stringify({ error: "No message provided" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Define the conversation with the correct types
    const conversation: Message[] = [
      {
        role: "user" as ConversationRole,
        content: [{ text: message }],
      },
    ];

    // Create a command with the model ID, the message, and a basic configuration.
    const command = new ConverseCommand({
      modelId,
      messages: conversation,
      inferenceConfig: { maxTokens: 512, temperature: 0.5, topP: 0.9 },
    });

    // Send the command to the model and wait for the response
    const response = await client.send(command);

    // Safely extract the response text.
    const responseText = response.output?.message?.content?.[0]?.text ?? "No response from model";

    // Respond with the output from Claude
    return new Response(JSON.stringify({ response: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.log(`ERROR: Can't invoke '${modelId}'. Reason: ${err.message || err}`);
    return new Response(JSON.stringify({ error: `Error invoking model: ${err.message || err}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
