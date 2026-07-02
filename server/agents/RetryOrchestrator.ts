export class RetryOrchestrator {
  /**
   * Executes an async function with self-correction retries.
   * If the function throws an error or fails validation, it retries with feedback.
   */
  static async withRetry<T>(
    agentTask: (previousErrorFeedback?: string) => Promise<T>,
    validator: (result: T) => { isValid: boolean; error?: string },
    maxRetries: number = 3
  ): Promise<T> {
    let attempt = 1;
    let feedback = undefined;

    while (attempt <= maxRetries) {
      try {
        console.log(`[Retry Orchestrator] Attempt ${attempt}/${maxRetries}...`);
        const result = await agentTask(feedback);
        
        const validation = validator(result);
        if (validation.isValid) {
          if (attempt > 1) {
            console.log(`[Retry Orchestrator] Success after self-correction on attempt ${attempt}`);
          }
          return result;
        } else {
          throw new Error(`Validation failed: ${validation.error}`);
        }
      } catch (error: any) {
        console.warn(`[Retry Orchestrator] Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          console.error(`[Retry Orchestrator] Max retries reached. Failing.`);
          throw error;
        }
        
        // Provide feedback for the next LLM call
        feedback = `Your previous attempt failed with error: "${error.message}". Please review your reasoning and strictly follow the output schema.`;
        attempt++;
      }
    }
    
    throw new Error('Retry Orchestrator failed unexpectedly');
  }
}
