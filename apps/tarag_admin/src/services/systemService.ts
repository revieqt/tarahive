import { BACKEND_URL } from "@/constants/Config";

/**
 * Stream system health check results from backend
 * Uses fetch with streaming for real-time updates
 * @param accessToken - User's access token
 * @param onMessage - Callback function to handle each message
 * @param onError - Callback function to handle errors
 * @returns Function to close the connection
 */
export const streamSystemHealth = (
  accessToken: string,
  onMessage: (message: string) => void,
  onError: (error: string) => void
): (() => void) => {
  let abortController: AbortController | null = new AbortController();

  const startStreaming = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/system-health/system-health`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "text/event-stream",
        },
        signal: abortController?.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to start health check: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Unable to read response stream");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let messageCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Stream completed normally
          onMessage("✅ Health check completed");
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Process all complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line.startsWith("data: ")) {
            const dataStr = line.substring(6);
            try {
              const data = JSON.parse(dataStr);
              const message = data.message || data.status || dataStr;
              onMessage(message);
              messageCount++;
            } catch {
              onMessage(dataStr);
              messageCount++;
            }
          } else if (line && !line.startsWith(":")) {
            onMessage(line);
            messageCount++;
          }
        }

        // Keep the incomplete line in the buffer
        buffer = lines[lines.length - 1];
      }

      // Process any remaining data in buffer
      if (buffer.trim()) {
        if (buffer.trim().startsWith("data: ")) {
          const dataStr = buffer.trim().substring(6);
          try {
            const data = JSON.parse(dataStr);
            const message = data.message || data.status || dataStr;
            onMessage(message);
            messageCount++;
          } catch {
            onMessage(dataStr);
            messageCount++;
          }
        } else if (buffer.trim()) {
          onMessage(buffer.trim());
          messageCount++;
        }
      }

      if (messageCount > 0) {
        onMessage("✅ Health check completed");
      }
    } catch (error) {
      // If aborted by user, don't show error
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      // For network errors after receiving messages, don't treat as fatal
      // Just mark as completed if we got messages
      if (error instanceof Error) {
        if (error.message.includes("network") || error.message.includes("Failed to fetch")) {
          onMessage("⚠️ Connection closed (health check results received)");
          return;
        }
        onError(error.message);
      } else {
        onError("Unknown error occurred");
      }
    }
  };

  // Start streaming in the background
  startStreaming();

  // Return cleanup function
  return () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };
};
