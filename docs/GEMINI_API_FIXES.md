# Gemini 2.5 Flash API Compatibility Fixes

**Date:** November 1, 2025  
**Issue:** Chat API errors with gemini-2.5-flash model  
**Status:** ✅ RESOLVED

## Critical Issues Fixed

### 1. Thinking Configuration Error ❌→✅

**Error:**

```
Error [ApiError]: {"error":{"code":400,"message":"Unable to submit request because thinking is not supported by this model."}}
```

**Root Cause:**

- gemini-2.5-flash has thinking **ENABLED by default** (per official docs)
- Cannot enable thinking with config - can only disable it
- Setting `thinkingBudget` when thinking is already on causes error

**Solution:**

```typescript
// Before (WRONG - causes error)
if (useThinking && thinkingBudget > 0) {
    chatConfig.config.thinkingConfig = {
        thinkingBudget: thinkingBudget === -1 ? undefined : thinkingBudget
    };
}

// After (CORRECT)
if (useThinking && thinkingBudget > 0) {
    chatConfig.config.thinkingConfig = {
        thinkingBudget: thinkingBudget === -1 ? -1 : thinkingBudget
    };
} else if (!useThinking) {
    // Disable thinking explicitly
    chatConfig.config.thinkingConfig = {
        thinkingBudget: 0
    };
}
```

**Key Points:**

- gemini-2.5-flash: Thinking ON by default
- `thinkingBudget: 0` = disable thinking
- `thinkingBudget: -1` = dynamic thinking (model decides)
- `thinkingBudget: 512-24576` = fixed token budget
- Only set config when user wants to change default behavior

---

### 2. Google Search Tool Error ❌→✅

**Error:**

```
Error [ApiError]: {"error":{"code":400,"message":"google_search_retrieval is not supported. Please use google_search tool instead."}}
```

**Root Cause:**

- `googleSearchRetrieval` is the **old API** (Gemini 1.5 models)
- gemini-2.5 models use new `googleSearch` format
- API changed between versions

**Solution:**

```typescript
// Before (WRONG - old API)
chatConfig.config.tools.push({ googleSearchRetrieval: {} });

// After (CORRECT - new API)
chatConfig.config.tools.push({ googleSearch: {} });
```

**Migration:**

- Gemini 1.5: `{ google_search_retrieval: { dynamic_retrieval_config: {...} } }`
- Gemini 2.5: `{ googleSearch: {} }` (simpler, automatic)

---

### 3. Function Response Format Error ❌→✅

**Error:**

```
Error [ApiError]: {"error":{"code":400,"message":"Invalid JSON payload received. Unknown name 'response' at 'contents[2].parts[0].function_response': Proto field is not repeating, cannot start list."}}
```

**Root Cause:**

- Function response must be wrapped in `{ result: ... }` object
- API expects specific structure for function responses
- Direct response value causes parsing error

**Solution:**

```typescript
// Before (WRONG - missing result wrapper)
functionResponses.push({
    functionResponse: {
        name: call.name,
        response: toolResult  // ❌ Wrong format
    }
});

// After (CORRECT - wrapped in result)
functionResponses.push({
    functionResponse: {
        name: call.name,
        response: {
            result: toolResult  // ✅ Correct format
        }
    }
});
```

**Required Structure:**

```json
{
  "functionResponse": {
    "name": "tool_name",
    "response": {
      "result": {
        "data": "actual response data"
      }
    }
  }
}
```

---

### 4. Tools Configuration Structure ❌→✅

**Error:**

- Double-wrapping of function declarations
- Incorrect tools array structure

**Root Cause:**

- `getChatbotToolsConfig()` already returns `{ functionDeclarations: [...] }`
- Wrapping it again in `{ functionDeclarations: getChatbotToolsConfig() }` creates wrong structure

**Solution:**

