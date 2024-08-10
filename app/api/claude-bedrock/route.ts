import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from "@aws-sdk/client-bedrock-agent-runtime";

export async function POST(req: Request): Promise<Response> {
  // Initialize the Bedrock Agent Runtime client
  const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });

  try {
    // Parse the request body
    const { message }: { message: string } = await req.json();
    console.log(`Received message: ${message}`);

    if (!message) {
      return new Response(JSON.stringify({ error: "No message provided" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Define the input for the RetrieveAndGenerateCommand
    const input: any = {
      input: { text: message },
      retrieveAndGenerateConfiguration: {
        type: "KNOWLEDGE_BASE", // or "EXTERNAL_SOURCES"
        knowledgeBaseConfiguration: {
          knowledgeBaseId: "TO2LMBBASW", // Replace with your actual Knowledge Base ID
          modelArn: "anthropic.claude-3-haiku-20240307-v1:0", // Replace with your model ARN
          retrievalConfiguration: {
            vectorSearchConfiguration: {
              numberOfResults: 5, // Number of results to retrieve
              overrideSearchType: "SEMANTIC"
            }
          },
          generationConfiguration: {
            promptTemplate: {
              // Include $search_results$ to integrate the search results into the prompt
              textPromptTemplate: "Use this information to give me a response based on the user's query: $search_results$. Be concise and keep the message close to 20 words."
            },
            inferenceConfig: {
              textInferenceConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxTokens: 512,
                // stopSequences: ["\n"] 
              }
            },
          },
          orchestrationConfiguration: {
            queryTransformationConfiguration: {
              type: "QUERY_DECOMPOSITION", 
            }
          }
        },
      },
    };

    // Create the command
    const command = new RetrieveAndGenerateCommand(input);

    // Send the command to the Bedrock Agent Runtime and wait for the response
    const response = await client.send(command);

    // Extract the response text and citations
    const responseText = response.output?.text ?? "No response from model";
    const citations = response.citations ?? [];

    // Respond with the output and citations
    return new Response(JSON.stringify({ response: responseText, citations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.log(`ERROR: Can't invoke Retrieve and Generate. Reason: ${err.message || err}`);
    return new Response(JSON.stringify({ error: `Error invoking Retrieve and Generate: ${err.message || err}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
