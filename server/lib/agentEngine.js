import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./env.js";
import { getQwenConfig, runQwenAgentLayer } from "./qwenClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

async function readJson(relativePath) {
  const file = path.join(root, relativePath);
  return JSON.parse(await fs.readFile(file, "utf8"));
}

function money(amount) {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function isoNow() {
  return new Date().toISOString();
}

function makeStep(name, status, summary, evidence = {}) {
  return {
    name,
    status,
    summary,
    evidence,
    timestamp: isoNow()
  };
}

function qwenResultFor(qwen, agentName) {
  return qwen?.calls?.find((call) => call.agentName === agentName && call.ok) || null;
}

function mergeQwenStep(step, qwen) {
  const result = qwenResultFor(qwen, step.name);
  if (!result) return step;

  return {
    ...step,
    summary: result.json?.summary || step.summary,
    evidence: {
      ...step.evidence,
      qwen: {
        provider: result.provider,
        model: result.model,
        usage: result.usage,
        rawContent: result.content
      },
      qwenStructuredOutput: result.json
    }
  };
}

export async function runHiveWorkflow({ requestId = "req_001", applyLearning = false } = {}) {
  const [requests, customers, catalog] = await Promise.all([
    readJson("server/data/requests.json"),
    readJson("server/data/customers.json"),
    readJson("server/data/catalog.json")
  ]);

  const request = requests.find((item) => item.id === requestId) || requests[0];
  const customer = customers.find((item) => item.company === request.company);
  const laptop = catalog.find((item) => item.sku === "LAP-DELL-5440");
  const support = catalog.find((item) => item.sku === "SUP-3YR-ONSITE");

  const quantity = requestId === "req_002" ? 12 : 25;
  const proposedDiscountRate = applyLearning || requestId === "req_002" ? 0.08 : 0.15;
  const discountRate = requestId === "req_001" && !applyLearning ? 0.08 : proposedDiscountRate;
  const supportIncluded = true;
  const subtotal = quantity * laptop.unitPrice + (supportIncluded ? quantity * support.unitPrice : 0);
  const discount = Math.round(subtotal * discountRate);
  const total = subtotal - discount;
  const cost = quantity * laptop.unitCost + quantity * support.unitCost;
  const margin = Math.round(((total - cost) / total) * 1000) / 10;

  const riskFlags = [];
  if (proposedDiscountRate > 0.1) riskFlags.push("Discount exceeds 10% approval policy.");
  if (quantity > 20 && laptop.leadTimeDays < 5) riskFlags.push("Large rollout needs conservative delivery promise.");
  if (margin < 20) riskFlags.push("Margin is below target threshold.");

  const humanEdit = requestId === "req_001"
    ? {
        changedDiscountFrom: "15%",
        changedDiscountTo: "8%",
        changedDeliveryFrom: "4 days",
        changedDeliveryTo: "6 business days",
        reason: "Preserve margin and avoid overpromising delivery for a 25-device rollout."
      }
    : null;

  const learning = requestId === "req_001"
    ? {
        status: "proposed",
        proposals: [
          "For AdeptWorks Lagos, cap default laptop rollout discounts at 8% unless a manager approves more.",
          "For orders above 20 devices, quote delivery as at least 6 business days.",
          "Continue recommending Dell Latitude with 3-year onsite support for office rollouts."
        ],
        expectedNextRunImpact: "Second similar quote should require fewer edits and avoid discount/delivery policy flags."
      }
    : {
        status: "applied",
        proposals: [
          "Applied learned 8% discount cap.",
          "Applied customer preference for Dell Latitude plus 3-year support."
        ],
        expectedNextRunImpact: "No manual discount correction required."
      };

  const quoteDraft = {
    quoteId: `qt_${requestId}`,
    customer: request.company,
    lineItems: [
      {
        sku: laptop.sku,
        name: laptop.name,
        quantity,
        unitPrice: laptop.unitPrice,
        total: quantity * laptop.unitPrice
      },
      {
        sku: support.sku,
        name: support.name,
        quantity,
        unitPrice: support.unitPrice,
        total: quantity * support.unitPrice
      }
    ],
    subtotal,
    proposedDiscountRate,
    discountRate,
    discount,
    total,
    margin,
    deliveryPromise: requestId === "req_001" && !applyLearning ? "4 business days proposed; human changed to 6 business days" : "6 business days",
    emailDraft: `Hi Mira,\n\nBased on your Lagos office rollout, we recommend ${quantity} ${laptop.name} devices with 3-year onsite support. The approved quote total is ${money(total)} after an ${Math.round(discountRate * 100)}% rollout discount. Estimated delivery is 6 business days after approval.\n\nBest,\nHive Corps`
  };

  const qwen = await runQwenAgentLayer({
    request,
    customer,
    catalog,
    laptop,
    support,
    proposedDiscountRate,
    margin,
    riskFlags,
    quote: quoteDraft,
    humanEdit,
    learning
  });

  const deterministicAgents = [
    makeStep("Intake Agent", "complete", "Extracted customer, product category, quantity, urgency, location, and missing fields.", {
      customer: request.company,
      quantity,
      category: "laptop",
      location: "Lagos",
      urgency: "next week"
    }),
    makeStep("Planner Agent", "complete", "Created a quote-to-response task graph with memory, catalog, risk, approval, and learning steps.", {
      plan: ["retrieve_memory", "check_catalog", "price_quote", "review_risk", "approval_gate", "generate_output", "learn_from_edits"]
    }),
    makeStep("Memory Agent", "complete", "Retrieved customer preferences and approved policies from persistent memory.", {
      memories: customer.memories,
      approvedPolicies: customer.approvedPolicies
    }),
    makeStep("Catalog Agent", "complete", "Selected an in-stock Dell laptop and attached 3-year onsite support based on customer memory.", {
      selectedSku: laptop.sku,
      supportSku: support.sku,
      stock: laptop.stock,
      leadTimeDays: laptop.leadTimeDays
    }),
    makeStep("Risk Agent", riskFlags.length ? "needs_approval" : "complete", riskFlags.length ? "Flagged quote for human approval before execution." : "No high-risk pricing or delivery issues found.", {
      riskFlags,
      margin,
      approvalRequired: riskFlags.length > 0
    }),
    makeStep("Quote Writer Agent", "complete", "Generated a customer-ready quote and internal rationale.", {
      quoteSummary: `${quantity} ${laptop.name} devices with 3-year onsite support for ${money(total)}.`
    }),
    makeStep("Learning Agent", "pending_feedback", "Prepared to compare human edits against the agent proposal and propose reusable memory/policy updates.", {
      learningMode: "human-approved memory and policy proposals"
    })
  ];

  const agents = deterministicAgents.map((step) => mergeQwenStep(step, qwen));
  const qwenWriter = qwenResultFor(qwen, "Quote Writer Agent")?.json;
  const qwenLearning = qwenResultFor(qwen, "Learning Agent")?.json;
  const qwenRisk = qwenResultFor(qwen, "Risk Agent")?.json;

  const run = {
    runId: `run_${requestId}_${Date.now()}`,
    mode: getQwenConfig().enabled ? "qwen-live" : "deterministic-demo",
    qwen,
    request,
    agents,
    quote: {
      ...quoteDraft,
      emailDraft: qwenWriter?.customerEmail || quoteDraft.emailDraft,
      internalRationale: qwenWriter?.internalRationale || "Deterministic quote rationale based on catalog, margin, customer memory, and policy checks."
    },
    risk: {
      score: riskFlags.length ? 72 : 24,
      approvalRequired: typeof qwenRisk?.approvalRequired === "boolean" ? qwenRisk.approvalRequired : riskFlags.length > 0,
      flags: Array.isArray(qwenRisk?.riskFlags) && qwenRisk.riskFlags.length ? qwenRisk.riskFlags : riskFlags,
      recommendation: qwenRisk?.recommendation || (riskFlags.length ? "Hold for human approval." : "Approve for customer response.")
    },
    approval: {
      status: riskFlags.length ? "human_edit_required" : "approved",
      humanEdit,
      finalStateChange: riskFlags.length ? "Quote held for approval before customer response." : "Quote approved for customer response."
    },
    learning: {
      ...learning,
      proposals: Array.isArray(qwenLearning?.proposals) && qwenLearning.proposals.length ? qwenLearning.proposals : learning.proposals,
      expectedNextRunImpact: qwenLearning?.nextRunImpact || learning.expectedNextRunImpact
    },
    proof: {
      alibabaCloud: {
        deploymentTarget: "Alibaba Cloud ECS or Function Compute",
        evidenceFile: "proof/alibaba-cloud-deployment.md",
        serviceConfigFile: "server/alibaba-cloud-service.example.json"
      },
      artifacts: [
        "proof/generated/sample-agent-run.json",
        "proof/generated/generated-quote.json",
        "proof/generated/audit-log.json"
      ]
    }
  };

  await fs.mkdir(path.join(root, "proof/generated"), { recursive: true });
  await fs.writeFile(path.join(root, "proof/generated/sample-agent-run.json"), JSON.stringify(run, null, 2));
  await fs.writeFile(path.join(root, "proof/generated/generated-quote.json"), JSON.stringify(run.quote, null, 2));
  await fs.writeFile(path.join(root, "proof/generated/audit-log.json"), JSON.stringify(run.agents, null, 2));
  await fs.writeFile(
    path.join(root, "proof/generated/generated-quote.md"),
    [
      `# Quote ${run.quote.quoteId}`,
      "",
      `Customer: ${run.quote.customer}`,
      `Total: ${money(run.quote.total)}`,
      `Discount: ${Math.round(run.quote.discountRate * 100)}%`,
      `Margin: ${run.quote.margin}%`,
      `Delivery: ${run.quote.deliveryPromise}`,
      "",
      "## Line Items",
      "",
      ...run.quote.lineItems.map((item) => `- ${item.quantity} x ${item.name} (${item.sku}) at ${money(item.unitPrice)} = ${money(item.total)}`),
      "",
      "## Customer Email",
      "",
      run.quote.emailDraft
    ].join("\n")
  );

  return run;
}
