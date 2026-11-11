# Your Old Prompts Are Making Claude Worse - Lance Martin, Anthropic

Lance Martin, Anthropic

[Talk page](https://ai.engineer/talks/ys6YQ2yfBpM-your-old-prompts-are-making-claude-worse) · [Video](https://www.youtube.com/watch?v=ys6YQ2yfBpM)

## Your Old Prompts Are Making Claude Worse

On a roughly 50-ticket support benchmark, Anthropic’s Lance Martin shows how tuning model, effort and prompt cut cost by 90% while improving the score. He also shows how Claude revised an API skill that scored 66% and how long-running agents can recover from a sandbox failure.

### An application can sit inside the cost–quality frontier

[0:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=0s)

Before paying for a stronger model or accepting a lower score to save money, Lance Martin asks where the application sits on its own evaluation. Picture cost on the horizontal axis and quality on the vertical axis. For a given task, the best available choices trace a Pareto frontier. At a point on that frontier, improving one measure entails giving something up on the other. Martin sketches a family of choices with Fable at the expensive, high-performing end, followed by Opus, Sonnet and Haiku.

The model name alone tells an engineer very little about whether an application reaches that curve. An agent might pay repeatedly to process identical instructions. Its prompt might also make Claude spend tokens on a verification routine that gets it no closer to the right answer. An application with either problem has room to move left on the chart, and one with confusing instructions may be able to move up at the same time. Martin, a member of technical staff at Anthropic, has seen customers make both gains through small configuration changes. His first example concerns a piece of configuration that often survives several model upgrades intact.

### Audit the instructions an earlier model needed

[1:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=91s)

Prompts accumulate debt much as code does. Several model generations ago, engineers routinely asked a model to “think step by step,” gave it a scratchpad, and specified how to use that space to reason. They added a verification instruction such as “double check your work” to get it to revisit an answer, or a general booster such as “be maximally thorough.” Each intervention addressed a recognizable behavior. Together they could become a standing procedure imposed on every request, regardless of its difficulty.

Frontier Claude models already choose when to reason and naturally verify their work, in Martin’s experience. An inherited demand for thoroughness can therefore change the amount of work the model does even when its first answer would have been adequate. Contradictory rules have a different effect. A weaker instruction follower could quietly ignore one rule, producing an answer that made the prompt appear serviceable. A stronger instruction follower tries to honor both. The upgrade exposes an inconsistency that was present all along.

Martin describes two routes to the prompt audit in Claude Code. Use the checkup skill’s prompt audit for Claude Code’s own configuration, including its prompts and skills. Use the bundled Claude API skill’s prompt audit for application code that calls Anthropic’s APIs. Both reach the same underlying audit. The distinction is where the engineer is working. From the working directory, the audit can inspect skills, tools and prompts for these patterns and remove them. That scope matters if the application prompt looks clean but a tool’s instructions reintroduce the same verification ritual.

![Two stacked boxes show prompt-audit commands in large monospace text. The upper command starts with /checkup and the lower with /claude-api.](https://ai.engineer/api/talk-essay-media/a9b5c62baa4d3fe6d84267dccc94757a2b3b605abc8c8ef7971e9b782e7cd934)

Claude Code prompt-audit commands

### Separate the gain from a model upgrade from the gain from a prompt edit

[3:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=229s)

Martin built a synthetic customer-support evaluation with about 50 tickets and simulated a migration from Opus 4.8 to Opus 5.5. He introduced the prompt anti-patterns individually and measured the results. The intermediate point in his comparison averages across those experiments. This makes it possible to ask two questions about the same queue of tickets. How does the new model perform with the inherited habits still in place? What changes when the audit removes them?

The migration alone moved the point to the left and slightly upward. Opus 5.5 cost less and scored a little better even with the extra instructions. Running the prompt audit after the migration yielded a further reduction in cost and another improvement in score. Martin attributes the token savings to removing boosters and verification rituals that induced Opus 5.5 to do excessive work. Resolving instructions that confuse the stronger model also gives it a better chance of answering correctly.

![A diagram shows a legacy prompt shortened by an audit. Beside it, arrows connect three points on a chart: Opus 4.8 legacy at 2.45¢ and 88.1% accuracy, Opus 5.5 unaudited at 2.02¢ and 90.0%, and Opus 5.5 audited at 1.83¢ and 92.0%.](https://ai.engineer/api/talk-essay-media/d62b5e863a5099504969927ef6f5b027605f9dde8884af4233c8e8adc83f07f7)

Cost per ticket and accuracy before and after a prompt audit

For an engineer reproducing the comparison, the intermediate measurement is worth keeping. A before-and-after test that changes the model and cleans up the prompt in one move gives a single result for two decisions. Holding the ticket set fixed and measuring the inherited prompt on the new model first reveals how much the application was leaving on the table after the upgrade. Martin reports the direction of the two gains here. The percentage savings he gives later come from separate experiments.

### Order an agent’s context by how long each part stays the same

[5:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=330s)

Consider two successive requests in an agent session. Between them, Claude may have made a single tool call. The new information is small, yet the next request carries much of the same context as the last one. A prompt-cache hit lets the application reuse that work at lower cost and with less latency. Martin puts the read price at roughly a tenth of the base token rate, with the qualification that pricing varies by model. Over many turns, the proportion of repeated input that actually hits the cache matters to the economics of the whole session.

The cache requires a strict prefix match. A byte that changes early in the prompt breaks the match at that position. Thousands of identical tokens after the change cannot extend the matching prefix. An engineer can therefore have two requests that contain almost exactly the same information and still get little reuse. Inspecting which material repeats is only half the diagnosis. Its position in the assembled request determines how much the cache can recognize.

![Two ten-position request diagrams compare cache reads. The top row reuses positions 1–8. Changing the time from 9:41am to 9:42am at position 4 leaves only positions 1–3 cached in the bottom row.](https://ai.engineer/api/talk-essay-media/616644eddcfe1f830126ddf99ae7357406a0cab1a6590fbf27ff3aa58528a302)

Caching is a strict prefix match

Martin arranges the input in four layers. System instructions and tool definitions shared across sessions belong at the beginning. Project material such as `CLAUDE.md` and project memory comes next. Session state follows, and messages accumulate at the end with each turn. On a project switch, the shared instructions and tools can still match. Within a project, a new session can reuse the project material too. Appending the next message gives the existing conversation a chance to match all the way through the previous turn.

The Claude Console exposes the application’s prompt-cache hit rate. The Claude Code team tracks that number closely, and Martin recommends checking it for applications built with the API. A diagnostic in Claude Code can inspect an API project, identify where its prompt construction breaks reuse, and suggest a better order. It also looks at prompts and effort settings. For a cache investigation, the important output is a concrete opportunity to move changing material behind a reusable prefix, followed by a hit rate that shows whether the change worked.

### Default benchmark harnesses left up to 72% in cache savings

[7:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=461s)

Martin and colleagues on Anthropic’s applied AI team ran the diagnostic against several internal benchmarks, using the default harnesses that issued the model requests. Some harnesses made poor use of the prompt cache. The team found opportunities to reduce cost by up to 72% with no meaningful change in measured performance. The upper end of that result belonged to those particular harnesses. An application already getting long prefix matches has a different starting point.

![Bars show cost per run falling across four benchmarks, from a 24.3% reduction on SWE-bench Verified to 72.9% on tau2-bench (retail). Beside each bar, a dot and whiskers show the score change and its 95% confidence interval.](https://ai.engineer/api/talk-essay-media/d6f1b7508a89cb0fcb40196fafde66c0730e36fe587b88a53204940f38fa1217)

cost-optimize can reduce cost by fixing prompt caching

This experiment isolates a different expense from the support-ticket prompt audit. Removing a verification instruction changes the work Claude decides to do and can affect its answer. Making better use of the cache addresses the price of processing material the agent was going to receive again anyway. That explains why the benchmark score could hold steady while the cost moved substantially. It also explains why the default harness deserves inspection before anyone interprets an expensive benchmark run as evidence that the model itself is too costly.

### Check that a higher evaluation score is attainable

[9:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=542s)

Martin’s next step depends on Claude’s capacity for self-correction. Given an evaluation, Claude can examine failures, change part of the application and try again. Martin calls that loop hill climbing. Before letting it spend tokens on successive attempts, he checks whether the evaluation gives it a meaningful hill to climb. His diagnostic picture plots tokens per attempt, a measure of how much thinking the model does, against the resulting score. Separate curves represent a frontier, mid-sized and small model, roughly Opus, Sonnet and Haiku in his example.

He looks for four properties. First, stepping up to a more capable model should generally improve the score. Second, allowing more thinking should generally improve performance within a model. Third, the strongest model should still have some solvable failures, leaving headroom for a better configuration. Fourth, repeated runs under the same conditions should yield similar scores. A large difference between two successive runs means less if the same configuration routinely produces swings of that size.

![Three curves rise and flatten from low to high effort. The frontier model scores highest at each effort level, followed by the mid-size and smaller models. Short error bars mark each point, and all three curves stay below the perfect-score line.](https://ai.engineer/api/talk-essay-media/791d39e48d82acf60dbef02a0c37aaa494f958dec4f046adb634fa06a0da036c)

Model score versus action tokens per attempt

The headroom check requires reading actual cases. An evaluation at 80% appears to offer another 20 percentage points. If its remaining questions are ambiguous, a model can keep producing reasonable answers without getting credit. Even a widely used evaluation can contain enough such tasks to be effectively saturated. An autonomous optimizer can burn through a substantial budget searching for a prompt that will recover points the evaluation gives it no reliable way to earn.

The build-eval workflow in the Claude API skill starts with a problem, what the engineer wants to measure, and raw data such as traces from the team’s existing tracing system. The skill analyzes the data, builds an evaluation, and reviews the cases and grading criteria with the engineer. During Q&A, Martin describes a change he has proposed: let the engineer inspect the raw traces Claude has flagged before it turns them into evaluation cases.

### Keep the test cases out of Claude’s editing loop

[11:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=707s)

Once the evaluation behaves sensibly across models, thinking budgets and repeated runs, Claude can start proposing changes autonomously. The risk is that it learns what earns points on this particular collection of examples. Suppose one benchmark task needs optical character recognition. An optimizer permitted to change the harness might add an OCR tool and solve the case. If production users never submit that kind of problem, the new tool improves the benchmark while doing nothing for them. A prompt can achieve the same spurious gain more quietly by picking up phrasing distinctive to the examples.

The Claude API skill’s hill-climb workflow splits the evaluation into training and test sets. Claude inspects the training failures and uses those cases to decide what to change. The runner measures performance on both sets each round, while the test examples stay out of Claude’s deliberations. That separation lets an engineer watch two scores from the same edit. If training performance keeps rising and the test score stays flat, the system has an early signal that Claude may be fitting details peculiar to the training cases.

![A feedback loop shows an analyzer using training failures to propose one edit while the model and harness stay fixed. Train and held-out test scores determine whether to keep the edit.](https://ai.engineer/api/talk-essay-media/ba90876d5c4ba951c4124d413040ebbbb0ab97b4d2288a9bbbfc357da2333b17)

Evaluating one proposed change per round

The split answers a limited question. It can show whether a change transfers to other examples drawn from the evaluation. Its usefulness for predicting production performance still depends on how the original examples were selected. A benchmark full of unusual requests can produce train and test sets that share the same bias. Martin therefore keeps the engineer involved in auditing what the hill climber changes. The question to ask about that new OCR tool is which real users need it, even if the benchmark rewards the addition.

### Give Claude the API skill it can edit and the documentation it must match

[14:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=897s)

Martin tested the method on the Claude API skill itself. The skill gives Claude Code guidance on Anthropic’s SDKs and APIs, so its answers need to be grounded in Anthropic’s documentation. He built evaluation questions from that documentation and tested the existing skill. It scored 66%. This gave him both a specific failure to investigate and a bounded place to make changes. The evaluated model was reading the skill whose text the optimizer would be allowed to revise.

He then gave Claude Code access to the skill text and the underlying documentation. For each round, Claude could inspect a failure, consult the source, identify where the skill misrepresented the documented behavior, and revise its guidance before trying again. The documentation served as a reference independent of the current wording of the skill. An edit could therefore be assessed in two ways, by checking its fidelity to the source and by measuring whether the model using the revised skill answered the questions better.

Martin reports a substantial improvement from 66% without giving a final score. He singles out the fit between the task and the editable material. The evaluation asked about API behavior, the documentation supplied that behavior, and the skill was the piece of text meant to convey it to Claude. That short path from an edit to an observable answer made repeated autonomous experiments practical. He has found prompts and skills particularly amenable to this treatment.

![A line chart tracks pass rate across three phases of skill and grader edits. It rises from 66.1% at baseline to 87.9% at round 24, with small dips at rounds 9 and 13.](https://ai.engineer/api/talk-essay-media/7e3eb01078f3774dc4f9daeb15d60318bea4a927ad2d33c622a30b53354f3af2)

Pass rate rises from 66.1% to 87.9% over 24 hillclimb rounds

### Search model, effort and prompt together under a quality floor

[16:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=989s)

The same runner can optimize for a different objective. Tell the hill climber to reduce cost, and it searches for a configuration that costs less while at least matching baseline performance. It can vary three things. Model selection changes which Claude does the work. Effort changes how much reasoning the model applies. Editing the prompt changes the instructions under which it solves the cases. The evaluation score gives the search a quality floor while the measured cost distinguishes configurations that clear it.

On the synthetic support benchmark, Martin started with Opus 4.8 at high effort and a baseline prompt. The hill climber first moved to Opus 5 at low effort. Performance jumped and cost fell a little. It then tried another model at low effort. That round delivered a much larger cost reduction but gave back some of the previous round’s performance gain. Claude next edited the prompt and recovered performance. The final configuration cost 90% less than the starting configuration and achieved a higher score.

![Dashed arrows connect four points. Moving from Opus 4.8 to Opus 5 raises accuracy and lowers cost. Switching to Sonnet 5 lowers both, then a prompt edit restores accuracy to near 100% at about 1¢ per ticket.](https://ai.engineer/api/talk-essay-media/95f2fb8f80f4ee68a8ad8edf9864c4a304a191455286a54b9215c5b402310332)

Cost per ticket and train-split decision accuracy across four configurations

The intermediate results explain why Martin allows all three controls into the search. Stopping at the first model switch would have captured a quality improvement but only a small saving. Judging the next candidate solely by its drop from the preceding high score would have obscured a much cheaper configuration whose prompt still had room for improvement. The reference point for the cost objective was the original quality floor. The runner could measure the effect of each successive choice against it.

Cost optimization also gives a saturated evaluation a job it can still do. Even if further quality gains are out of reach, the set can test whether a cheaper configuration maintains the score. Martin has repeatedly seen a stronger model at low effort solve a problem in fewer tokens than a weaker model working at high effort. A higher price per token can then translate into a lower price for the completed task. The hill climber tries that possibility and measures it on the workload. The 90% figure describes the complete support-benchmark run, including the later prompt edit.

### An overnight agent needs a history that survives a sandbox failure

[18:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1133s)

Martin shifts from the economics of one attempt to the duration of the work an agent can undertake. He describes METR charts with time on the horizontal axis and the time a task would take a human on the vertical axis. He puts Claude Opus 3 at roughly four minutes of human-equivalent work, a horizon he associates with autocomplete and chat. During 2025, he says, models reached tasks on the order of an hour or two, as Claude Code gained popularity. He sees agents moving toward tasks representing a day or two of human work, while qualifying that this may extend beyond what the charts can measure.

That prospect changes what a useful harness has to survive. Imagine starting an agent in the evening and having its sandbox die halfway through the night. If its session log lived only there, the same failure that interrupted execution also took away the history needed to recover. Claude Managed Agents separates the harness that directs the work, which Martin calls the brain, from the sandboxes where it writes code and performs actions, the hands. A third component, the session log, has a lifetime independent of both.

The log is an append-only, recoverable object. If the sandbox dies, the system can boot a replacement. If the harness dies, an orchestrator can bring up another harness. In either case the session history survives and provides a basis for recovery. Martin’s example concerns recovering from that record. The design places the evidence of what happened outside the two components most immediately involved in carrying out the work.

Credentials have their own boundary. Managed Agents holds secrets in vaults associated with the tools. Claude can reference an API key or another secret while its value stays in the vault, outside the model’s view. An agent can thus work through tools that require credentials throughout a long run. For Martin, the prospect of an agent operating autonomously for days makes the placement of those credentials as much a harness-design question as the placement of the session log.

### A scheduled Slack update brings the managed components together

[22:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1329s)

Martin and a colleague, CJ, put together an example that gathers regular context updates. The engineer specifies the sources the agent should consult. A scheduled deployment runs on Anthropic infrastructure, the agent reads from those sources, and it can write updates to Slack. The example combines scheduling, securely stored secrets and memory in a customizable automation. To start it, Martin directs engineers to the Managed Agents onboarding workflow in the Claude API skill in Claude Code. Supplying the accompanying tutorial to that workflow lets Claude spin up the example for them to explore.

![A schedule wakes the agent to read sources, update its state and consult reader preferences. Guardrails surround the agent and its duplicate-post check. An approved destination delivers the brief to the reader, who can update preferences.](https://ai.engineer/api/talk-essay-media/7cc12347933a6a1ba3f037765e9a93e6dac6c0ce2bd7769325c79b08846b8be5)

How a scheduled agent reads sources and delivers a brief

Martin connects this back to a working pattern he sees among colleagues. An engineer can spend the day defining what success looks like on an evaluation and give Claude the night to improve a skill against it. The cache matters across the repeated turns, the evaluation determines which changes count as progress, and the harness has to keep the job recoverable while its owner is away. As Claude takes on more of the iteration, decisions about the cases, grader and permitted edits account for more of the engineer’s work.

### Let Claude flag suspect traces before a person selects evaluation cases

[24:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1465s)

An audience question asks how much of evaluation design can be automated. Martin recalls feedback from Hamel on the build-eval skill. In a customer-support example, the starting material was a collection of traces and the first decision was which conversations contained failures worth promoting into an evaluation. Claude did well at scanning the offline logs and pointing out potential errors, much as an online evaluator might flag a problematic interaction. That helps a person find cases worth reading in a large collection.

Hamel wanted the skill to walk the user through the underlying data first. Martin agrees and distinguishes the proposed workflow from the behavior available at the time. The skill went straight into analyzing the data, building an evaluation and presenting it. Martin had a pull request open to add an intermediate viewer. Claude would annotate candidate failures or suggest what to look at, then show the person the raw traces before examples were promoted. The order matters because the person deciding what belongs in the suite can inspect the interaction that gave rise to the annotation.

A follow-up asks about hill climbing with human feedback. Martin’s requirement is a signal per example that Claude can use to distinguish good from bad. Human judgments can supply that signal once they have been incorporated into the evaluation. This divides the work at a different point: people can establish which outcomes are desirable, and Claude can use the resulting judgments while it iterates.

### Choose an editable file whose effect the evaluation can see

[26:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1597s)

Asked where to start hill climbing, Martin returns to the relationship between an edit and an answer. With a prompt or skill, Claude can change a small piece of text that the evaluated model reads directly. With an agent harness, a single round can produce a much larger code diff. Some changes may affect behavior the evaluation never exercises. People have successfully hill-climbed harnesses, he says, but it takes more work to interpret a score change when the edit could have acted through several different parts of the system.

The ease of editing text has a downside he has observed in his own experiments. Claude is adept at nudging a prompt into a shape that works unusually well on the chosen examples. Even a train/test split leaves room for that prompt to fit a quirk shared by the entire set. A small, legible diff makes it easier to inspect what Claude did. The engineer still has to judge whether the new wording expresses a requirement that will recur in production.

Another question concerns when a prompt or standard operating procedure should become a skill. Martin often completes a workflow with Claude and then asks it to turn the repeated procedure into a skill. For an optimization run, he usually starts one step further along, with an existing skill or a crude piece of boilerplate that Claude can change. His API skill was essentially a distillation of the docs, directing Claude to particular pages for particular questions. It contained enough small gotchas to produce the low initial score, but it gave the evaluation a baseline and the optimizer a specific file to improve.

### For open-ended answers, test whether the graders agree

[30:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1804s)

A question about open-ended work gets at what the hill climber should trust as a score. Martin prefers a deterministic check wherever the task admits one. For a piece of writing that resists such a check, he starts with a rubric he could apply himself. The practical test is to read a sample answer alongside the criterion and decide whether he can actually grade it. Handing Claude an arbitrary zero-to-five scale leaves the distinctions between scores unresolved. A request to rate the text from one to ten introduces still more opportunities for noisy judgments.

For one criterion, Martin favors a crisp binary decision. If several qualities matter, use several binary classifiers so each grader has a specific question to answer. Then test the rubric itself. Give Sonnet, Opus and Fable the same work to grade using the same criteria. Broad disagreement is a warning that the rubric leaves too much to interpretation. Separately, run replicates to see how tightly the grades cluster across repeated attempts. The first check probes agreement between graders. The second asks whether a grader can reproduce its own judgment reliably enough to guide the next edit.

### A choice between two pages can be easier to grade

[32:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1922s)

An audience member suggests pairwise comparison. Martin gives the example of two web pages. A reviewer may know immediately which page they prefer yet struggle to give either page a grade from zero to five. The pair supplies a point of comparison that the numerical scale leaves unspecified. Martin has found that people and model judges can both make the comparison more easily when the quality of an individual artifact is hard to grade.

There is a separate question about which artifacts to put in front of the judge. By the “distribution” of an eval, Martin means the set of cases sampled for it and how well those cases represent the work someone cares about in production. An engineer can have an excellent way to judge each case and still select a collection that gives a misleading picture of the application. One particularly tempting way to do that is to build the entire collection out of failures from a single model.

Suppose Sonnet 5 misses a group of examples. On the evidence of those runs, they all look hard. Promote them to the eval, switch to Opus 5, and the new model might solve every one. Martin describes model capabilities as jagged. The particular pocket where Sonnet struggled may be quite accessible to Opus. An eval selected this way, through what he calls adversarial sampling, acquires the shape of one model’s weaknesses. A large score increase on upgrade can then tell the owner surprisingly little about the rest of the workload.

Martin would still promote a production failure that exposes something important. The selection question is what makes the case worth keeping across model versions. A product owner might recognize a difficult request from experience, see in the production data that it matters, or have a reason from first principles to expect the application to handle it. That rationale survives the day a different model gets the answer right.

### A grading scale has to work for the person and the model applying it

[33:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2024s)

An audience question presses Martin on the apparent preference for binary grading. Can an eval put outputs into several buckets? Yes. A binary decision is a shortcut for simplifying a difficult judgment. His objection concerns the familiar zero-to-ten scale whose author can name the endpoints but gives the grader little basis for distinguishing the values in between. Giving an output a seven looks precise. If the grading rules would support a six equally well, that precision is of little use to an optimizer measuring its next change.

Martin gives three conditions under which he would be comfortable with several grades. A human reviewer should be able to distinguish two grades using the rules. Repeated grading should have low variance. The distinctions should also be reproducible across models. Together, those checks establish that the categories mean something to a person and that the machinery applying them can recover that meaning consistently. A well-thought-through multicategory classification meets his objection just as well as a binary one.

Cost matters because the judge may run every time a candidate configuration produces an answer. Martin often wants a small, inexpensive model to do that work. Depending on the cost constraints, using Fable for routine grading could be an expensive way to administer an unclear rubric. It is worth asking whether the cheaper judge can make the distinctions the eval designer has asked for.

### A personal automation can still produce work that deserves an eval

[34:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2077s)

Martin decides whether to build an eval by looking at the consequence of the task. Consider someone in finance who automates part of their own workflow. The tool has one maker and perhaps one user, yet its output may go to people outside the organization. If the quality of that deliverable matters, Martin would build an eval. The same reasoning applies to a personal agent entrusted with sensitive work. For a calendar helper someone built to manage their own meetings, he could go either way. He has built few evals for his own personal automations.

The investment in tooling can follow the scale of the job. Asked about platforms, Martin mentions that he worked at LangChain before Anthropic and declines to endorse a particular provider. At small scale, he would be comfortable building a viewer for the data at hand. A bespoke problem may call for a very particular view of the records, and he finds Claude capable of building that interface quickly and inexpensively. He also describes work on a simple data viewer for the skill. The immediate need is modest: give the person making quality decisions a way to inspect the underlying examples.

### When the hill climber stalls, inspect what the remaining failures have in common

[36:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2199s)

Hill climbing means making a change, running the evaluation, inspecting the results and using that evidence to choose another change. Martin has seen the process get stuck many times. A common starting condition is that someone has invoked the hill climber on an existing suite without first running the eval-building command or otherwise inspecting the cases carefully. The score rises until the easy-to-interpret examples pass. The remaining failures continue to promise gains on paper, so the optimizer keeps working on them.

Imagine the last 20 percent of the suite contains ambiguous instructions or faulty grader examples. A run can fail because the author left the intended answer open or because the grader penalizes a defensible answer. In either case, repeatedly editing the application prompt is a poor way to discover the cause. The hill-climbing skill has a fallback for several rounds without progress. It groups the remaining failures and looks for common reasons they keep failing, including problems in the evaluation itself.

Martin saw that fallback operate in the second stage of one of his own runs. After progress stalled, the skill clustered the cases, investigated why the answers were being marked wrong, found several ambiguous cases and rewrote them. That sequence matters when interpreting the next score. An edit to a skill can make the application answer an existing question better. Rewriting the question clarifies the task against which subsequent answers will be judged. Both can move the work forward, but they establish different things about the application.

Asked how the approach relates to DSPy, Martin describes the hill climber as an open-source skill bundled with Claude Code. Its core is a set of instructions for setting up the optimization loop. A developer could vendor those instructions into another environment. Martin thinks the guidance might be adaptable to DSPy and credits Omar and the DSPy team. He has not used DSPy himself and offers the connection as a possible implementation, without claiming to have tested it.

### Search model and effort together, with the current score as a floor

[38:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2325s)

Choosing an effort setting is sufficiently unintuitive that Martin admits to finding it confusing himself. With an eval, he can turn the choice into a search. Establish the application’s baseline performance, let the hill climber try different models at low effort, and compare both their scores and their cost. Work through candidate configurations until performance falls below the baseline. That last measurement is informative even when the configuration will never ship. It locates a point at which the savings come at an unacceptable quality cost.

One such observation was missing from the comparison Martin had shown. Haiku 4.5 at low effort produced a significant regression. He distinguishes that result from Haiku 5.5, which he describes as a better model. The observed regression belongs to the 4.5 configuration he actually tried. It also explains why advice to start at low effort still calls for a performance check. The ability of a capable model to solve a task economically says little about how a different model will fare at the same setting.

Without an eval, Martin’s starting suggestion is a strong model such as Opus 5.5 at low effort. Asked why low rather than medium, he points out that the engineer can turn it up. Starting at maximum effort incurs the largest reasoning spend before there is evidence that the task benefits from it. Starting low gives the engineer an opportunity to see what the model can already do. Martin presents this as a useful order of experiments, with less certainty about the eventual choice when the application lacks a quality measure.

The economic intuition depends on the number of tokens consumed per task. Effort tells Claude how hard to think. A model with a lower base price per token can spend many tokens reasoning at high effort. A more capable model may reach an equally good answer with fewer thinking tokens at low effort. The reduction in tokens can be large enough to outweigh the higher price per token. Martin starts to call the stronger configuration more effective, then corrects himself. The advantage he is describing is token efficiency. Whether it also produces a better answer is a separate result to measure.

### Budget the search and let a person define a consequential failure

[41:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2513s)

The hill-climbing skill asks for a budget during setup and tracks spending against it during the round. That budget covers the experiments themselves. The per-task cost of the configuration the search eventually selects is a separate measure. If the final 20 percent of a suite is impossible to solve, the optimizer can spend heavily chasing those points. Inspecting the stubborn cases helps the owner decide whether another round is worth buying.

For the division of labor between Claude and a human, Martin draws on Hamel’s public use of the build-eval skill. Take a customer-support application. Before Claude reads a trace, someone who knows the product needs to decide what matters about a support interaction and why. Customer satisfaction is one possible concern. Specifying it gives Claude a reason to flag particular conversations. Simply handing over a pile of traces leaves a product decision implicit in whatever the model happens to find interesting.

Once the owner has specified the goal, Claude can read raw traces and surface interactions in which the application appears to have fallen short. Martin compares this to a tracing system with an online evaluator that scores customer satisfaction as conversations arrive. In both cases, the first output is a collection of candidates for inspection. The owner reads those conversations, works out what happened, and identifies the cases that warrant an eval. Only then does the request to build the suite have both examples and an account of why they belong.

At Anthropic, Martin says, responsibility for evals generally follows ownership of the product. People in many roles build them. Claude can take on work such as constructing the eval runner, which reduces how much specialized implementation experience the owner needs. The part that remains with the owner is deciding what a satisfactory result looks like and recognizing a miss that matters. For a support product, someone able to explain the consequence of a poor conversation can supply that guidance even if someone else would traditionally have written the runner.

### Turn repeated preferences between generated UIs into a configuration comparison

[44:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2694s)

Asked for a concrete use of a model as judge, Martin recalls an evaluation of generative UIs. Two configurations, A and B, produce candidate interfaces. The judge sees the pair and selects which is better. Repeating that judgment across many trials supplies evidence about the configurations beyond the fate of a single page. Martin recalls the results being combined into something like an Elo score. He is more certain about the pairwise judging procedure than about the precise aggregation method.

This gives the opening web-page example an operational use. The individual judgment is within reach of a reviewer who can recognize a preference but would struggle to assign an absolute grade. The accumulated judgments address the engineer’s question about which configuration to use. Martin has also seen language models judge retrieval and writing tasks, and classify traces as good or bad. Those applications share a need for judgment, though the form of the decision can differ. Selecting one of two interfaces and deciding whether a single trace merits attention are different instructions to give a grader.

### A split eval set and a measurable loss can drive the same experiment loop

[46:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2763s)

Martin traces some of the motivation for hill climbing to autoresearch and to models’ improving ability to correct their own work. The enabling condition is feedback they can interpret. A model runs an experiment, measures an objective, inspects the result and adapts its next experiment. Over a long series of attempts, that measurement can guide work a human would otherwise have to steer one change at a time.

There are two formulations in the discussion. The Claude Code command is designed for an eval set with a split, where changes to an application are assessed against a collection of cases. In Martin’s account of autoresearch, the system builds or modifies an artifact, such as a network, then measures a quantity such as loss. He does not recall the exact problem in Karpathy’s example and uses loss to illustrate the kind of feedback available. In one formulation the optimizer can inspect cases it missed. In the other it can inspect the result of an experiment on the artifact. Each has an observable outcome on which to base another attempt.

An audience member asks whether to start with hill climbing and extend it to autoresearch. Martin treats that as a choice of problem formulation. Someone working in a repository such as nanoGPT could try giving Claude the skill and asking it to adapt the loop to the experiment there. He presents that as something to try. The common procedure is already quite small: run a change, measure the result, use it to decide what to change next. The work of adaptation lies in specifying what Claude can change and what result it should measure.

### Cost, quality and speed complicate the choice of a winning change

[48:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2912s)

A hill climber can measure more than one objective. Martin’s own example pairs cost with performance. Claude can be told about both and can take both measurements into account as it compares candidate changes. Speed is a third dimension he would consider. A configuration that answers correctly and cheaply may still take longer to return the answer, a distinction a cost-and-quality comparison alone would miss.

Martin has mostly exercised the cost and performance pair. As objectives accumulate, choosing the next change becomes harder because different measurements can favor different candidates. He suggests making changes serially, one thing at a time, as a way to simplify the experiment. He gives no combined score or weighting scheme for the three dimensions. In the effort search, the existing baseline already gives the comparison a concrete interpretation: a cheap configuration that falls below the quality floor has failed one of the owner’s conditions.

### Audit inherited prompts at migration time and check effort on hard tasks

[49:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2972s)

Returning to prompt auditing, Martin calls it the simplest intervention to try. The prompt-audit skill looks for inherited patterns that the target model can do without. He is confident about removing known unnecessary guidance when migrating to a frontier model in the 5.5 series. He is much less confident about assigning a historical cutoff. His testing suggests that some older prompting habits may have begun to lose their usefulness around Opus 4.5, but he would not use that observation as a precise version boundary.

The skill includes model-specific caveats. Moving an application to Haiku, for example, raises a reasonable question about whether it benefits from more explicit guidance than the model used in the previous experiment. Martin offers that as a possibility, acknowledges his uncertainty, and brings the answer back to the actual migration target. The audit’s job is to identify guidance known to be unnecessary for the model receiving the prompt. A rule inferred from the newest Opus version need not settle every case for another model family.

A follow-up about effort clarifies what the control does. Martin describes it as guidance on how much thinking Claude should devote to the problem. It does not impose a hard token cap. Even at very high effort, a simple question can receive a short answer because Claude still exercises judgment about how much verification the task warrants. He has no eval at hand to quantify that behavior and gives it as his working explanation of the setting.

A hard coding problem is where Martin would pay particular attention to the measurement. At extra-high or maximum effort, Claude may spend substantially more tokens checking a result than it spends at medium or low effort. The final outcome can be much the same. That pattern explains why observing a small cost difference on simple inputs is insufficient evidence for setting the whole application to maximum effort. The expensive difference may emerge precisely on the difficult inputs that invite another round of verification.

### Prompt optimization can overfit even when the model behaves as intended

[52:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3135s)

Martin agrees that hill climbing resembles training in an important respect. Give a model a reward or objective and the ability to modify a system, and it will search for modifications that improve the objective. Train and test splits are useful in both settings. Here the model is already deployed and the editable components are runtime inputs such as prompts or skills. An application owner can apply the experimental discipline of training to those components in their own domain.

Could Claude know it is being evaluated? Martin acknowledges evaluation awareness as a concern Anthropic has discussed in the context of training. In these application experiments, the more immediate problem he has observed is overfitting. Give Claude a prompt to edit and a distribution on which it receives a score, and it can discover wording that raises the score significantly. The wording may work only for the questions represented in the suite. This result requires no special story about Claude detecting a test. It follows directly from the objective and the examples available to the optimizer.

A train/test split puts a check on that behavior. The optimizer can use training cases to choose edits, while performance on held-out cases provides a separate reading of whether the edits carry beyond those examples. The audience asks for a minimum useful dataset and an appropriate split. Martin has not studied different sizes systematically and gives neither a minimum count nor a fixed ratio. The skill has heuristics, and he suggests working with Claude on a size appropriate to the signal the owner wants to measure.

With very few examples, three problems become especially acute. The sample may omit important production work. It can be easy to tailor a prompt to the handful of examples it contains. And its score can be noisy, so a change in the result is harder to attribute to the edit. Holding out some examples addresses one source of overfitting, but both portions still inherit the choices made when the owner selected the original sample.

### An hours-long task changes the cost of every iteration

[55:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3341s)

Martin usually chooses an editable component such as a prompt because it is quick to change. An audience member asks about tasks that take a very long time. In that regime, preparing the next candidate can be the shortest part of the experiment. The owner still has to wait for the agent to execute the task before a quality signal comes back. A failed run costs elapsed time as well as compute, and each additional round incurs the delay again.

For experiments running many hours or days, the harness itself must remain reliable across that interval. Martin points to Anthropic’s internal use of Managed Agents. Long-duration hill climbing is feasible, but it brings infrastructure failures and time to feedback into the design of the experiment. Improving the prompt editor alone does little to accelerate a loop whose next decision depends on the outcome of a day’s work.

An agent also usually calls for a multi-turn eval. Martin suggests giving the build-eval command access to real traces, specifying that the eval should be multi-turn, and explaining what the owner wants to examine. Claude can inspect the traces and help select interactions to promote. A grader can then examine the whole trajectory, including the sequence of actions the agent took, or inspect the final outcome. The first answers a question about how the agent worked. The second answers a question about what it ultimately accomplished.

### Keep the session log queryable after context compaction

[57:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3443s)

Asked which context-engineering technique has helped reliability, Martin points to an idea he associates with recursive language models, or RLMs. Keep the context object independent of the model and its harness. In the Managed Agents design he describes, the harness can use tools to query a session log that lives separately. The messages presently in Claude’s working context are therefore only one view of the history available to the agent.

Compaction illustrates the payoff. Partway through a long task, the agent summarizes its message history to keep working. At that moment it has to decide which details are important enough to carry forward, even though it does not yet know the questions it will encounter later. If that summary is the only surviving record, an omitted detail is gone. With an independent log, the harness can return to the earlier interaction and retrieve the detail when it becomes relevant. Recoverability comes from preserving the record and giving the harness an interface for interrogating it.

Reliable history still leaves the problem of judging the work recorded there. Agents produce nondeterministic outcomes, and many useful tasks involve open-ended writing or judgment with no easily verifiable answer. Martin returns to clear grading rules, low variance and checks that multiple models can reproduce a judgment. An optimizer can work for hours on a carefully preserved trace and still get nowhere if the question is impossible or the grader treats several reasonable interpretations inconsistently. Time spent on verifier design determines what that long run can teach the owner.

### Refresh saturated evals with production cases worth keeping

[1:01:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3660s)

As models improve, Martin expects scores on a well-structured existing eval generally to rise. If the trend is absent, he would re-examine what the suite measures. At the other extreme, capable models can saturate a suite quickly. Designing harder cases that genuinely challenge models such as Fable or Opus 5.5 is recurring work. An old suite can still check behavior the team already achieved, even as it loses the ability to distinguish further gains.

Martin closes with a workflow he has seen among tracing providers. Deployed agents produce traces. An online evaluator scores them, and poorly scoring interactions become candidates for an offline eval set. The team hill climbs on selected production failures. Once the application handles them successfully, the cases become regression tests. Meanwhile, the deployed agent continues producing fresh traces, so the owner can look for the next consequential failure and see whether the rate of failures observed in production is falling.

LangChain, Arize and Braintrust are among the providers Martin associates with tooling for that outer loop. He has not followed their latest product changes closely. The difficult part he leaves with the product owner is upstream of any platform choice. What does the online evaluator recognize as good work in production? Which flagged interactions deserve promotion? Those decisions determine whether the next round of optimization improves something users actually experience.

## Key takeaways

- During a model migration, score the inherited prompt on the new model before auditing it. That intermediate run separates the effect of the upgrade from the cost and quality effects of removing obsolete instructions.
- Inspect consecutive agent requests at the first byte where their prefixes diverge. Put shared tools and instructions first, project context next, then session state and growing message history. Verify the result with the cache hit rate.
- Give the hill climber training failures, keep test examples out of its editing loop, and measure both splits each round. For cost work, set a baseline quality floor and search model, effort and prompt together.
- Before trusting an open-ended grader, apply its rubric yourself, compare grades across models, and repeat the grading run. Use separate binary judgments or a pairwise choice where those decisions are easier to make consistently.
- For open-ended artifacts, try judging pairs. Use several absolute grades when a human can explain adjacent grades and inexpensive model judges reproduce the distinction.
- Give a hill climber a budget and held-out cases. When progress stalls, group the misses and inspect the questions and graders before paying for more rounds.
- Compare model and effort as a pair on the same workload. Start with a capable model at low effort and measure cost per task against the existing quality floor.
- For long-running agents, preserve a queryable session history. Choose whether the eval should grade the trajectory or the final outcome, then promote consequential production failures into regression tests.

## Slides

### Most applications sit inside the frontier

[0:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=29s) [A graph plots quality against cost per task. A dashed arrow leads left from the application to a point on the Pareto frontier at the same quality and lower cost.](https://assets.ai.engineer/sites/aiecode2025/sha256/9e48dcacccf8721652a4a91000895edb3529f0a536b4d3e35283e1db6bd7acb1.webp)

Most applications sit inside the frontier

quality
Pareto frontier — efficient configurations
a "free" win (lower cost, no performance drop)
your application, fixed
your application
cost per task

ANTHROPIC
02

### Prompt instructions accumulate as “debt”

[1:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=94s) [Six cards on the left give examples of instructions that raise costs. Two cards on the right show how contradictory rules hurt accuracy and how dated API settings can fail.](https://assets.ai.engineer/sites/aiecode2025/sha256/5ee20f1fd2201cd28d9fb1fdd7b02048fab7957ff55974ff83ecfdc1f0418d9f.webp)

Prompt instructions accumulate as “debt”

They tax cost

Verification rituals
“verify twice before answering” — measured +48% cost per ticket, zero accuracy change

Thoroughness boosters
“be maximally thorough” — unneeded tool calls per ticket go 0.07 → 0.95, old model vs new

Procedure & scratchpad scaffolds
step-by-step templates that stack on top of the model’s native thinking

Worked-example stuffing
few-shot examples that teach long reasoning chains the model doesn’t need

Anti-laziness tool boosters
“always check the docs first” — forced lookups with nothing to look up

Dead weight
runbooks for features you no longer have — read and paid for every request

They break accuracy

Contradictory rules
two rules added months apart; the model quotes both and freezes — measured −9 accuracy points from one planted pair

They break outright

Dated configuration
settings for an older API generation — rejected or silently reinterpreted

ANTHROPIC
Claude Blog
02

### Claude Code prompt-audit commands

[2:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=165s) [Two stacked boxes show prompt-audit commands in large monospace text. The upper command starts with /checkup and the lower with /claude-api.](https://assets.ai.engineer/sites/aiecode2025/sha256/a9b5c62baa4d3fe6d84267dccc94757a2b3b605abc8c8ef7971e9b782e7cd934.webp)

Run these commands in Claude Code

/checkup prompt-audit

/claude-api prompt-audit

ANTHROPIC
1
1

### Cost per ticket and accuracy before and after a prompt audit

[3:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=225s) [A diagram shows a legacy prompt shortened by an audit. Beside it, arrows connect three points on a chart: Opus 4.8 legacy at 2.45¢ and 88.1% accuracy, Opus 5.5 unaudited at 2.02¢ and 90.0%, and Opus 5.5 audited at 1.83¢ and 92.0%.](https://assets.ai.engineer/sites/aiecode2025/sha256/d62b5e863a5099504969927ef6f5b027605f9dde8884af4233c8e8adc83f07f7.webp)

Often can improve performance and reduce cost

Legacy prompt (written for Opus 4.8)
/claude-api prompt-audit
Audited prompt

accuracy
95%
92.5%
90%
87.5%
85%

Opus 5.5 audited
1.83¢ · 92.0%
prompt-audit
Opus 5.5 unaudited
2.02¢ · 90.0%
model upgrade
Opus 4.8 legacy
2.45¢ · 88.1%

1.5¢   1.75¢   2.0¢   2.25¢   2.5¢
cost per ticket

ANTHROPIC
Claude Blog
02

### Cached and new tokens across four turns

[5:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=334s) [Four rows show what each turn sends to the model. Turn 1 contains only new tokens. Each later row starts with a longer cached block and ends with a block of new tokens.](https://assets.ai.engineer/sites/aiecode2025/sha256/5f685642715376f7f0994de9947371134253307d00c079a2663d9f13ec3aec7d.webp)

turn 1   new   → sent to model
turn 2   cached   new   → sent to model
turn 3   cached   new   → sent to model
turn 4   cached   new   → sent to model

already sent in turns 1–3, resent again

new tokens — full input price
cached tokens

ANTHROPIC
04

### Caching is a strict prefix match

[6:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=373s) [Two ten-position request diagrams compare cache reads. The top row reuses positions 1–8. Changing the time from 9:41am to 9:42am at position 4 leaves only positions 1–3 cached in the bottom row.](https://assets.ai.engineer/sites/aiecode2025/sha256/616644eddcfe1f830126ddf99ae7357406a0cab1a6590fbf27ff3aa58528a302.webp)

Caching is a strict prefix match

Next request, prefix identical
position 10’s activations are computed from tokens 1 ... 10 — the whole prefix, byte for byte
tools   tools   system   9:41am   system   user   assistant   user   assistant   user
1   2   3   4   5   6   7   8   9   10
identical to the cached prefix — positions 1 ... 8 re-read from cache at 0.1×
new tokens — full price

Next request, one byte changed at position 4
one byte changed in the system prompt: 9:41am →
9:42am
tools   tools   system   9:42am   system   user   assistant   user   assistant   user
1   2   3   4   5   6   7   8   9   10
still cached — 0.1×
re-billed at full price — even though these bytes didn’t change

cache read · 0.1×
full price
the changed byte

ANTHROPIC
05

### Claude Console provides cache diagnostics

[6:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=391s) [Two dashboard cards show a 71.3% cache read ratio and 12.4B cache read tokens. Below, a stacked bar breaks down missed tokens for Claude Opus 5, with system changes accounting for the largest segment.](https://assets.ai.engineer/sites/aiecode2025/sha256/ae983ce253fcb049a4176d24d697df0ed0f211ff1c8c91b91cecf8181ea17456.webp)

Claude Console provides cache diagnostics

Cache read ratio
71.3%
↑ 8.2%
vs previous 7 days

Cache read tokens
12.4B
↑ 11.4%
vs previous 7 days

Cache miss tokens
Model	Cache misses	Total missed tokens	Missed tokens by reason
Claude Opus 5	28.4k	1.2B
Messages changed	System changed	Tools changed	Model changed

ANTHROPIC
06

### How to organize the prompt prefix

[6:59](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=419s) [Five rows order the prompt from globally cached system instructions and tools through project memory and session state to messages that grow each turn.](https://assets.ai.engineer/sites/aiecode2025/sha256/aa2a53247b65c54c96fc225373df8862178cdea18da2f0f00690a14142937357.webp)

How to organize the prompt prefix

System instructions	globally cached
Tools	globally cached
CLAUDE.md, memory	cached per project
Session state	cached per session
Messages	grows each turn

ANTHROPIC
07

### Run this in Claude Code

[7:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=439s) [A centered box displays the Claude Code command /claude-api cost-optimize.](https://assets.ai.engineer/sites/aiecode2025/sha256/d92f4bc41c0648592858ba08aed001df6826d935c1bdb680a1d6dc84f8187b4a.webp)

Run this in Claude Code

/claude-api cost-optimize

ANTHROPIC
08

### cost-optimize can reduce cost by fixing prompt caching

[7:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=461s) [Bars show cost per run falling across four benchmarks, from a 24.3% reduction on SWE-bench Verified to 72.9% on tau2-bench (retail). Beside each bar, a dot and whiskers show the score change and its 95% confidence interval.](https://assets.ai.engineer/sites/aiecode2025/sha256/d6f1b7508a89cb0fcb40196fafde66c0730e36fe587b88a53204940f38fa1217.webp)

cost-optimize can reduce cost by fixing prompt caching

tau2-bench (retail)
customer-service agents
−72.9%	$48.68 → $13.20	+2.6pp
95% CI −2.1 to +7.3

LegalBench
legal classification
−66.9%	$38.46 → $12.74	−0.8pp
95% CI −1.3 to −0.3

OfficeQA Pro
document Q&A
−71.7%	$252.14 → $71.26	+1.5pp
95% CI −4.0 to +7.0

SWE-bench Verified
agentic coding
−24.3%	$14.42 → $10.92	+1.1pp
95% CI −2.6 to +4.8

0%　25%　50%　75%　100%
cost per run, as a share of baseline
−12　−8　−4　0　+4　+8　+12
score change (percentage points)

ANTHROPIC
Claude Blog
09

### Model score versus action tokens per attempt

[9:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=572s) [Three curves rise and flatten from low to high effort. The frontier model scores highest at each effort level, followed by the mid-size and smaller models. Short error bars mark each point, and all three curves stay below the perfect-score line.](https://assets.ai.engineer/sites/aiecode2025/sha256/791d39e48d82acf60dbef02a0c37aaa494f958dec4f046adb634fa06a0da036c.webp)

Frontier model
Mid-size model
Smaller model

perfect score
score
low effort	medium effort	high effort

① performance improves with a more capable model
② performance improves with more thinking (higher effort)
③ headroom left to improve
④ low run-to-run variance

action tokens per attempt (log scale)

ANTHROPIC
Anthropic Developer Blog

### Beware of overfitting

[12:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=731s) [Arrows connect five benchmark features to corresponding harness choices. Four solid arrows show adaptations such as adding an OCR tool. A dashed arrow marks the outright leak of fetching a reference solution from a public repository.](https://assets.ai.engineer/sites/aiecode2025/sha256/250b47ca09024d4563280ed47139683eb59f8ac10a559feecddb72e34990704d.webp)

Beware of overfitting

The benchmark	shapes the harness	The harness
· task mix needs OCR	→	+ OCR tool
· tasks live in /app	→	+ always cd /app, run pytest
· distinctive phrasings	→	+ prompt tuned to phrasings
· failures you've read	→	+ one patch per failure
· public repo with answers	⇢	+ curl the reference solution

dashed = the outright leak

ANTHROPIC
Anthropic Developer Blog
02

### Evaluating one proposed change per round

[13:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=827s) [A feedback loop shows an analyzer using training failures to propose one edit while the model and harness stay fixed. Train and held-out test scores determine whether to keep the edit.](https://assets.ai.engineer/sites/aiecode2025/sha256/ba90876d5c4ba951c4124d413040ebbbb0ab97b4d2288a9bbbfc357da2333b17.webp)

Surface
The thing we edit
(e.g. a prompt)

Application
model + harness,
held fixed

+

Eval
Test split
held out: never shown
to the analyzer
scored every round

Train split
case 1 — pass
case 2 — fail
case 3 — fail

pre-flight: baseline × N reps
sets the noise floor

Decision
train ↑ test ↑
keep the diff

train ↑ test flat
overfit — revert

either ↓
regression — revert

train-split traces + scores
(focuses on failures)

Analyzer
Reads train failures,
forms a hypothesis
test split stays unseen

proposed diff
one change per round

ANTHROPIC
Anthropic Developer Blog

### Pass rate rises from 66.1% to 87.9% over 24 hillclimb rounds

[14:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=897s) [A line chart tracks pass rate across three phases of skill and grader edits. It rises from 66.1% at baseline to 87.9% at round 24, with small dips at rounds 9 and 13.](https://assets.ai.engineer/sites/aiecode2025/sha256/7e3eb01078f3774dc4f9daeb15d60318bea4a927ad2d33c622a30b53354f3af2.webp)

pass rate (%)
65%   75%   85%

①
adding missing sections
and type tables

②
fixing how
the skill tells
Claude to
write code

③
fixing graders,
plus more
skill edits

baseline   66.1%
round 6   74.3%
round 9   74.0%
round 11   77.5%
round 13   77.2%
round 17   80.1%
round 22   84.0%
round 24   87.9%

hillclimb round

ANTHROPIC
Anthropic Developer Blog
08

### Cost per ticket and train-split decision accuracy across four configurations

[16:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=989s) [Dashed arrows connect four points. Moving from Opus 4.8 to Opus 5 raises accuracy and lowers cost. Switching to Sonnet 5 lowers both, then a prompt edit restores accuracy to near 100% at about 1¢ per ticket.](https://assets.ai.engineer/sites/aiecode2025/sha256/95f2fb8f80f4ee68a8ad8edf9864c4a304a191455286a54b9215c5b402310332.webp)

decision accuracy (%, train split)
60   80   100

1 · Opus 4.8 | high effort
baseline
starting accuracy, 74.4%

2 · Opus 5 | low effort
move to higher tier & audit prompt

3 · Sonnet 5 | low effort
drop to Sonnet 5 at low effort

4 · Sonnet 5 | low effort
improve prompt

adopted path · train-split read

1¢   2¢   4¢
cost per ticket (cents, log scale)

ANTHROPIC
Claude Blog
02

### Human task duration across six Claude models

[19:12](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1152s) [Six points rise from 4 minutes for Claude 3 Opus to 12 hours for Claude Opus 4.6 on a 2024–2026 timeline. The background progresses from autocomplete and chat through local agents to remote agents.](https://assets.ai.engineer/sites/aiecode2025/sha256/f880b005674e6275696229a10ddc301cb890aecd5f77efca19041e763cbd769f.webp)

Task duration (time for a human)

Autocomplete / Chat
Synchronous local agents
Asynchronous remote agents

1 day
12 hr
4 hr
1 hr
10 min
1 min

Claude 3 Opus
4 min

Claude Sonnet 3.5
21 min

Claude Sonnet 3.7
1 hr

Claude Opus 4
1.7 hr

Claude Opus 4.5
4.9 hr

Claude Opus 4.6
12 hr

2024   2025   2026

ANTHROPIC

### Harness connections to tools, session, sandbox and orchestration

[20:20](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1220s) [A central harness connects to tools and resources above, a session on the left, a sandbox on the right and orchestration below. Each connection has a solid arrow pointing out and a dashed arrow pointing back.](https://assets.ai.engineer/sites/aiecode2025/sha256/21035d4152c8fe3206efd6a1eeb1ac3972d32c7e8b89b1aeb51846588f13a7e7.webp)

Tools
+Resources/MCP

Session          Harness          Sandbox
                                  </>

Orchestration

ANTHROPIC
Anthropic Engineering Blog

### How a scheduled agent reads sources and delivers a brief

[22:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1327s) [A schedule wakes the agent to read sources, update its state and consult reader preferences. Guardrails surround the agent and its duplicate-post check. An approved destination delivers the brief to the reader, who can update preferences.](https://assets.ai.engineer/sites/aiecode2025/sha256/7cc12347933a6a1ba3f037765e9a93e6dac6c0ce2bd7769325c79b08846b8be5.webp)

Schedule
scheduled deployment
wake

Sources
read-only
via MCP or HTTPS
credentials from a vault
read

Guardrails
Caps on turns, time and spend
Heartbeat that someone watches

Agent
model + prompt
the run loop and the judgement rules

Already
posted?
post

Destination
one tool, one place,
approved in advance
deliver the brief
Reader

Memory
read   write
State
the agent writes it
a bookmark per source,
what it has said, a log of every run

read
Preferences
the reader writes, the agent reads
scope, length, who gets notified,
quiet days, when to stop

write

ANTHROPIC
Anthropic Developer Blog

## Full transcript

[0:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=0s) We can kick it off. Thank you all for coming. I'm Lance. I'm a member of technical staff at

[0:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=17s) Anthropic. And I actually want to share some very simple things with you today. A few simple ways to

[0:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=23s) get the most out of frontier models. So we typically think of cost and quality as a trade-off. So in order to get better performance, you have to spend more money. And in order to kind of reduce cost, you have to sacrifice performance. And so you can kind of think about on any given evaluation, you have models that kind of create this Pareto frontier. And you can imagine in this case, Fable is kind of up on the far right of the curve. And then you have Opus. You have Sonnet. Then you have Haiku.

[0:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=53s) Now what I want to share is actually that many times you're not actually on this frontier. Your application is actually sitting inside this frontier that you could be on. And it's because of minor misconfigurations, which I'm going to show you today how to fix. And we've seen this repeatedly improve performance and reduce cost for many customers using some very simple things.

[1:20](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=80s) So first, I'm going to cover five themes. And then we can make an interactive. The slides won't take an hour, not even close. So question answering is actually much more fun.

[1:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=91s) First, audit your prompts. This is a kind of important point that prompts accumulate debt just like code.

[1:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=101s) So if you recall, several generations ago, we used to use things like think step by step. We used to use verification rituals, double check your work.

[1:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=109s) We used to use thoughtfulness boosters, be maximally thorough. Sometimes we would use kind of scratch pads, tell the agent how to think, give it places to think.

[1:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=118s) You don't need that anymore. Frontier models are very good at thinking, choosing when to think.

[2:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=127s) They don't need to be told what to do and like kind of how to verify their work. They naturally verify their work.

[2:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=133s) They don't need to be told to be thoughtful. They're already very thoughtful.

[2:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=138s) And worse, when you do these things, it actually increases cost and can reduce performance in some ways I'll talk about briefly.

[2:26](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=146s) Another interesting one, with earlier models, if your prompt had contradictory rules in them, earlier models that weren't as good at instruction following would kind of ignore one of the two rules.

[2:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=157s) So it kind of still worked. But with frontier models, they'll often get confused by contradictory rules.

[2:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=163s) So I'm going to give you one very simple thing to do right now, if you have any code that you want to check.

[2:50](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=170s) In Cloud Code, you can run this command, checkup prompt audit.

[2:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=174s) You can also run cloud API prompt audit.

[2:56](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=176s) These are two different skills in Cloud Code.

[2:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=178s) They link to the same code.

[3:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=180s) It's just checkup is typically how people do checkups on their Cloud Code configuration itself.

[3:05](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=185s) So your skills, your prompts within Cloud Code itself.

[3:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=189s) The Cloud API skill is a separate skill bundled in Cloud Code that's meant for a kind of code that uses our APIs.

[3:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=195s) But both of these commands use the same principle and they kind of link down to the same underlying skill itself.

[3:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=201s) It's just two different ways to call it.

[3:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=204s) These skills will audit your code, anything in the working directory of Cloud Code.

[3:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=210s) So that could be skills, that could be tools, that could be prompts for these anti-patterns and we'll remove them for you.

[3:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=214s) This has become kind of very popular.

[3:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=217s) Many people use it within Anthropic.

[3:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=219s) It's kind of become somewhat popular on Twitter as well.

[3:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=222s) It's very simple and often it can improve cost and performance.

[3:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=229s) So here's an example where this is an evaluation that I built.

[3:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=234s) It's a synthetic evaluation of customer support tickets.

[3:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=237s) There's like 50 tickets.

[3:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=238s) And what I do is I start with Opus 4.8 and I basically simulate a migration to Opus 5.5.

[4:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=248s) Okay.

[4:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=249s) And in this process I inject each anti-pattern individually and measure the result.

[4:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=255s) That's this middle point.

[4:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=257s) Okay.

[4:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=258s) So what happens is it's taking the average of all the anti-patterns across the benchmark basically.

[4:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=263s) The key point is this.

[4:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=264s) When I do the migration to Opus 5.5 from 4.8 initially with these kind of anti-patterns injected, we do see some cost savings and a little bit of performance savings.

[4:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=276s) You can see it goes to the left and it goes up a bit.

[4:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=279s) If I run prompt audit on top of that, I get a further bump both in performance and cost reduction for a bunch of different reasons.

[4:48](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=288s) Because this command is going through and it's removing verification rituals, boosters that are actually causing Opus 5.5 to expend excessive tokens.

[4:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=297s) So this little simple command often will basically reduce token use, saving cost, and it can improve performance in cases where things like contradictory prompts or confusing frontier models.

[5:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=311s) So it's a very simple command that I recommend and we've used it very extensively within Anthropic and also many customers have enjoyed this quite a lot.

[5:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=318s) It's very simple to run.

[5:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=319s) You can run it kind of in any code using the API or even on your cloud code configuration to make sure your prompts are kind of well-tuned for frontier models.

[5:28](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=328s) That's point one.

[5:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=330s) Now point two is make sure you're using the prompt cache.

[5:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=334s) This is probably pretty familiar to many users, but I do just want to make sure it's extremely clear.

[5:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=339s) So agents, for example, operate across many turns.

[5:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=344s) Every turn adds just a little bit.

[5:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=345s) For example, one tool call.

[5:48](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=348s) Much of kind of the context is repeated across turns.

[5:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=351s) You don't want to pay for it twice.

[5:52](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=352s) That's why you can use the prompt cache.

[5:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=354s) So prompt cache is billed at like a tenth the rate of base token.

[5:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=358s) So it's much cheaper.

[5:59](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=359s) Varies a bit per model.

[6:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=361s) I think a tenth is, I think, the current pricing, but you can check the pricing pages.

[6:05](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=365s) The point is it's much cheaper.

[6:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=367s) It's also much faster.

[6:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=369s) So it's very important in multi-turn applications to be making heavy use of the prompt cache.

[6:14](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=374s) Now the problem is prompt cache are a strict prefix match.

[6:20](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=380s) So any, even a byte change in your prefix will invalidate the cache.

[6:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=385s) So you have to be careful in building agents or multi-turn applications that you don't break the prompt cache.

[6:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=389s) That's the key point.

[6:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=392s) And Cloud Console, if you're using the API, has nice diagnostics for you.

[6:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=396s) So if you're building applications with a Cloud API, you can see for your application your prompt cache hit rate, which is very important to track.

[6:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=402s) For example, with Cloud Code, we track the prompt cache hit rate very, very religiously.

[6:48](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=408s) It's very important for economics of the application, obviously.

[6:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=411s) And it's also, in your cases, if you're building apps with the Cloud API, it's very, very important to make sure you're making heavy use of the prompt cache.

[6:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=418s) Now, in general, how to organize your prompts.

[7:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=423s) You can think about, basically, system instructions, tools, things that are globally cached across all of your sessions.

[7:10](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=430s) You can think about Cloud MD and memory.

[7:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=431s) That's kind of cached per project.

[7:14](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=434s) Session state is kind of per session.

[7:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=435s) And then messages kind of increment at each turn.

[7:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=437s) So that's kind of how you want to structure your prompts.

[7:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=439s) And the key point is this.

[7:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=442s) Run this in Cloud Code.

[7:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=443s) So if you have a project using the API, you want to make check and make sure that you're making proper use of the prompt cache, you can run this.

[7:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=450s) It'll run diagnostics to make sure that you're using the prompt cache effectively.

[7:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=454s) It'll find opportunities to reorganize your prompts to make sure that they're organized such that you get a high prompt cache hit rate.

[7:40](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=460s) That's really the key point here.

[7:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=461s) And this is kind of a fun exercise.

[7:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=465s) So myself and some folks on our applied AI team ran this command on a bunch of internal benchmarks that had kind of default harnesses.

[7:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=473s) We found opportunities to reduce costs by up to 72% with no meaningful change in performance just by running this command because some of the harnesses on these evals were not using the prompt cache properly.

[8:05](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=485s) Really simple command.

[8:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=486s) You can run it in your API code and it'll just look for opportunities to make sure you're saving as much cost as you should be, i.e. by using the prompt cache.

[8:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=493s) It'll also check for other things.

[8:14](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=494s) It'll look for, I'll talk about it a little bit later, but it'll also check your effort levels.

[8:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=499s) It'll check your prompts.

[8:20](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=500s) So it'll do a number of other things, but in particular, it'll look at your prompt cache to make sure you have a high prompt cache hit rate.

[8:26](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=506s) Again, this has, you know, optimized prompt cache has no change in performance.

[8:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=512s) It's like effectively just free cost savings.

[8:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=514s) So it's something to be very serious about when you're building applications with the API in particular.

[8:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=518s) It's something to very seriously make sure you're utilizing effectively.

[8:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=525s) So I want to get into some other fundamentals.

[8:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=529s) We talked about prompt caching.

[8:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=531s) We talked about making sure your prompts are kind of well, that are well tuned.

[8:55](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=535s) You can audit them using the prompt cache.

[8:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=537s) Now let's talk about a few other things that are very important for working with frontier models.

[9:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=542s) So Claude, frontier Claude in particular, is very good at self-correction.

[9:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=548s) So if you give Claude a well-structured evaluation, it can basically just hill climb in that eval, and I'll talk about that in a minute.

[9:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=556s) But important in that is good eval design.

[9:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=559s) And you have to give Claude an evaluation that is climbable.

[9:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=563s) And so actually, we spend a lot of time thinking about eval design and making sure Claude is set up for success when building an eval and setting up hill climbing.

[9:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=571s) So some general features of good eval design.

[9:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=576s) This is basics.

[9:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=577s) This is nothing related to Anthropics.

[9:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=579s) This is just kind of fundamentals.

[9:40](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=580s) But it's good to revisit briefly.

[9:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=583s) What you should see generally is that these are a number of different curves looking at basically tokens per attempt.

[9:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=589s) This is kind of like thinking on the X and then score on the Y.

[9:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=593s) Frontier model at the top, mid-sized model in the middle curve, small model at the bottom.

[9:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=598s) So think about that as like Opus, Sonnet, Haiku.

[10:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=600s) You should generally see on your evaluation as you step up model and performance goes up.

[10:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=606s) That's point one.

[10:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=607s) As you increase thinking performance should go up.

[10:10](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=610s) That's point two.

[10:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=611s) There should be headroom to improve at the frontier.

[10:14](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=614s) So that's point three.

[10:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=616s) So basically it shouldn't be saturated.

[10:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=618s) And there should be low run-run variance.

[10:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=621s) Very simple points, but actually very important to get right.

[10:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=624s) And actually even a lot of very popular evaluations that we see have many tasks that are ambiguous,

[10:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=629s) effectively limiting that headroom at the frontier.

[10:33](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=633s) And this is a problem I see all the time.

[10:35](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=635s) You build an evaluation.

[10:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=636s) It turns out you have a bunch of ambiguous cases that can't be solved anyway.

[10:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=639s) So it looks like, oh, I have 20% more that I can get on this, but no model can actually achieve it.

[10:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=645s) So you could spend many tokens hill-climbing on an evaluation that's effectively saturated.

[10:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=649s) It's very important to get this right.

[10:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=653s) Try this command.

[10:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=654s) Cloud API build eval.

[10:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=657s) This is actually a very nice command because it's not opinionated at all about where your data lives.

[11:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=663s) It doesn't care.

[11:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=664s) You can point this at whatever tracing solution you have.

[11:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=667s) It's just a skill in cloud code.

[11:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=668s) It's more employing the principles I talked about to test and sanity check the evaluation for you.

[11:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=675s) So you can kind of give this skill, hey, here's a problem I want to solve.

[11:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=679s) Here's what I'm interested in.

[11:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=681s) Here is the raw data.

[11:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=682s) For example, here's the traces that I want to work with.

[11:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=685s) And this command can help you build an eval set.

[11:26](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=686s) It'll walk you through a process and step you through building it.

[11:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=691s) It'll show you the data.

[11:33](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=693s) It'll show you the evaluation.

[11:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=694s) It'll sanity check the greater the criteria with you.

[11:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=697s) So it'll kind of walk you through the process of building eval based upon some of our best practice.

[11:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=702s) And we have a nice blog post on this as well that I'll share.

[11:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=707s) And it pairs very well with hill climbing.

[11:50](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=710s) So once you've built a good evaluation that is headroom at the frontier, low variance, scales as expected with thinking and model, you can then climb on it.

[11:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=718s) Frontier cloud models are very, very effective at hill climbing.

[12:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=721s) So autonomously look at an evaluation and autonomously kind of improving on it without you in the loop.

[12:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=728s) So you build a good eval, clock and hill climb on it.

[12:12](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=732s) The problem is there's many ways that this can kind of go wrong.

[12:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=737s) And in particular, you can end up overfitting on the evaluation itself.

[12:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=741s) So like some classy examples would be like the task in your benchmark have particular needs that are bespoke or specific to those tasks.

[12:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=752s) Like maybe one task needs OCR.

[12:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=754s) So what happens is your harness to solve the eval adds like an OCR tool.

[12:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=758s) But in production, you don't see that problem.

[12:40](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=760s) So you end up overfitting on the eval distribution.

[12:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=763s) It doesn't apply to production.

[12:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=765s) This is very common.

[12:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=765s) Yeah, like distinctive phrasing specific to your eval examples.

[12:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=773s) For example, another classic is like it just kind of it like the prompt when you're basically hill climbing overfits the specifics of your eval distribution.

[13:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=782s) It doesn't apply to your to your test distribution.

[13:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=784s) So overfitting is the major challenge concern when you're hill climbing.

[13:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=788s) Imagine you spend a lot of tokens hill climbing in evaluation.

[13:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=791s) It looks really good after hill climbing.

[13:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=793s) You run it in production and performance is not better at all.

[13:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=796s) That's frustrating because you spend a lot of money.

[13:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=798s) You hill climbed and like, oh, it's not applicable to Russians because often you've just kind of overfit to the eval distribution.

[13:26](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=806s) So try this command in cloud code is cloud API hill climb.

[13:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=811s) So if you build an eval, it'll hill climb for you.

[13:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=814s) And it tries to combat this with a few tricks.

[13:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=818s) Now, it's, of course, not perfect yet to audit this carefully and indeed be in the loop and make sure you really understand what's happening.

[13:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=824s) But it can help you.

[13:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=825s) And in particular, what it does is a process like this.

[13:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=831s) It will look at your evaluation and it will split into test and train sets.

[13:56](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=836s) This is kind of very classic kind of classic principles from statistics.

[14:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=840s) Create a test and train split.

[14:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=842s) What happens is when hill climbing, this is just on cloud code, by the way.

[14:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=846s) So cloud code basically has this skill.

[14:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=848s) You run it on an eval.

[14:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=849s) It will only ever look at the train split and reflect on those failures when it's making decisions about what to change to improve on the eval.

[14:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=858s) So what's nice about that is at every round, it never sees a test split.

[14:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=864s) And it will basically check performance per round against test and train.

[14:28](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=868s) So what happens is it's a little early signal for overfitting.

[14:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=872s) If you see train improving but test flat, it's a signal, ooh, you might be overfitting.

[14:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=877s) So basically it applies this check and a number of other more subtle things to check to make sure while hill climbing is happening, you aren't just overfitting to your eval distribution.

[14:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=887s) You're actually hill climbing in a way that will apply to production.

[14:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=891s) Assuming you built your eval distribution well.

[14:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=893s) And that's always something that we can address in that build eval phase.

[14:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=897s) Now I'll share some concrete examples that I've used here.

[15:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=901s) So this is actually the Cloud API skill itself.

[15:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=904s) So if I back up a little bit, this is a skill in Cloud code.

[15:10](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=910s) And it is a skill that gives Cloud full awareness of our APIs.

[15:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=915s) So basically our SDKs, APIs.

[15:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=918s) And it has to be grounded in our documentation.

[15:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=922s) So I built an eval set based upon our documentation.

[15:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=925s) And I tested the skill.

[15:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=927s) The skill initially was not very good at the eval questions in my set, 66%.

[15:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=932s) So I set up a hill climbing loop with giving Cloud code access to the skill text and the documentation itself.

[15:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=939s) And let it basically just iteratively look at the failures in the eval set and try to figure out why the skill was misrepresenting what's in the documentation.

[15:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=947s) And there's all sorts of little tricks.

[15:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=949s) And I could talk about that in more detail.

[15:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=951s) But the point is, Cloud can autonomously find, in this particular case, the right skill text to improve significantly on the evaluation.

[16:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=960s) And I talk about this in the blog link below.

[16:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=962s) But again, this is a good example of a kind of a well-scoped evaluation, a simple surface on modifying a skill, and an autonomous hill climbing loop that results in a much better performance.

[16:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=973s) Just when I set the system up this way with a carefully scoped eval, a surface that's easy to modify, Cloud can just rip through it and significantly improve performance.

[16:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=982s) This works well for prompts.

[16:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=983s) It works well for skills.

[16:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=985s) Simple text-based surfaces are very, very good for this kind of hill climbing process.

[16:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=989s) Now, this is another kind of interesting trick that I've seen a lot of customers like.

[16:35](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=995s) You can also apply hill climbing to cost reduction.

[16:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=999s) So what's kind of nice about this is I've added guidance to this hill climb command.

[16:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1004s) If you tell it to reduce cost, what it'll do is it will basically try to find a configuration that is at least at parity in performance and for sure reduces cost.

[16:55](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1015s) And it'll search things like effort, model, and your prompts.

[16:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1017s) Here's a simple example on that same customer support benchmark.

[17:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1022s) I start with Opus 4.8 high and some baseline prompt.

[17:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1026s) And I basically tell the hill climber, reduce cost.

[17:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1029s) So what it does, it basically will search through model effort combinations and basically pick those that continuously reduces cost over the rounds without degrading performance.

[17:20](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1040s) In this case, it moves to Opus 5 low.

[17:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1043s) We see a big bump in performance, a minor reduction in cost.

[17:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1047s) The hill climber then autonomously tries Flaunt 5 low.

[17:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1050s) We see, again, degrades performance a bit, but big cost reduction.

[17:35](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1055s) And then it then decides to tune the prompt and we kind of rescue the performance.

[17:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1059s) So we basically got a 90% reduction in cost with notable improvement in performance autonomously using the hill climber.

[17:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1066s) So this is another very nice way if you have an evaluation, you can use the hill climber to basically say, okay, keep performance fixed but reduce my cost materially by tuning things like effort, things like model selection, and my prompts.

[17:59](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1079s) Another very nice use of the hill climber.

[18:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1080s) And actually what's nice about this is you can do this if you have a saturated eval.

[18:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1086s) So you can basically say, okay, say my eval is saturated, fine, it doesn't matter.

[18:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1089s) I don't care about performance.

[18:10](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1090s) I just want to reduce cost.

[18:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1091s) So then you can just tell the hill climber, okay, keep performance fixed and just try to burn down cost.

[18:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1096s) And it can basically search for configurations.

[18:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1098s) And often you'll find very interesting things.

[18:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1101s) Like in this particular case, there's generally an intuition that moving to higher models at lower effort is often cheaper and more performant than lower models at high effort.

[18:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1110s) It's like giving someone who's smarter, can like try less to actually get a better objective or to kind of solve the problem more effectively.

[18:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1119s) And so it ends up actually using fewer tokens and as a result ends up being cheaper.

[18:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1123s) That's kind of a broad intuition here that we've seen quite a bit.

[18:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1126s) And that's baked into this hill climber skill.

[18:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1129s) So another nice trick.

[18:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1133s) Now I'm going to open up to questions pretty soon.

[18:55](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1135s) I'll just kind of close with some other comments.

[18:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1137s) And this is a bit of a nod to the manage agent stuff you heard this morning.

[19:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1141s) I just want to reemphasize this a little bit.

[19:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1142s) I do think as part of unhobbling the frontier, it's very important to design harnesses that can take most advantage of the latest cloud models.

[19:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1153s) And in particular, it's interesting.

[19:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1155s) If you look back the last few years, time is on the X.

[19:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1159s) And this is task duration for a human on the Y.

[19:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1162s) You've seen these curves.

[19:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1163s) These are just meter charts.

[19:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1165s) It's interesting to think back.

[19:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1167s) You know, Claude Opus 3 was capable of only like four minutes of autonomous work.

[19:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1172s) And in that kind of regime, there are very limited products you could build.

[19:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1176s) It was really auto-completion or chat.

[19:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1177s) Now we saw over the course of 2025, models become more capable.

[19:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1181s) They can do like hours of work.

[19:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1182s) Like maybe an hour to two hours of human-oclevant work.

[19:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1185s) Claude code obviously kind of gained significant popularity over the past, over 2025.

[19:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1191s) And we're kind of entering a new regime now where these task durations for models are exceeding like a day to two days.

[19:59](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1199s) I think this is kind of outside the scope of what Mater can even measure now.

[20:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1202s) But in this regime where you have models that can do the equivalent of like, say, days of work, what harnesses do you need?

[20:10](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1210s) Like the considerations change quite a bit.

[20:12](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1212s) Because you want models that can just do things autonomously for very, very long periods of time.

[20:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1216s) Now how do you make sure they're secure and reliable?

[20:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1218s) The considerations change a lot.

[20:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1221s) And you heard a bit about this morning.

[20:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1223s) But this is actually the motivation behind one of our newer APIs called Cloud Managed Agents.

[20:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1229s) And the principle here, I wrote this eng blog back in April on it.

[20:33](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1233s) Is decoupling the brain from the hands.

[20:35](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1235s) And the idea is pretty simple here.

[20:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1237s) You have an agent harness, which is effectively the brain.

[20:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1239s) You have hands, which are sandboxes.

[20:40](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1240s) That's where the agent harness writes code and performs actions.

[20:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1243s) And you want those to be separate things.

[20:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1246s) In particular, you want that, you want it to be the case that if the harness dies or the sandbox dies, the system can recover.

[20:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1253s) Imagine you have an agent that you spin up overnight to just run.

[20:56](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1256s) And the sandbox dies midway through the night.

[20:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1258s) It's very frustrating.

[20:59](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1259s) You lose state.

[21:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1260s) You lose your session log and everything.

[21:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1262s) So when we designed this, we designed this for a world where Cloud will be doing work for very, very long durations.

[21:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1267s) And so it's recoverable.

[21:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1268s) So that means the session log is an independent object separate from the harness, separate from the sandbox.

[21:14](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1274s) That is append only.

[21:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1275s) That is recoverable.

[21:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1276s) So if the harness dies, the sandbox dies, you can always recover from the session log.

[21:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1281s) Sandboxes are also recoverable.

[21:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1283s) So if a sandbox dies, you can boot up a new one.

[21:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1285s) If the harness dies, you can boot up a new one through this orchestrator.

[21:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1287s) Another point here is safety.

[21:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1290s) So one of the important things that managed agents does is it actually never gives Cloud direct access to secrets.

[21:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1296s) Secrets are held in vaults.

[21:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1298s) And that's actually stored in that kind of tools box you see at the top.

[21:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1301s) So vaults ensure that Cloud can reference API keys or secrets, but it can't actually see them.

[21:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1306s) Because obviously if you have an agent that's working for, say, days on end, it's a little bit spooky to give it direct access to very sensitive secrets.

[21:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1314s) And so we ensure that security is a very important consideration when we build manage agents.

[22:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1320s) So reliability and security become much more important as agents can operate for hours, days, and maybe soon weeks.

[22:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1329s) And this morning you probably heard more about this, but we have a nice recent blog that I put out with CJ that walks through an example of basically building an agent that can serve as like kind of an agent automation for regular context updates.

[22:26](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1346s) It can reach into different sources that you specify.

[22:28](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1348s) It can write updates to Slack.

[22:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1350s) Very simple automation example.

[22:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1352s) It's highly customizable.

[22:33](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1353s) But it shows how all these different primitives come together.

[22:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1356s) It brings together a scheduled deployment.

[22:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1358s) This all runs on Anthropic infrastructure.

[22:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1361s) It securely stores secrets.

[22:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1363s) It has memory.

[22:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1365s) And it's a very nice kind of end-to-end example.

[22:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1369s) Now again, the final point is you can just run this in Cloud code.

[22:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1373s) So run Cloud API, manage it's on board, and then give it the link to the blog.

[22:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1377s) And it'll just boot up this tutorial for you.

[22:59](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1379s) It'll spin up the example, and you can just play with it.

[23:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1383s) So really the key point here is there's a number of ways you can kind of harness and make sure the frontier is effectively unhobbled.

[23:12](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1392s) It is very important to audit your prompts.

[23:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1397s) It's very important to make sure that you're effectively using prompt cache, especially if you're building agents for long duration, to make sure that cost is managed.

[23:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1403s) It's important to think about harnesses that are designed for long duration in terms of reliability and security.

[23:28](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1408s) And it's also important to think about evaluations and hill climbing.

[23:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1412s) And when this all comes together, you're going to have agents that you can give a task, for example, an evaluation, and let it run for a long period of time and hill climb on that evaluation, come back, for example, in the morning, and it's significantly improved.

[23:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1423s) And that's really the way that I see many of my colleagues working now.

[23:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1426s) People are spending much more time on eval design and basically just specifying tasks that Cloud can effectively hill climb on.

[23:52](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1432s) And doing this in a way such that Agent is highly secure when doing this and is highly reliable for long duration jobs.

[24:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1442s) And let's see where we are in time.

[24:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1444s) With that, I think I'll just take it to questions because it's more fun when it's interactive anyway.

[24:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1448s) You can follow me on all the socials here.

[24:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1451s) And thank you for your time and attention.

[24:14](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1454s) Thank you.

[24:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1462s) Sure.

[24:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1465s) Start there.

[24:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1467s) This is a very good question.

[24:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1469s) The question was, how automatable is eval design?

[24:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1472s) So actually, I was engaging a bit with Hamill on Twitter.

[24:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1476s) Extremely thoughtful with respect to evals.

[24:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1478s) And some feedback he had on our skill was that it should indeed walk the user through the data first, which I actually agree with.

[24:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1485s) I'm making some minor modifications to the skill to do that.

[24:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1487s) So I think that eval design, I'll kind of go back to it, Claude can assist you when building evals significantly.

[25:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1500s) So, for example, in the example he gave when his walkthrough, he was looking at like it was a customer support app or something.

[25:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1508s) And the first question was like, okay, like it's a bunch of traces.

[25:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1513s) What are the failure cases here?

[25:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1515s) What should I even like promote to an eval set?

[25:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1517s) So Claude's really good at kind of identifying, ooh, okay, here's cases where there might be errors.

[25:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1521s) It's effectively like acting as like an online evaluator but looking at your offline logs, scanning them, saying, okay, here's some problematic examples.

[25:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1529s) And Claude was very good at that in his example.

[25:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1532s) Then it is actually important and quite useful if Claude then shows those raw, like the raw data to you in a viewer.

[25:40](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1540s) So I'm going to add that to the skill.

[25:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1542s) I have a PR up and I'll add it.

[25:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1543s) Currently, Claude goes directly to analyzing the data and like building an eval and showing it to you.

[25:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1549s) I do think it's important and helpful for there to be an intermediate stage where you look at the data first.

[25:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1554s) But I think having data annotated by Claude or Claude's giving you some ideas about what to look at is very important.

[26:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1560s) So kind of like Claude assisted evaluation and scanning of the data is like I think a nice marriage.

[26:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1566s) And then once that's done, you can kind of promote like examples to your eval set.

[26:10](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1570s) So I think there is still quite a role for the human in the loop there.

[26:14](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1574s) But Claude can assist quite a bit.

[26:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1577s) Hill climb with human feedback.

[26:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1578s) Hill climbing only requires that you have an eval and you have some signal that Claude can use to judge good versus bad.

[26:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1589s) So if you've taken human feedback and you've rolled that into an eval signal, per example, then it should be perfectly feasible to hill climb on an evaluation structure that way.

[26:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1597s) Yeah, this is a good one.

[26:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1599s) So for hill climbing, what's like the best surface to start with?

[26:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1602s) So I kind of have that here is like the thing we edit.

[26:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1605s) Yeah, so I've actually played with this quite a bit.

[26:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1607s) But text is nice.

[26:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1609s) In particular, things like prompts and skills are very nice because it is a very clear place that we know significantly alters and affects model behavior.

[27:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1620s) So it's like a very constrained surface to modify.

[27:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1623s) And we know it's highly coupled to the output typically in terms of like what you're evaluating.

[27:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1628s) Like here's a good example.

[27:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1631s) Like when I'm doing skill hill climbing, I'm testing something that is directly reading from the skill.

[27:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1635s) So I know there's clear coupling.

[27:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1637s) Now I'm going to contrast that to also in hill climbing with agent harnesses.

[27:20](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1640s) But what happens there is it can be a bit more hard to interpret.

[27:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1643s) So you're modifying the harness code.

[27:26](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1646s) And so the changes per round are much larger diffs.

[27:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1650s) And there's just more surface area for confusion.

[27:33](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1653s) You can be making changes that are actually decoupled from the output signature measuring.

[27:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1658s) So it's certainly possible.

[27:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1659s) And indeed, people have done quite a bit of work hill climbing on agent harnesses.

[27:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1662s) I just think it's a little bit trickier.

[27:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1663s) And text-based services are often a good starting point.

[27:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1666s) Prompts, skills.

[27:48](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1668s) Because they're so clearly coupled to model behavior.

[27:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1671s) And they're easy to modify.

[27:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1673s) The catch actually is that things like prompts are very easy to overfit.

[27:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1677s) I've seen that in many of my hill climbing efforts as well.

[28:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1680s) So like, I don't know if I have a good diagram.

[28:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1683s) But you have some eval distribution you're hill climbing on.

[28:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1688s) Even with these regularizations in place, like the eval test train split and so forth,

[28:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1693s) prompts are very easy to wiggle.

[28:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1695s) Claude's very good at wiggling the prompt into a shape that does well in your eval.

[28:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1699s) That isn't really representative of what's in production.

[28:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1702s) So you have to be very careful with prompts.

[28:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1703s) But they are very easy to modify.

[28:26](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1706s) So it's a good starting point.

[28:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1707s) You do it to be careful with overfitting.

[28:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1710s) Let's see.

[28:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1711s) Turning a prompt into a skill.

[28:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1712s) So they're kind of complicated.

[28:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1714s) Like, maybe do you mean if you're like going through some standard operating procedure,

[28:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1719s) when to like promote that to a skill?

[28:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1721s) Okay, yeah.

[28:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1723s) That's actually kind of interesting.

[28:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1725s) I think often, and Claude is quite good at judging that.

[28:48](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1728s) So basically, you can basically go through a workflow.

[28:50](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1730s) And then you can ask Claude, okay, turn that into a skill.

[28:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1733s) I do that all the time.

[28:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1734s) So Claude is pretty good at like catching, okay, you're doing some repetitive thing.

[28:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1737s) Make it a skill.

[28:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1738s) I actually think you should just have Claude do that.

[29:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1742s) Just tell it.

[29:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1742s) Turn this into a skill.

[29:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1743s) Then it'll do it.

[29:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1744s) So usually, in the case of evals, the setup will be, I'll have an existing skill that I've kind of defined.

[29:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1753s) And maybe it has some boilerplate starting text.

[29:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1755s) And I'll say, okay, I want you to make this skill improved.

[29:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1758s) I want to improve this skill text to basically perform better on this eval.

[29:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1763s) So that's usually the way I set it up.

[29:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1764s) Like I have a skill boilerplate as a starting point.

[29:28](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1768s) I know I want this thing to be a skill.

[29:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1770s) Like in this case, right, like I had this skill for the Claude API.

[29:35](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1775s) And it was basically, you can imagine it's basically distillation of our docs.

[29:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1778s) It's like, go to this page if you want to learn about this.

[29:40](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1780s) Go to this page if you want to learn about this.

[29:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1782s) It had a bunch of little gotchas and issues.

[29:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1784s) And so my eval performance was pretty low to start.

[29:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1787s) But I had a starting point.

[29:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1789s) And that's what Claude was able to then modify.

[29:52](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1792s) So I think usually with skills, you're kind of starting with some baseline.

[29:56](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1796s) And it could be like a very crude default.

[29:59](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1799s) But then give Claude something to like start to climb from.

[30:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1802s) That's usually the way I would do it.

[30:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1803s) Right.

[30:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1804s) So verification in domains that have kind of open-ended criteria.

[30:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1811s) So like, yeah, I think in general, heuristic evaluators are preferable, of course.

[30:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1815s) So if you can define like a deterministic check for good or bad, that's obviously preferable.

[30:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1822s) So in domains, that doesn't work.

[30:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1823s) So what I've found is well-structured rubrics that produce similar grades.

[30:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1834s) So okay, a few different things.

[30:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1836s) Build a rubric that you as a human can reason about first.

[30:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1841s) So it's like, let's say we're grading a piece of like text.

[30:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1845s) Is this good or bad?

[30:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1847s) Build a rubric that like I could look at as a human to like look at some text and say,

[30:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1851s) okay, I can grade that.

[30:52](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1852s) That's point one.

[30:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1853s) Point two, don't use arbitrary scales.

[30:56](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1856s) I see this all the time.

[30:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1857s) Like grade it from zero to five.

[31:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1860s) It's very ambiguous.

[31:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1861s) Make it crisp and simple.

[31:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1862s) Like ideally a binary classification, good versus bad.

[31:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1866s) If you want to evaluate multiple things, you can set up like multiple binary classifiers

[31:10](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1870s) rather than, well, the worst thing is give Claude like from one to 10 rate this.

[31:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1875s) That's extremely noisy.

[31:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1877s) Another sanity check, test across different models.

[31:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1879s) Have sonnet, opus, and fable all grade using your rubric.

[31:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1883s) If they all disagree, that's like a bad sign.

[31:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1885s) Another test, run replicates.

[31:28](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1888s) So basically, like I show here how you want low variance, run replicates with your rubric

[31:33](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1893s) and make sure it's tight.

[31:35](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1895s) So if you do all those things, you can definitely make it work pretty well for, yeah, like text-based

[31:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1901s) answers that are squishy.

[31:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1902s) Like there is no very definitive like way to heuristically check that.

[31:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1907s) But elements judged with a good, well-structured rubric can be quite effective.

[31:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1911s) Yeah, that's actually a good one.

[31:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1913s) So actually, I should have mentioned that.

[31:55](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1915s) Pair-wise comparisons can actually be quite good.

[31:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1917s) It's much easier for humans, even models, to kind of compare to artifacts than it is to

[32:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1922s) grade an artifact.

[32:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1923s) Like you can typically answer, oh, I like this web page better than this one versus I'm sure

[32:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1927s) this web page is graded between zero and five.

[32:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1929s) It's much harder.

[32:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1931s) So pair-wise comparisons are pretty effective.

[32:12](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1932s) And actually, I think that is a good way.

[32:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1935s) If your problem allows for that, that actually can be an effective way to deal with more ambiguous

[32:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1942s) gradings.

[32:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1944s) Well, I think it goes a bit back to just looking at the data carefully, kind of related to the

[32:28](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1948s) question asked over here.

[32:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1951s) When I say the distribution, I more mean ensuring that you've sampled some set of cases for your

[32:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1961s) eval set and making sure those cases represent what you actually care about in production.

[32:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1964s) That's really what I mean by distribution.

[32:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1967s) And so there are some interesting tricks here.

[32:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1969s) Like one problem that happens is adversarial sampling, where you select, like this is maybe

[32:55](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1975s) a little bit confusing, but I'll try to explain it clearly.

[32:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1978s) You select cases that are specific failures from a particular model class.

[33:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1984s) So models are jagged.

[33:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1986s) And so you just look at, okay, like Sonnet 5 can't do these examples.

[33:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1989s) I promote them to my eval.

[33:10](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1990s) Well, Opus 5 may be able to solve them all just because intelligence is jagged.

[33:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=1996s) And so like a particular pocket of one model might just get solved by another.

[33:20](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2000s) So typically, a good recommendation is promote eval cases.

[33:26](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2006s) Promote cases of an eval set that are hard or interesting from first principles, from your

[33:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2009s) own intuition, from looking at production data, not necessarily completely sampled from the

[33:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2014s) failures of any given model.

[33:35](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2015s) Because that can result in kind of this odd distribution that's shaped to the valleys

[33:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2019s) of one particular like jagged models intelligence that don't apply when you upgrade models.

[33:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2024s) So like, can you use bucket-based evals?

[33:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2026s) Do you have to use binary classification?

[33:48](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2028s) I'm being a little bit overly prescriptive.

[33:50](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2030s) You obviously can.

[33:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2031s) But just as a general rule, I see people going too far in that direction.

[33:55](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2035s) So there'll be some very arbitrary scale between zero and 10 with unclear grading and rules

[33:59](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2039s) that even a very small model can't resolve.

[34:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2041s) So you obviously, if you have a well thought through scale, you obviously can do that as

[34:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2046s) long as it satisfies what we talked about.

[34:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2048s) It has like low variance.

[34:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2049s) It's reproduced across models.

[34:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2051s) A human grader can kind of distinguish between these two grades.

[34:14](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2054s) That's totally fine.

[34:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2055s) I'm just saying binary is like a shortcut of like if to simplify the problem usually.

[34:20](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2060s) And also for grading, you often want to use smaller, cheaper models.

[34:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2062s) So you really don't want Fable doing your grading and depending on your cost sensitivity.

[34:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2067s) So those are just the recommendations.

[34:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2069s) But obviously, if it's well thought out, that's totally fine.

[34:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2071s) You can think about using, yeah, like a multi-category classification.

[34:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2077s) Yeah, that's a good point.

[34:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2078s) Like when to build evals for what types of problems?

[34:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2082s) Like is it worth building it for my like personal like use cases?

[34:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2086s) Are we only doing it for things that are kind of production grade?

[34:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2089s) I think it depends on, let's see.

[34:56](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2096s) It probably depends a bit on the importance of the task.

[34:59](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2099s) If it's even a personal task, you feel that that is quite important, then it would be perfectly

[35:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2102s) reasonable to build an eval for it.

[35:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2103s) I think that's totally fine.

[35:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2104s) I think people do that.

[35:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2106s) It kind of varies by person.

[35:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2107s) I personally haven't necessarily built many personal evals for like my personal automations.

[35:12](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2112s) But I think if it's a task that's highly important, that's in particular, okay, I'll give a good example.

[35:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2121s) Like if say if you work in finance and like you've automated parts of your personal workflow, but quality is extremely important.

[35:28](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2128s) Like this is a work output that's going to be shared externally or something that would absolutely build evals, even though it's something you've built personally.

[35:35](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2135s) If it's my personal assistant, that's like, you know, it's like a meeting.

[35:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2139s) It's like an app that I built to help me manage my calendar.

[35:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2142s) I may or may not build evals.

[35:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2144s) It depends upon the context.

[35:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2145s) But I do think obviously if it's something that's important for your work, it's like, you know, producing deliverables that are, you know, externally viewed or doing something very sensitive to ask.

[35:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2153s) You obviously want evals, even if it's a personal agent.

[35:56](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2156s) And I actually worked at Langchain before Anthropic, but I can't advocate for any one or the other.

[36:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2164s) Yeah, I plead the fifth on that.

[36:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2167s) I mean, look, I've used many of them.

[36:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2169s) I think actually if you're working at relatively small scale, you obviously could roll your own.

[36:14](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2174s) Like you don't necessarily need a fancy observability system.

[36:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2176s) In fact, we're going to be adding to the skill the ability to just like a simple data viewer where we're actually added to the skill.

[36:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2185s) So Cloud can kind of, Cloud's very good at kind of building your UIs and visualization surfaces.

[36:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2190s) So it can kind of roll.

[36:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2191s) If you have like a very bespoke problem you want to look at the data for, it can kind of roll you whatever app you want very easily.

[36:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2197s) And not very expensively either.

[36:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2199s) No, this is a key point.

[36:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2201s) It's not guaranteed to converge at all.

[36:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2202s) So I've seen many cases in which the Hill Climber gets stuck.

[36:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2205s) And actually we built, you can read the blog, but we built a fallback in the Hill Climber where if it gets stuck for multiple rounds, it'll actually go and basically try to cluster the remaining failure cases.

[36:55](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2215s) And it'll try to look for, so for example, here's the problem.

[36:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2218s) Oftentimes you'll run the Hill Climber without having run like a build eval command or without having built a very like carefully constructed eval set.

[37:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2227s) So the Hill Climber will go and look at your evals and try to find, ah, are these cases ambiguous?

[37:12](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2232s) Like we talked about here, maybe that last 20% are all faulty greater examples, ambiguous instructions.

[37:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2241s) This happens all the time.

[37:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2242s) This is like very common.

[37:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2244s) So Hill Climber's just stuck, not because Cloud can't do better.

[37:26](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2246s) It's because the eval is poorly structured.

[37:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2247s) So the Hill Climbing skill will try to find that for you as we added that.

[37:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2252s) In fact, when I did this Hill Climbing I talk about here, this second stage actually went, it kind of got stuck and it went and basically clustered the eval cases and looked at, okay, why are the failure cases?

[37:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2264s) Why are they failing?

[37:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2264s) What's going on?

[37:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2265s) It found a bunch of ambiguous cases.

[37:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2267s) It rewrote them.

[37:48](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2268s) And anyway, so it'll actually do that for you.

[37:50](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2270s) But that happens all the time.

[37:52](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2272s) It's absolutely not guaranteed to converge.

[37:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2274s) And usually it's because of failures in your eval or like kind of misconfigurations in the eval.

[37:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2277s) So that's really interesting.

[38:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2280s) You have a lot of respect for the DSPy team and Omar and colleagues.

[38:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2286s) This actually just is a skill built like bundled with Cloud Code.

[38:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2289s) The skill is also open source.

[38:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2291s) So you could consider taking that skill and like vendoring it in any other surface.

[38:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2295s) Even if you want to, it could probably work with DSPy.

[38:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2299s) It's just some very simple general instructions for setting up a hill climbing loop following basically these principles.

[38:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2305s) So that could be compatible with DSPy.

[38:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2312s) I haven't used DSPy.

[38:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2314s) So I don't know like the details and how it's structured.

[38:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2317s) But it's possible the skill guidance here could be compatible with it.

[38:40](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2320s) If you want to like effectively implement this or run it in DSPy.

[38:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2324s) The skill is open source.

[38:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2325s) You said choosing effort level.

[38:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2329s) Yeah, this is a classic one.

[38:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2331s) Effort's confusing, isn't it?

[38:52](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2332s) Yeah.

[38:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2333s) I'm also confused by effort.

[38:55](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2335s) It's, yeah.

[38:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2337s) It's non-obvious.

[38:59](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2339s) So this is, so what's nice is if you have an eval, the hill climber can absolutely try to configure effort for you.

[39:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2353s) Now I get it.

[39:14](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2354s) It's like not that easy to have an eval.

[39:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2356s) So like it's not applicable to every problem.

[39:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2358s) But if you happen to have an eval, then this hill climber can search through your model effort configurations.

[39:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2363s) And it follows a very simple principle.

[39:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2364s) The principle is just simply that typically the stronger model at lower effort is like more effective.

[39:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2371s) Or sorry, is more token efficient and therefore cheaper than like a weaker model at high effort.

[39:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2376s) That's like the general principle.

[39:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2377s) That actually turns out to be true a lot.

[39:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2379s) So it'll kind of search through the different models at low effort first.

[39:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2383s) And basically continue that search until you see degradation performance below the baseline.

[39:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2387s) So for here, I don't show it.

[39:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2389s) But like when I tried Haiku 4, this was 4.5.

[39:52](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2392s) Haiku, we now have 5.5, which is quite a bit better.

[39:55](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2395s) 4.5 at low effort was a significant regression.

[39:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2397s) So we admitted that data point.

[39:59](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2399s) But basically, if you have an eval, hill climbing is a very good way to try to search for a good model effort combination.

[40:05](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2405s) More general effort guidance, if you don't have an eval, is obviously tricky and subtle.

[40:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2409s) And like I think people typically, I will say I think the guidance I recommend generally in effort is try stronger model low effort in general.

[40:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2419s) Opus 5.5, low effort.

[40:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2422s) Try that, basically.

[40:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2423s) Better models, low effort are often more token efficient, therefore cheaper than weaker models at high effort.

[40:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2429s) That's like the key point I'll leave you with.

[40:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2432s) Low, not medium?

[40:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2434s) Try low to start.

[40:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2436s) You can always dial back up.

[40:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2438s) But basically, I like very, very smart model, not trying too hard.

[40:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2443s) That's often a sweet spot for kind of cost performance.

[40:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2449s) Obviously, you can dial up effort.

[40:52](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2452s) But I think the counter is people often start with something like max effort.

[40:56](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2456s) It's extremely token hungry.

[40:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2458s) So it is actually wise to often start like smarter model, low effort, and kind of go from there if you need it.

[41:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2466s) Yeah.

[41:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2467s) Yeah.

[41:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2468s) Actually, we talked about this in the blog here.

[41:12](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2472s) I'll open that up.

[41:14](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2474s) I don't have internet.

[41:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2475s) That's fine.

[41:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2476s) I'll just tell you then.

[41:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2478s) Yeah.

[41:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2478s) So it's basically telling Claude how hard to think.

[41:20](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2480s) So low effort is saying like don't think as hard.

[41:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2484s) As you scale it up, it's saying think harder.

[41:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2487s) And that's kind of why a more fundamentally intelligent model at low effort can actually be more token efficient and therefore cheaper than a cheaper model in terms of base tokens at high effort.

[41:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2499s) Because that, for example, Sonic 5 at high effort is spending lots and lots of tokens thinking where smarter model at low effort will spend fewer tokens thinking at a higher baseline of intelligence.

[41:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2511s) That's kind of the intuition.

[41:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2513s) Yeah.

[41:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2513s) So the question is about setting budgets in hill climbing.

[41:55](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2515s) So basically, when you run this skill and set this up, it'll ask you for a budget.

[42:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2520s) So it will manage that for it.

[42:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2523s) It'll track the budget you allocate for the hill climbing round.

[42:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2526s) That can definitely happen, though.

[42:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2527s) And that's actually why this is a classic example.

[42:10](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2530s) That's why designing good evaluation is really important.

[42:12](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2532s) If you have a poorly specified evaluation, imagine, for example, you have an eval where that final 20% is impossible.

[42:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2539s) You burn a huge number of tokens trying to solve those final 20% of problems that are effectively not solvable.

[42:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2545s) Kind of an eval building.

[42:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2547s) The question is about kind of human loop, kind of human cloud collaboration.

[42:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2551s) So I think that humans still have the role to kind of steer the goal.

[42:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2562s) Like, what are we actually trying to evaluate?

[42:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2563s) And why is it important?

[42:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2564s) So it's kind of taste.

[42:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2565s) It's important.

[42:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2566s) So what are you actually trying to answer?

[42:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2567s) For example, I'll take an example from, like, Hamill's public dogfooding of our build eval skill.

[42:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2577s) So it's like, okay, it's a customer support app.

[43:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2580s) So say that's your application.

[43:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2581s) What matters?

[43:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2582s) What's important?

[43:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2582s) What do you care about?

[43:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2583s) Those are things that a human can guide cloud.

[43:05](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2585s) Now, once those things are clearly specified, cloud can look at, like, raw traces and determine effectively, like, okay, where is the app likely falling short of my goals?

[43:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2598s) So that's, I think, kind of the nice collaboration you can have in place.

[43:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2602s) And that's actually when, like, kind of looking at the data is very helpful.

[43:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2605s) So cloud can kind of help to steer you.

[43:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2607s) Okay, I've looked at the data.

[43:28](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2608s) Here's a bunch of cases that look problematic.

[43:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2610s) And that's just like having an online evaluator.

[43:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2612s) So you, like, imagine you have a tracing system.

[43:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2614s) You have an online evaluator.

[43:35](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2615s) It has some, like, grading for, like, customer satisfaction.

[43:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2619s) And it's flagging, like, here's problematic traces for you.

[43:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2622s) It's the same kind of thing.

[43:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2623s) Like, you're telling cloud.

[43:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2624s) You're telling the online evaluator.

[43:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2626s) Here's what I care about.

[43:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2626s) Here's what I want you to check.

[43:48](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2628s) It can look at the data.

[43:48](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2628s) It can elevate a bunch of cases.

[43:50](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2630s) Like, oh, these look problematic.

[43:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2631s) Then given those cases, you can, like, review them, understand them, and then say, okay, yes, build me an eval based upon these.

[43:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2637s) That's typically a very nice marriage between, like, cloud and human when it comes to building evals.

[44:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2643s) Yeah.

[44:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2643s) The question is, like, who's responsible for building evals?

[44:05](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2645s) I mean, it depends on the problem.

[44:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2646s) It depends upon, I mean, like, AnthropBank, everyone is empowered to build evals.

[44:10](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2650s) So it's not really delineated per team.

[44:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2653s) It's typically based on ownership, like, of the product.

[44:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2655s) And I think in particular when you have skills like this and make it easier to build evals to hill climb, it really opens up the number of people that can feasibly kind of build and design evals, which is actually quite nice.

[44:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2667s) So we've seen, like, AnthropBank, many, many different types of roles build evaluations because cloud's so involved and can help so much.

[44:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2676s) Much of the tedium of, like, you know, building an eval runner and stuff, that's, like, cloud can handle all that.

[44:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2683s) So really it's about what we were talking about before, the human taste, guiding the process, what do I care about?

[44:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2687s) And that's very, many different types of roles can kind of serve that guidance or provide that steering.

[44:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2694s) Let's see if I have a good one.

[44:56](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2696s) Right.

[45:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2703s) Off the top of my head.

[45:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2706s) I've seen...

[45:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2708s) Okay, I have a good one.

[45:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2709s) I have seen evals for generative UIs.

[45:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2716s) So that's kind of a good example.

[45:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2718s) Actually, I think in that case, it was a pairwise judge back to the point that you were making.

[45:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2723s) Like, so it was basically comparing, like, configuration A, B, what is better between, like, two different generative UIs, and, like, the greater would do kind of a pairwise comparison.

[45:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2734s) I think then those results were rolled across many trials and scored with something like an ELO score.

[45:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2739s) So that's an example of, like, generative UI with a pairwise evaluator I've seen before.

[45:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2745s) There's many other examples I can't think of at the top of my head.

[45:48](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2748s) But people use LMS judge all the time for, like, retrieval tasks or, like, writing tasks, categorizing traces, looking at traces and saying, oh, this is bad or good.

[46:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2760s) So, like, it's extremely common.

[46:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2763s) Yeah.

[46:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2763s) So, okay, a lot of the motivation for the hill climbing work is kind of flowing from auto research.

[46:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2771s) Auto research is motivated heavily by the fact that models are getting very, very good.

[46:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2776s) They're very good at self-correction.

[46:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2777s) If you give them a well-structured problem, they can hill climb on.

[46:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2782s) So I think Karpathy's case is a good example of, I think, I can't remember the precise problem.

[46:26](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2786s) I think that general set of work with many different formulations.

[46:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2789s) Like, it could be, you know, like, drive down loss or something.

[46:33](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2793s) So, again, there's, like, a very clear verifiable objective.

[46:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2796s) And Claude can look at that objective and use it as a guide to hill climb.

[46:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2798s) I have, yeah, I didn't show it here, but I have some other examples doing auto research in this kind of hill climbing process.

[46:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2806s) And it would, this kind of, this command in particular is actually designed more for eval-based hill climbing where you have, like, an eval set with a split.

[46:56](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2816s) Auto research was looking more like you build an artifact and, like, grade it, like, look at the loss or something.

[47:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2821s) But the setup could probably be very easily kind of modified to work with auto research with the very same intuition.

[47:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2828s) The point is that models are good at autonomous work over long horizons.

[47:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2831s) When given a clear objective or verifiable, effectively, a reward that they can kind of measure and use to inform what their next move is,

[47:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2842s) they're very, very good at autonomously solving problems.

[47:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2844s) So it's driven by the same intuition as auto research.

[47:26](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2846s) So you start with hill climb and then extend it to auto research?

[47:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2851s) The methodology for hill climb would, so it's just a question of problem formulation, just to be clear.

[47:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2858s) So, like, the auto research problem formulation was initially focused more on, like, designing, for example, like a network with, for example, solving some problem where you have, like, a verifiable objective, like, loss.

[47:52](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2872s) That's really it.

[47:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2873s) The hill climbing process, though, was, like, very similar where, like, Claude runs some experiments.

[47:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2877s) It measures loss.

[47:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2878s) It looks at the results.

[48:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2880s) It then adapts.

[48:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2881s) It does something else.

[48:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2881s) So it's the same kind of hill climbing loop.

[48:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2883s) But, like, in that particular case, it's just applied to, like, a slightly different domain.

[48:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2887s) So it's, like, you could probably take this skill and basically say, okay, set this up for if you had, like, the NanoGDPT repo, you could use this skill with it, I'm sure.

[48:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2896s) It would cloud it to figure out how to adapt things.

[48:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2898s) If you're interested in that, just, like, try it.

[48:20](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2900s) But the core process is the same.

[48:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2902s) The core intuition is also the same, that, like, models are very, very effective at using, at self-correction and hill climbing.

[48:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2910s) That's the key intuition.

[48:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2912s) Yep.

[48:33](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2913s) Yeah.

[48:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2914s) I kind of try to do that in, like, this example where I'm looking at cost and performance.

[48:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2919s) So, like, kind of jointly optimizing across those two.

[48:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2922s) And, yeah, you can just tell Claude the multi-objective.

[48:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2926s) And usually it'll just kind of measure multiple objectives and take that into account.

[48:52](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2932s) That's certainly feasible.

[48:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2933s) And this is a good example of that.

[48:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2938s) I mean, yeah, I haven't pushed that too far.

[49:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2941s) I think what I've typically looked at is cost and performance.

[49:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2944s) And, like, speed's another dimension.

[49:05](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2945s) So you can let cost, performance, speed.

[49:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2947s) That feels like a pretty reasonable, like, trifecta of things that you would, like, kind of jointly measure.

[49:10](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2950s) Yeah.

[49:12](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2952s) Yeah.

[49:12](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2952s) I mean, I think that as you kind of scale up, it just hobbles the process of hill climbing a lot because there's lots of different objectives that Claude's trying to balance when making these changes.

[49:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2961s) So I think it'll just, it'll make the problem harder.

[49:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2964s) But, like, it is doable.

[49:26](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2966s) Maybe you could think about kind of changing one thing at once, doing them serially.

[49:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2971s) Yeah.

[49:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2972s) So that's a very good question.

[49:33](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2973s) So the prompt artist stuff, which actually, of all the things I talked about, is the simplest thing to try and often is, like, extremely, it's, like, do the simple thing first.

[49:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2981s) It's very simple and often very effective.

[49:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2983s) This general, the general guidance in the skill applies to the model delineations a little bit on, like, it's not precise.

[49:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=2994s) These are well-known anti-patterns that definitively frontier models like the 5.5 series don't need anymore.

[50:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3000s) How far back do you need to go until these patterns are still, like, appropriate?

[50:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3004s) It's, like, not quite clear.

[50:05](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3005s) I've tried to do some testing.

[50:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3006s) It's maybe, like, Opus, like, 4.5 is the point at which these things start to, like, become less relevant.

[50:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3013s) So it's a little bit squishy.

[50:14](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3014s) I don't know, like, precisely the model at which, like, you need to remove these.

[50:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3017s) But my view is basically when you do a migration to the latest, to, like, to, like, Opus 5.5, just do this.

[50:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3024s) Like, definitively, like, the latest frontier models don't need these patterns.

[50:28](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3028s) Yeah, yeah.

[50:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3029s) Okay, good point.

[50:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3030s) So the skill does have some model-specific caveats.

[50:33](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3033s) So the skill takes that into account a little bit.

[50:35](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3035s) If you're, for example, going to, like, Haiku, I get it.

[50:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3037s) Like, maybe Haiku, like, isn't quite as autonomous.

[50:40](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3040s) Maybe it does need slightly more boosters.

[50:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3042s) I don't know if that's true.

[50:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3043s) I'm just kind of suggesting something.

[50:48](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3048s) It'll take that into account.

[50:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3049s) So it does have some model-specific guidance built in.

[50:52](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3052s) It's, like, smart to figure out, like, okay, here's the model you're working with,

[50:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3054s) and here's the anti-patterns that we know are not needed anymore.

[50:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3058s) But it's a good call-out.

[51:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3060s) Yeah.

[51:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3061s) Yeah.

[51:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3061s) Yeah.

[51:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3064s) Yeah.

[51:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3066s) It is not as...

[51:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3067s) Yeah.

[51:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3068s) I should get back to you to, like, to be really clear about this.

[51:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3073s) It is not a hard cap.

[51:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3076s) It is basically telling Claude, emphasizing how much thinking to do to solve the problem.

[51:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3081s) So, like, for example, even if you're on very high effort, you give it a simple problem that won't just arbitrarily spend huge amounts of tokens verifying it.

[51:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3089s) There's some...

[51:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3091s) Claude has some thoughtfulness about, like, what problems require, you know, all the extra thinking.

[51:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3097s) So, like...

[51:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3098s) And I don't know if I have any evals that show that.

[51:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3101s) Yeah, maybe not.

[51:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3102s) But it is suggested thinking.

[51:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3107s) So, that's kind of the way I think.

[51:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3107s) It's basically telling Claude how hard to think about a problem.

[51:50](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3110s) The problem comes when you have, like, a harder problem, like a frontier coding problem.

[51:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3114s) That's where, at, for example, extra high effort or max effort, you can see huge differences in token usage from, like, medium or low without much difference in actual outcome.

[52:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3123s) Because Claude will do more work to verify the result, for example.

[52:05](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3125s) So, I think out in the frontier regime of problems, that's where these effort differences can really result in, like, big token spend differences.

[52:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3133s) And that's where you need to be more careful.

[52:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3135s) Yeah.

[52:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3136s) I mean, this is...

[52:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3139s) So, if you kind of think about what's happening, it's not dissimilar to training.

[52:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3145s) And basically, you're giving a model some reward or objective.

[52:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3149s) And it is, indeed, trying to make modifications to the system to improve the objective.

[52:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3154s) So, yeah.

[52:35](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3155s) Philosophically, that is similar.

[52:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3157s) And, in fact, even we're used...

[52:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3159s) You know, we employ some simple principles, like test, train, splits, that are often employed, like, at training time.

[52:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3164s) But the nice thing is these are kind of runtime modifications you can make.

[52:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3167s) So, this is basically a way to employ some of those principles.

[52:50](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3170s) But, basically, like, once a model has been deployed and, like, you're modifying services like prompts or skills,

[52:55](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3175s) you can employ some of those same principles that we use in training, but, like, in your particular domain.

[53:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3182s) That's kind of the big idea.

[53:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3184s) Yeah.

[53:05](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3185s) So, like, is Claude aware of this being evaled?

[53:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3187s) Right.

[53:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3188s) Exactly.

[53:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3189s) That...

[53:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3189s) I think that's something we've published on a fair amount that is a concern in the...

[53:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3196s) That is certainly a concern kind of in training, in different stages of training.

[53:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3201s) Absolutely.

[53:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3202s) For what we're talking about here, I do think it could be somewhat of a concern.

[53:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3212s) I think the bigger concern than what we're talking about here is typically more overfitting.

[53:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3216s) So, Claude may know it's kind of being evaluated.

[53:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3219s) But it will find ways to...

[53:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3224s) He'll climb in the objective based upon what's been provided in kind of this eval distribution that it has.

[53:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3229s) The classic example being it'll find kind of prompt tricks and tuning that aren't applicable to production that, indeed,

[53:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3238s) improve performance significantly on your eval.

[54:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3240s) I've seen that happen.

[54:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3241s) That happens all the time.

[54:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3242s) And it's not necessarily that Claude's, like, aware it's being evaled and saying, like, it's kind of some kind of unexpected behavior.

[54:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3251s) It's more that, like, oh, okay, you've given it a prompt and Claude can find ways to shape this prompt to, like, make number go up and it'll just do that.

[54:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3258s) That's why we use things like test training splits to try to regularize.

[54:21](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3261s) So, I think overfitting is more the practical concern that we're going to think about here.

[54:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3265s) But it is true that eval awareness is, like, a broader phenomenon that we have discussed in some of research blogs.

[54:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3272s) Yeah, that's a good point.

[54:33](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3273s) Kind of what's, like, the minimum kind of data set that's useful?

[54:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3278s) What is, like, the split between test and train?

[54:40](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3280s) I haven't looked at that in depth.

[54:43](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3283s) Frankly, just ask Claude.

[54:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3284s) Like, when you set this up and you run this command, Claude has some heuristics to reason about the size of the eval set that's actually helpful.

[54:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3291s) Given the signal or, like, what you're trying to measure, Claude can kind of reason about, like, how many examples you should have.

[54:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3297s) And there's some guidance in the skill for this.

[54:59](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3299s) So, it's something that you can kind of work with Claude to kind of tune.

[55:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3303s) But I haven't looked at, like, super specifically, like, oh, different eval set sizes.

[55:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3308s) And, like, I think the central concern I would have is more, is probably overfitting and, like, variance.

[55:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3317s) So, if you have, like, a very, very small number of samples, like, okay, is that really representative of what you care about?

[55:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3324s) Is it easier to overfit?

[55:25](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3325s) So, like, they may be out of distribution for your production, like, what you actually care about.

[55:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3330s) They may be easier to overfit.

[55:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3332s) They may be noisier.

[55:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3334s) So, anyway, like, I think those are the problems that arise when you're in, like, the very, very small sample regime.

[55:40](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3340s) Yeah, okay.

[55:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3341s) So, the question is about hill climbing on tasks that are, like, very, very long duration.

[55:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3344s) And so, that's funny because that's actually why I mentioned I typically do, like, simple surfaces like prompts because they're, like, very, very quick to change.

[55:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3353s) You are right, though.

[55:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3354s) There are some cases you're in a regime where, like, your changes could be very, very long duration.

[55:59](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3359s) That effectively makes hill climbing much harder because, like, it's a much longer duration task then.

[56:03](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3363s) So, it's a lot longer time.

[56:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3364s) That's actually where that gets into our final point about kind of harness design.

[56:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3367s) If you're going to do that, if you're doing, like, very, very long duration hill climbing, you actually need harnesses that can, like, remain reliable for, like, many, many hours to days.

[56:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3376s) And so, we have that, obviously, internally.

[56:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3378s) We use things like managed agents.

[56:20](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3380s) I think it just becomes a bigger infrastructure lift.

[56:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3382s) When you're doing that, it can be done.

[56:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3384s) It obviously is harder because of what I just mentioned, infrastructure issues, failures, and just a lot longer time to see your signal.

[56:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3392s) Single turn versus multi-turn evals.

[56:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3394s) I mean, yeah, when you're building agents, you do typically need multi-turn evals.

[56:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3401s) Claude can help you do that, particularly, like, the build eval command.

[56:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3405s) It can look at traces.

[56:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3406s) It can, if you give it a bunch of traces, it can help you promote particular traces to your eval set.

[56:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3414s) In terms of grading, I mean, yeah, there's a lot of different philosophies on this.

[56:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3418s) You can have evaluators looking at the entire trace trajectory.

[57:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3421s) You can have evaluators looking at, like, the final agent outcome.

[57:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3424s) There's a lot of different philosophies.

[57:05](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3425s) The build eval command has a lot of guidance.

[57:07](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3427s) So, like, if you have a particular, like, agent you're interested in, if you basically just give this command access to the traces,

[57:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3433s) it should be pretty effective at kind of shaping and designing the eval for you.

[57:18](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3438s) And you can tell it, I want multi-turn, and here's what I'm considering.

[57:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3442s) Cool.

[57:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3443s) Interesting.

[57:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3443s) So, like, for context engineering, what promotes reliability a lot versus what's, like, overhyped as a technique?

[57:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3451s) Let's see.

[57:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3454s) So, okay.

[57:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3456s) The key thing, I think, and I've actually mentioned this in the past.

[57:40](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3460s) We mentioned in the paper, too.

[57:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3461s) I think recursive language model work and RLM idea is quite good.

[57:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3465s) And we actually employ that idea here.

[57:47](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3467s) I think a very important thing in terms of context engineering reliability is decoupling brain in hands.

[57:52](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3472s) So, basically, designing your system such that it, the key point is this, the context object is independent from the harness.

[58:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3482s) So, the harness is basically, or Claude, can effectively query this context object that lives independently.

[58:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3488s) That's beneficial for all these different reasons.

[58:10](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3490s) One, the context is always recoverable.

[58:13](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3493s) So, typically, imagine, alternatively, you just have, like, you know, a message history, you do a compaction event, and everything you compacted is gone.

[58:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3499s) You can never recover it if you haven't, like, backed it up in a way like this.

[58:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3503s) That's why I actually like this architecture a lot for reliability in terms of context engineering.

[58:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3507s) And that's exactly what the RLM work advocated.

[58:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3509s) Like, it's basically splitting the context object from the model, and the context object becomes something that the model can interrogate through different mechanisms.

[58:36](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3516s) And that's exactly what we do here.

[58:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3518s) So, interrogating that session log is basically done by the harness through different tools.

[58:44](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3524s) And that's a very nice architecture.

[58:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3525s) So, I think that's, like, one of the tricks that I found to be very nice for reliability, recoverability.

[58:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3529s) And, in particular, building, like, long-duration agents, it's hard to know what will matter in the future.

[58:56](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3536s) So, when you do a compaction, you don't necessarily know if you need to, like, go back and interrogate that context that you're summarizing.

[59:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3544s) And when you have it backed up in an object like this, you can always do that.

[59:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3548s) So, I think that's a trick that I like a lot.

[59:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3551s) And the RLM work was very nice in that direction.

[59:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3555s) Yep.

[59:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3556s) Yeah.

[59:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3557s) Well, I think that's why, you know, we spend a lot of time on good eval design.

[59:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3567s) Yeah.

[59:28](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3568s) These models are non-deterministic.

[59:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3571s) In many cases, they operate in regimes where outcomes are not easily verifiable.

[59:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3577s) Like, not everything is a coding problem.

[59:39](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3579s) In many cases, you want agents to do things that are more judgment-based, more free-from-open-end outputs.

[59:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3585s) In those regimes, you have to be very smart about your eval design so that you're giving Claude an objective that it can climb.

[59:50](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3590s) And I think all the things we talked about in terms of, like, kind of verifier design, like good objectives, clear grading scales, multiple models can validate the result, low variance, all are, like, super important when designing, like, the problem that you want Claude to go and solve.

[1:00:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3606s) So, I think that's why I mentioned it in this talk.

[1:00:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3609s) When it comes to on hobbling frontier models, I think spending a lot of time up front in a very, very good eval design is a way to make sure that you're getting the most out of the model because if you say, tell the model, okay, optimize performance on this, like, very poorly structured evaluation, it won't go anywhere.

[1:00:26](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3626s) And it's not the model's fault because you haven't thought through the eval.

[1:00:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3629s) It's because cases are impossible or ambiguous.

[1:00:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3631s) So, I think part of the message here is to be thoughtful and spend a lot of time up front in the eval design such that you kind of set up frontier models for success and, in fact, unhobble them.

[1:00:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3642s) That was kind of the namesake of the talk.

[1:00:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3645s) Maybe we're probably at time and everyone's probably tired.

[1:00:48](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3648s) I was at a wedding last night, so I'm very tired.

[1:00:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3651s) It was a funny timing, but it's very nice to be here, of course.

[1:00:54](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3654s) And, actually, it's been a lot of fun.

[1:00:56](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3656s) Very good questions.

[1:00:57](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3657s) Maybe one more question over here.

[1:01:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3660s) Hmm.

[1:01:00](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3660s) Hmm.

[1:01:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3661s) Yeah.

[1:01:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3661s) So, I think that's a good question.

[1:01:02](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3662s) It's about, like, yeah, models are getting better all the time.

[1:01:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3664s) So, like, how do I modify my evals to keep up?

[1:01:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3668s) And I think, simply, it should be the case that as models get better, you should see performance on your eval going up like we see in this diagram.

[1:01:15](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3675s) If you don't see that, then I would go back and question, is the eval well structured?

[1:01:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3679s) It is true.

[1:01:20](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3680s) Like, yeah, we see this all the time.

[1:01:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3682s) Models are structuring evals very, very quickly.

[1:01:24](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3684s) So, we do need the development of new and harder evals that, like, keep up with the frontier.

[1:01:29](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3689s) And, actually, that's a good point.

[1:01:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3691s) It's actually pretty hard.

[1:01:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3692s) It's hard to come up with evals that really challenge, like, the best models today, like the Fables, Opus 5.5 even.

[1:01:38](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3698s) So, I do think it's a recurring challenge to design good evals that test the capabilities of the best models.

[1:01:50](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3710s) It's absolutely a challenge.

[1:01:52](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3712s) But I do think, so, if you have evals that you built some time ago, you should be seeing this trend on them.

[1:01:58](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3718s) So, as models get better, you should be seeing performance going up and up and up.

[1:02:01](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3721s) If you don't, I would question things about the eval itself.

[1:02:04](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3724s) That's kind of the key point I would make.

[1:02:06](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3726s) I mean, I've actually seen a lot of interesting work on this from the various tracing companies.

[1:02:11](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3731s) So, like, the workflow I've seen quite a bit of is, like, you have agents that are deployed.

[1:02:17](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3737s) They're, like, producing traces.

[1:02:19](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3739s) You have an online evaluator looking at those traces and scoring them.

[1:02:23](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3743s) Traces that score poorly are, like, then pulled into some offline eval set.

[1:02:27](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3747s) You kind of then hill climb on that.

[1:02:30](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3750s) And then that loop continues.

[1:02:32](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3752s) That's a good, that's, like, a very good pattern, I think.

[1:02:34](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3754s) It's very reasonable.

[1:02:35](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3755s) And so, what's happening there is you're typically, like, hill climbing on these cases that you're failing on in production.

[1:02:41](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3761s) And then you're, like, you know, putting those in regression tests once they all pass.

[1:02:45](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3765s) And that, like, continues until in production you're seeing very few failures.

[1:02:48](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3768s) So, that actually is a good general way to structure your kind of eval loop.

[1:02:55](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3775s) And many of the, you know, the Lang Chains Arises, Brain Trusts, all these companies kind of have product offerings that offer this kind of, this, like, outer loop, which does seem quite effective.

[1:03:08](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3788s) You do.

[1:03:09](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3789s) So, the challenge there becomes, okay, well, what are you on on evaluators?

[1:03:12](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3792s) So, like, okay, how do you know what good is in production?

[1:03:14](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3794s) And what are you promoting to your offline eval sets?

[1:03:16](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3796s) And, yeah, it's not easy at all.

[1:03:22](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3802s) I think that is, yeah, that's, like, there is, like, a lot of product work in that particular domain now.

[1:03:28](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3808s) As far as, I haven't followed that area too closely.

[1:03:31](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3811s) Like, with all the latest kind of updates that the various, like, tracing observability companies are working on.

[1:03:37](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3817s) But my understanding is that is, like, a very, very active area of, like, product development among that class of companies.

[1:03:42](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3822s) So, I think it's pretty interesting.

[1:03:46](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3826s) Okay, with that, Mabel, let everyone go.

[1:03:49](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3829s) And very nice to see you all.

[1:03:51](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3831s) So, feel free to reach out to me anywhere.

[1:03:53](https://www.youtube.com/watch?v=ys6YQ2yfBpM&t=3833s) And thanks for the time.
