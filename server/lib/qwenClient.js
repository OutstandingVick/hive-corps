import "./env.js";

const DEFAULT_QWEN_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

function extractJson(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function getQwenConfig() {
  return {
    enabled: process.env.DEMO_MODE === "false" && Boolean(process.env.QWEN_API_KEY),
    baseUrl: process.env.QWEN_BASE_URL || DEFAULT_QWEN_BASE_URL,
    model: process.env.QWEN_MODEL || "qwen-max",
    timeoutMs: Number(process.env.QWEN_TIMEOUT_MS || 20000)
  };
}

export async function callQwenAgent({ agentName, system, input, schema }) {
  const config = getQwenConfig();
  if (!config.enabled) {
    return {
      ok: false,
      skipped: true,
      provider: "qwen-cloud",
      model: config.model,
      agentName,
      reason: "Qwen live mode is disabled. Set DEMO_MODE=false and QWEN_API_KEY to enable."
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.QWEN_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: [
              system,
              "Return concise JSON only. Do not include markdown.",
              schema ? `Expected JSON shape: ${JSON.stringify(schema)}` : ""
            ].filter(Boolean).join("\n")
          },
          {
            role: "user",
            content: JSON.stringify(input, null, 2)
          }
        ]
      }),
      signal: controller.signal
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        provider: "qwen-cloud",
        model: config.model,
        agentName,
        status: response.status,
        error: body.error?.message || body.message || "Qwen API request failed."
      };
    }

    const content = body.choices?.[0]?.message?.content || "";
    return {
      ok: true,
      provider: "qwen-cloud",
      model: config.model,
      agentName,
      content,
      json: extractJson(content),
      usage: body.usage || null
    };
  } catch (error) {
    return {
      ok: false,
      provider: "qwen-cloud",
      model: config.model,
      agentName,
      error: error.name === "AbortError" ? "Qwen API request timed out." : error.message
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function runQwenAgentLayer(context) {
  const config = getQwenConfig();
  const calls = [];

  const agentCalls = [
    {
      agentName: "Intake Agent",
      system: "You are the Intake Agent for Hive Corps. Extract customer quote request requirements for a B2B sales operation.",
      input: {
        request: context.request
      },
      schema: {
        summary: "string",
        extracted: {
          customer: "string",
          category: "string",
          quantity: "number",
          urgency: "string",
          missingFields: ["string"]
        }
      }
    },
    {
      agentName: "Planner Agent",
      system: "You are the Planner Agent for Hive Corps. Build a safe quote-to-response workflow plan with tool calls and approval checkpoints.",
      input: {
        request: context.request,
        customerMemories: context.customer?.memories,
        policies: context.customer?.approvedPolicies
      },
      schema: {
        summary: "string",
        plan: ["string"],
        approvalCheckpoints: ["string"]
      }
    },
    {
      agentName: "Risk Agent",
      system: "You are the Risk Agent for Hive Corps. Review quote risks around discount, margin, missing fields, and delivery promises.",
      input: {
        request: context.request,
        proposedDiscountRate: context.proposedDiscountRate,
        margin: context.margin,
        riskFlags: context.riskFlags,
        policies: context.customer?.approvedPolicies
      },
      schema: {
        summary: "string",
        approvalRequired: "boolean",
        riskFlags: ["string"],
        recommendation: "string"
      }
    },
    {
      agentName: "Quote Writer Agent",
      system: "You are the Quote Writer Agent for Hive Corps. Create a concise customer-ready B2B quote response.",
      input: {
        request: context.request,
        quote: context.quote
      },
      schema: {
        summary: "string",
        customerEmail: "string",
        internalRationale: "string"
      }
    },
    {
      agentName: "Learning Agent",
      system: "You are the Learning Agent for Hive Corps. Compare the agent proposal with human edits and propose controlled memory or policy updates.",
      input: {
        request: context.request,
        humanEdit: context.humanEdit,
        deterministicLearning: context.learning
      },
      schema: {
        summary: "string",
        proposals: ["string"],
        nextRunImpact: "string"
      }
    }
  ];

  for (const call of agentCalls) {
    calls.push(await callQwenAgent(call));
  }

  return {
    enabled: config.enabled,
    provider: "qwen-cloud",
    model: config.model,
    baseUrl: config.baseUrl,
    calls,
    successfulCalls: calls.filter((call) => call.ok).length,
    failedCalls: calls.filter((call) => !call.ok && !call.skipped).length
  };
}