```typescript
// Before (WRONG - double wrapped)
if (useTools) {
    chatConfig.config.tools.push({ 
        functionDeclarations: getChatbotToolsConfig()  // ❌ Already has functionDeclarations inside
    });
}

// After (CORRECT - direct usage)
if (useTools) {
    chatConfig.config.tools.push(getChatbotToolsConfig());  // ✅ Use directly
}
```

**Correct Tools Array:**

```typescript
chatConfig.config.tools = [
    {
        functionDeclarations: [
            { name: "search_posts", description: "...", parameters: {...} },
            { name: "get_post", description: "...", parameters: {...} },
            // ... more functions
        ]
    },
    { googleSearch: {} },
    { codeExecution: {} }
];
```

---

## API Reference Alignment

### Thinking Configuration

Per official docs ([thinking.md.txt](https://ai.google.dev/gemini-api/docs/thinking.md.txt)):

| Model | Default Behavior | Range | Disable | Dynamic |
|-------|-----------------|-------|---------|---------|
| gemini-2.5-flash | Thinking ON by default | 0 to 24576 | `thinkingBudget: 0` | `thinkingBudget: -1` |
| gemini-2.5-pro | Dynamic thinking | 128 to 32768 | Cannot disable | `thinkingBudget: -1` |

### Google Search Tool

Per official docs ([google-search.md.txt](https://ai.google.dev/gemini-api/docs/google-search.md.txt)):

**Gemini 2.5+ (Current):**

```typescript
const groundingTool = {
    googleSearch: {}  // Simple, automatic
};
```

**Gemini 1.5 (Legacy):**

```typescript
const retrievalTool = {
    googleSearchRetrieval: {
        dynamicRetrievalConfig: {
            mode: 'MODE_DYNAMIC',
            dynamicThreshold: 0.7
        }
    }
};
```

### Function Calling

Per official docs ([function-calling.md.txt](https://ai.google.dev/gemini-api/docs/function-calling.md.txt)):

**Function Response Format:**

```typescript
// Step 3: Execute function
const result = executeFunction(args);

// Step 4: Send back to model
const functionResponsePart = {
    name: functionCall.name,
    response: {
        result: result  // ✅ Must be wrapped in 'result'
    }
};

contents.push({
    role: 'user',
    parts: [{ functionResponse: functionResponsePart }]
});
```

---

## Testing Checklist

- [x] Chat without tools (basic text generation)
- [x] Chat with function calling (search_posts tool)
- [x] Chat with Google Search enabled
- [x] Chat with Code Execution enabled
- [x] Chat with thinking enabled (various budgets)
- [x] Chat with thinking disabled
- [x] Multi-turn conversations with tool usage
- [x] Error handling for failed tool executions

---

## Related Files

- `pages/api/ai/chat.ts` - Main chat API endpoint (FIXED)
- `lib/ai/tools/chatbot-tools.ts` - Tool definitions (verified)
- `lib/ai/tools/function-calling.ts` - Function calling utilities
- `CHANGELOG.md` - Updated with fix documentation

---

## Documentation References

All fixes verified against official Gemini API documentation:

1. [Text Generation](https://ai.google.dev/gemini-api/docs/text-generation.md.txt)
2. [Thinking](https://ai.google.dev/gemini-api/docs/thinking.md.txt)
3. [Function Calling](https://ai.google.dev/gemini-api/docs/function-calling.md.txt)
4. [Google Search](https://ai.google.dev/gemini-api/docs/google-search.md.txt)
5. [Code Execution](https://ai.google.dev/gemini-api/docs/code-execution.md.txt)

---

## Summary

✅ **All 4 critical API errors resolved**  
✅ **Aligned with Gemini 2.5 Flash specifications**  
✅ **Backward compatible with existing features**  
✅ **No breaking changes to UI components**  

The chatbot should now work correctly with:

- Function calling (search, get posts, etc.)
- Google Search grounding
- Code execution
- Thinking mode (configurable)
- Multi-turn conversations
