/**
 * End-to-End Coordination Loop Validation Test
 * Tests the entire loop described in Section 3 & 4 of the roadmap:
 * Task -> Inbound Reply -> Classifier -> State Machine -> Blocker Mitigation -> Verification -> Complete
 */

const store = require("./lib/store");
const { classifyReply } = require("./classifier");
const { transitionTask } = require("./stateMachine");
const { recordBlocker, resolveBlocker } = require("./blockers");
const { verifyTaskEvidence } = require("./verification");
const { getEnrichedTasks } = require("./task");

async function runValidation() {
    console.log("=== STEP 1: INITIAL SEED STATE ===");
    const initialTasks = await getEnrichedTasks();
    console.log(`Loaded ${initialTasks.length} tasks.`);
    const paymentTask = initialTasks.find(t => t.title.includes("payment API"));
    const unitTestTask = initialTasks.find(t => t.title.includes("unit tests"));

    console.log(`Payment Task: ${paymentTask.title} [Status: ${paymentTask.status}]`);
    console.log(`Unit Test Task: ${unitTestTask.title} [Status: ${unitTestTask.status}, At Risk: ${unitTestTask.at_risk}]`);

    console.log("\n=== STEP 2: INBOUND KABIR REPLY ('connected, but waiting for test credentials') ===");
    const classification = await classifyReply({
        task: paymentTask,
        reply: "connected, but waiting for test credentials",
        teamMembers: ["Aisha", "Kabir", "Ravi"]
    });
    console.log("Gemini Classifier Output:", JSON.stringify(classification, null, 2));

    if (classification.intent !== "blocked") {
        throw new Error(`Expected intent 'blocked', got '${classification.intent}'`);
    }

    console.log("\n=== STEP 3: APPLY STATE MACHINE & BLOCKER ENGINE ===");
    await recordBlocker({
        taskId: paymentTask.id,
        blockerText: classification.blocker,
        blockerOwnerName: classification.blocker_owner,
        source: "llm"
    });

    const updatedPaymentTask = await store.getTaskById(paymentTask.id);
    const updatedUnitTestTask = await store.getTaskById(unitTestTask.id);
    console.log(`Payment Task is now: ${updatedPaymentTask.status} (Blocker: "${updatedPaymentTask.blocker_text}")`);
    console.log(`Downstream Unit Test Task is now At Risk: ${updatedUnitTestTask.at_risk}`);

    if (updatedPaymentTask.status !== "Blocked") {
        throw new Error("Task failed to transition to Blocked");
    }
    if (!updatedUnitTestTask.at_risk) {
        throw new Error("Downstream task was not flagged At Risk");
    }

    console.log("\n=== STEP 4: RESOLVE BLOCKER WORKFLOW ===");
    await resolveBlocker({
        taskId: paymentTask.id,
        resolutionNote: "Aisha supplied Stripe sandbox API credentials via Telegram",
        source: "manager"
    });

    const resumedPaymentTask = await store.getTaskById(paymentTask.id);
    const resumedUnitTestTask = await store.getTaskById(unitTestTask.id);
    console.log(`Payment Task restored to: ${resumedPaymentTask.status}`);
    console.log(`Downstream Unit Test Task At Risk cleared: ${!resumedUnitTestTask.at_risk}`);

    console.log("\n=== STEP 5: DONE-VERIFICATION FLOW ===");
    // Attempt completion with valid PR link evidence
    const verificationResult = await verifyTaskEvidence({
        taskId: paymentTask.id,
        evidenceType: "link",
        content: "https://github.com/cedance/core/pull/10 - Stripe charges succeeded in test mode with 200 OK."
    });
    console.log("Verification Result:", verificationResult);

    const completedPaymentTask = await store.getTaskById(paymentTask.id);
    console.log(`Final Payment Task Status: ${completedPaymentTask.status} (${completedPaymentTask.progress_pct}%)`);

    if (completedPaymentTask.status !== "Complete") {
        throw new Error("Task failed to transition to Complete after passing verification");
    }

    console.log("\n=== STEP 6: AUDIT TRAIL LOGGED ===");
    const events = await store.getTaskEvents(paymentTask.id);
    console.log(`Recorded ${events.length} audit events for payment task:`);
    events.forEach(e => {
        console.log(` - [${e.source.toUpperCase()}] ${e.old_status || 'Start'} -> ${e.new_status}: "${e.reason}" (conf: ${e.confidence ?? 'N/A'})`);
    });

    console.log("\n🎉 ALL 4 ROADMAP PHASES PASSED END-TO-END VALIDATION!");
}

runValidation().catch(err => {
    console.error("Validation error:", err);
    process.exit(1);
});
