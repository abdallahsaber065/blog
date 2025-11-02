// Code execution tool
import { CodeExecutionResult } from '../types';

/**
 * Create code execution tool configuration
 * 
 * Enables the model to write and execute Python code to solve problems,
 * perform calculations, or generate examples.
 * 
 * @returns Tool configuration object for code execution
 * 
 * @example
 * ```typescript
 * const tools = [createCodeExecutionTool()];
 * const result = await model.generateContent({
 *   contents: 'Calculate the factorial of 20',
 *   tools
 * });
 * ```
 */
export function createCodeExecutionTool() {
    return {
        codeExecution: {}
    };
}

/**
 * Parse code execution results from model response
 * 
 * @param response - The model response containing code execution
 * @returns Array of code execution results
 * 
 * @example
 * ```typescript
 * const results = parseCodeExecutionResults(response);
 * results.forEach(result => {
 *   console.log('Output:', result.output);
 *   console.log('Success:', result.outcome === 'success');
 * });
 * ```
 */
export function parseCodeExecutionResults(response: any): CodeExecutionResult[] {
    const results: CodeExecutionResult[] = [];

    if (!response.candidates) {
        return results;
    }

    for (const candidate of response.candidates) {
        if (!candidate.content?.parts) continue;

        for (const part of candidate.content.parts) {
            if (part.executableCode) {
                // Found code that was executed
                const language = part.executableCode.language || 'python';
                const code = part.executableCode.code;

                results.push({
                    output: `[${language}]\n${code}`,
                    outcome: 'success'
                });
            }

            if (part.codeExecutionResult) {
                // Found execution result
                results.push({
                    output: part.codeExecutionResult.output || '',
                    outcome: part.codeExecutionResult.outcome === 'OUTCOME_OK' ? 'success' : 'error'
                });
            }
        }
    }

    return results;
}

/**
 * Format code execution results for display
 * 
 * @param results - Array of code execution results
 * @returns Formatted markdown string with code and outputs
 * 
 * @example
 * ```typescript
 * const markdown = formatCodeExecutionResults(results);
 * console.log(markdown);
 * ```
 */
export function formatCodeExecutionResults(results: CodeExecutionResult[]): string {
    if (results.length === 0) {
        return '';
    }

    const formatted = results.map((result, index) => {
        const status = result.outcome === 'success' ? '✅' : '❌';
        return `### Execution ${index + 1} ${status}\n\n\`\`\`\n${result.output}\n\`\`\``;
    }).join('\n\n');

    return `\n\n## Code Execution Results\n\n${formatted}`;
}

/**
 * Check if a response contains code execution
 * 
 * @param response - The model response
 * @returns True if response contains code execution results
 */
export function hasCodeExecution(response: any): boolean {
    if (!response.candidates) return false;

    for (const candidate of response.candidates) {
        if (!candidate.content?.parts) continue;

        for (const part of candidate.content.parts) {
            if (part.executableCode || part.codeExecutionResult) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Extract only successful execution outputs
 * 
 * @param results - Array of code execution results
 * @returns Array of successful outputs
 */
export function getSuccessfulExecutions(results: CodeExecutionResult[]): string[] {
    return results
        .filter(r => r.outcome === 'success')
        .map(r => r.output);
}

/**
 * Extract only failed execution outputs
 * 
 * @param results - Array of code execution results
 * @returns Array of error outputs
 */
export function getFailedExecutions(results: CodeExecutionResult[]): string[] {
    return results
        .filter(r => r.outcome === 'error')
        .map(r => r.output);
}

/**
 * Create a summary of code executions
 * 
 * @param response - The model response
 * @returns Summary object with execution statistics
 */
export function createExecutionSummary(response: any) {
    const results = parseCodeExecutionResults(response);
    const successful = getSuccessfulExecutions(results);
    const failed = getFailedExecutions(results);

    return {
        hasExecution: hasCodeExecution(response),
        totalExecutions: results.length,
        successfulExecutions: successful.length,
        failedExecutions: failed.length,
        results
    };
}
