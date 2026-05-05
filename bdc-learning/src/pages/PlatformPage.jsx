import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
function useMobile(){const[m,setM]=useState(()=>typeof window!=='undefined'&&window.innerWidth<700);useEffect(()=>{const h=()=>setM(window.innerWidth<700);window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);},[]);return m;}

const CATALOG = [
  {
    id: "world-model-builder", name: "World Model Builder", tag: "Built", tagColor: "#0F6E56", icon: "🗺️", aiRole: "Guide",
    connectivity: "live", positionPrimary: "opener", positionSecondary: "transfer",
    mode: "exploration", structure: "open", outputFormat: "Written response",
    goal: ["Reveal the learner's current mental model of a complex system before instruction begins", "Identify specific gaps and misconceptions through what they draw, label, and deliberately leave out"],
    description: "Learner is given a set of real-world actors in a complex system and asked to place them on a canvas, draw directional connections, and label what flows between them with no guidance on correct relationships. The AI evaluates the map for the quality of relational logic: what was connected, what direction authority flows, and critically, what was omitted entirely.",
    bestFor: "Any domain where learners arrive with a pre-existing mental model borrowed from a different context — defense contracting, regulatory ecosystems, clinical systems, complex supply chains, organizational structures.",
    antiPattern: "Simple domains where the relationships are obvious. Avoid when the actor set is too large (beyond 15) or the relationships have no causal logic that distinguishes good from poor models.",
    timeNeeded: "medium", outputType: "Interactive map", personalisation: "Entirely learner-generated — no two maps are identical",
    designTip: "Do not give learners the relationship types. If you pre-define categories like authority or funding you have turned a diagnostic into a matching exercise.",
    commonPitfalls: ["Telling learners the right number of actors or connections — this anchors their map to an expectation.", "Evaluating only what is present rather than what is absent."],
    refFile: "world_model_builder.jsx",
    category: "adaptive",
    pairings: [{ id: "misconception-detector", reason: "WMB maps the shape of the mental model — Misconception Detector then probes why specific assumptions are wrong." }, { id: "co-viewer", reason: "The map of what the learner thinks can prime the Co-Viewer AI to address their specific gaps when questions arise during video." }],
  },
  {
    id: "conversation-sim", name: "Conversation Simulator", tag: "Built", tagColor: "#0F6E56", icon: "💬", aiRole: "Character",
    connectivity: "live", positionPrimary: "practice", positionSecondary: "transfer",
    mode: "simulation", structure: "adaptive", outputFormat: "Written response",
    goal: ["Apply a communication framework in a realistic, pressure-tested conversation", "Receive targeted coaching on specific technique gaps after each exchange"],
    description: "Learner enters their own real situation and practices the actual conversation. The AI plays the other party with calibrated emotional weight and delivers a coaching nudge after each turn. A personalised debrief scores performance against learning objectives.",
    bestFor: "Giving and receiving feedback, managing up, negotiating scope, handling conflict, coaching a direct report — any situation where the gap between knowing and doing is the core problem",
    antiPattern: "Factual or procedural content with no interpersonal dimension. Audiences who have not yet been exposed to the target model.",
    timeNeeded: "long", outputType: "Open response", personalisation: "Built entirely from the learner's own situation",
    designTip: "Build the scenario from the learner's real situation, not a constructed one. The more specific the context, the higher the transfer.",
    commonPitfalls: ["Assigning this before learners understand the target framework.", "Setting emotional weight to receptive for every learner — produces false readiness."],
    refFile: "adaptive_learning_v3.jsx",
    category: "adaptive",
    pairings: [{ id: "perspective-flip", reason: "After practicing their own side, the learner replays the exchange from the other person's perspective — the transcript makes the flip specific and confronting." }, { id: "pressure-test", reason: "Pressure Test stress-tests the reasoning behind a position before the learner has to hold it in conversation." }],
  },
  {
    id: "decision-sim", name: "Decision Simulator", tag: "Built", tagColor: "#0F6E56", icon: "⚡", aiRole: "World",
    connectivity: "offline", positionPrimary: "practice", positionSecondary: null,
    mode: "simulation", structure: "adaptive", outputFormat: "Selection",
    goal: ["Make and defend sequential decisions with visible downstream consequences", "Understand how early choices constrain later options"],
    description: "Learner makes sequential decisions inside a live, evolving situation. The AI plays the world generating consequences that ripple through a set of visible state variables. Each choice shifts the world visibly before the next decision point arrives.",
    bestFor: "Leadership judgment under pressure, crisis triage, project recovery, compliance decisions under constraint, ethical tradeoffs with competing stakeholders",
    antiPattern: "Topics where the right answer is known and procedural. Avoid when learners lack enough domain knowledge to evaluate their own choices.",
    timeNeeded: "medium", outputType: "Structured input", personalisation: "Scenario is pre-set; consequences are dynamically generated",
    designTip: "Define 2 or 3 visible world-state variables before building the scenario. Tradeoffs between these variables are what make decisions feel genuinely hard.",
    commonPitfalls: ["All decision paths leading to the same debrief.", "Overloading the world state with too many variables."],
    refFile: "decision_sim.jsx",
    category: "adaptive",
    pairings: [{ id: "scenario-brancher", reason: "Decision Simulator uses visible world-state variables; Adaptive Scenario extends the same logic into a narrative format for richer context." }, { id: "pressure-test", reason: "After making decisions, the Pressure Test forces the learner to defend their choices as if presenting them to stakeholders." }],
  },
  {
    id: "myth-lab", name: "Myth Lab", tag: "Built", tagColor: "#0F6E56", icon: "🔬", aiRole: "Revealer",
    connectivity: "offline", positionPrimary: "opener", positionSecondary: "reflection",
    mode: "assessment", structure: "fixed", outputFormat: "Selection",
    goal: ["Surface confidently-held misconceptions before they influence performance", "Calibrate self-assessed knowledge against actual knowledge"],
    description: "Learner receives a curated set of statements — facts, myths, and it-depends cases — and classifies each one before staking a confidence level. The reveal exposes the gap between certainty and accuracy, making misconceptions visceral.",
    bestFor: "Any domain where confident misconceptions are a performance risk — compliance, safety, clinical practice, financial literacy, management",
    antiPattern: "Topics where all statements have obvious right answers — the confidence mechanic only works when learners are genuinely uncertain.",
    timeNeeded: "short", outputType: "Confidence-rated classification", personalisation: "Same set for all learners",
    designTip: "The most effective statements are true-but-counterintuitive or myths that feel credible. Write toward the misconception, not toward the correct answer.",
    commonPitfalls: ["Statements that are too obviously true or false.", "Skipping the explanation after the reveal."],
    refFile: "myth_lab.jsx",
    category: "standard",
    pairings: [{ id: "conversation-sim", reason: "The sting of the reveal creates motivation to practice the right behaviour in a real scenario immediately after." }, { id: "misconception-detector", reason: "Myth Lab surfaces misconceptions at scale; Misconception Detector then probes why specific ones persist for individual learners." }],
  },
  {
    id: "adaptive-question-pack", name: "Adaptive Question Pack", tag: "Built", tagColor: "#0F6E56", icon: "🔀", aiRole: "Guide",
    connectivity: "offline", positionPrimary: "opener", positionSecondary: "practice",
    mode: "assessment", structure: "adaptive", outputFormat: "Selection",
    goal: ["Identify specific knowledge gaps across a topic domain", "Route each learner to remediation content matched to their gap pattern, not their score"],
    description: "Learner completes a short cluster of 2 to 3 traditional items and the AI reads the full answer pattern to infer the specific gap or strength before routing to the next cluster. The path is never pre-authored.",
    bestFor: "Compliance training, onboarding, technical certification, safety protocols — any domain where learner paths are one-size-fits-all but knowledge gaps vary significantly",
    antiPattern: "Topics requiring open-ended reasoning or interpersonal judgment. Avoid when learner variance is low.",
    timeNeeded: "medium", outputType: "Structured input", personalisation: "Path adapts to each learner's specific answer pattern, not their score",
    designTip: "Write items in clusters that target a single sub-concept. The AI can only route meaningfully when it can attribute a wrong answer to a specific gap.",
    commonPitfalls: ["Using score thresholds instead of pattern analysis for routing.", "Designing only two routes (pass/fail)."],
    refFile: "adaptive_question_pack.jsx",
    category: "adaptive",
    pairings: [{ id: "misconception-detector", reason: "Misconception Detector maps which concepts are misunderstood; AQP delivers targeted remediation clusters aimed at exactly those gaps." }, { id: "conversation-sim", reason: "AQP identifies a specific knowledge gap that the Conversation Simulator can then surface in a realistic interpersonal context." }],
  },
  {
    id: "pressure-test", name: "The Pressure Test", tag: "Built", tagColor: "#0F6E56", icon: "🎯", aiRole: "Examiner",
    connectivity: "live", positionPrimary: "practice", positionSecondary: "reflection",
    mode: "practice", structure: "open", outputFormat: "Written response",
    goal: ["Stress-test a plan, proposal, or argument before a high-stakes presentation", "Identify unstated assumptions and undefended claims before stakeholders do"],
    description: "Learner states a position, plan, or argument. The AI immediately interrogates it — probing assumptions, surfacing contradictions, demanding evidence for every claim. Learner must defend, revise, or concede in real time.",
    bestFor: "Strategy validation, research proposals, product decisions, executive preparation, pitches — any high-stakes situation where untested assumptions are a liability",
    antiPattern: "Audiences early in their learning who need more scaffolding before their thinking can be productively challenged.",
    timeNeeded: "medium", outputType: "Open response", personalisation: "Built entirely from the learner's own position",
    designTip: "Brief learners: the AI will ask the questions your stakeholders will ask. That reframe makes pushback feel productive.",
    commonPitfalls: ["AI pressure that reads as hostile rather than rigorous.", "No pathway to winning — learners must be able to produce a response the AI validates."],
    refFile: "pressure_test_v1.jsx",
    category: "adaptive",
    pairings: [{ id: "argument-builder", reason: "Pressure Test stress-tests a position the learner holds; Argument Builder then assigns them an opposing position to defend." }, { id: "conversation-sim", reason: "Strengthening a position under pressure is direct preparation for holding it in a real conversation." }],
  },
  {
    id: "argument-builder", name: "Argument Builder", tag: "Planned", tagColor: "#1A2B4A", icon: "⚖️", aiRole: "Examiner",
    connectivity: "live", positionPrimary: "practice", positionSecondary: "reflection",
    mode: "practice", structure: "open", outputFormat: "Written response",
    goal: ["Construct a defensible argument for an assigned position", "Sustain logical reasoning under sustained examiner pressure across multiple rounds"],
    description: "Learner is assigned a position — possibly one they disagree with — and must construct the strongest possible case for it. The AI plays a rigorous examiner pressing for evidence, identifying logical gaps, demanding precision across multiple rounds.",
    bestFor: "Ethics education, business case writing, policy analysis, legal reasoning, pre-mortem thinking, building tolerance for opposing perspectives",
    antiPattern: "Topics with a clear defensible right answer. Avoid with learners too early in the domain to construct any coherent position.",
    timeNeeded: "medium", outputType: "Open response", personalisation: "Position is assigned; argument is entirely learner-generated",
    designTip: "Assign learners a position they do not already hold. Arguing against your own instinct forces deeper engagement with opposing logic.",
    commonPitfalls: ["Letting learners choose their own position — they rehearse what they already believe.", "An AI examiner that accepts weak arguments too easily."],
    pairings: [{ id: "pressure-test", reason: "Pressure Test stress-tests the learner's own position first — Argument Builder then pushes them to inhabit the opposing logic." }, { id: "socratic-dialogue", reason: "After constructing an argument, Socratic Dialogue probes its foundations without ever confirming or denying." }],
    category: "adaptive",
  },
  {
    id: "the-diagnosis", name: "The Diagnosis", tag: "Planned", tagColor: "#1A2B4A", icon: "🔍", aiRole: "Revealer",
    connectivity: "live", positionPrimary: "practice", positionSecondary: null,
    mode: "exploration", structure: "adaptive", outputFormat: "Written response",
    goal: ["Develop structured inquiry skills by asking targeted diagnostic questions", "Reach a conclusion through deliberate evidence-gathering, not guessing"],
    description: "Learner receives partial signals — symptoms, data fragments, behavioural cues — and must question the AI to uncover a hidden answer. The AI reveals only what is directly asked for, nothing more.",
    bestFor: "Clinical reasoning, technical troubleshooting, root cause analysis, investigative roles, financial auditing — any domain where the skill is knowing what questions to ask",
    antiPattern: "Topics without a solvable hidden answer. Avoid when the learning goal is empathy rather than analytical reasoning.",
    timeNeeded: "medium", outputType: "Guided response", personalisation: "Case is pre-set; the inquiry path is entirely learner-driven",
    designTip: "The power is in what the AI withholds. Design the case so the most important clue is only accessible if learners ask the right category of question.",
    commonPitfalls: ["Making the diagnosis reachable too early — learners guess rather than reason.", "Unlimited questions with no cost."],
    pairings: [{ id: "concept-mapper", reason: "Concept Mapper reveals how the learner understands relationships; The Diagnosis tests whether they can apply that understanding through structured inquiry." }, { id: "misconception-detector", reason: "Misconception Detector identifies wrong assumptions before The Diagnosis begins, so the case can target exactly those gaps." }],
    category: "adaptive",
  },
  {
    id: "the-brief", name: "The Brief", tag: "Planned", tagColor: "#1A2B4A", icon: "📋", aiRole: "Examiner",
    connectivity: "live", positionPrimary: "practice", positionSecondary: "transfer",
    mode: "practice", structure: "open", outputFormat: "Written response",
    goal: ["Produce a structured professional response to a deliberately ambiguous brief", "Iterate toward a stronger response based on rubric-driven AI feedback"],
    description: "Learner receives a realistic professional brief and produces a structured written response. The AI evaluates against a pre-defined rubric and prompts targeted revision. Iterative loop, not one-shot.",
    bestFor: "Consulting, UX design, policy writing, marketing strategy, grant writing — any professional role where the core deliverable is a structured defensible recommendation",
    antiPattern: "Topics where quality is binary or procedural. Avoid as a first activity; learners need framework exposure first.",
    timeNeeded: "long", outputType: "Open response", personalisation: "Rubric is fixed; response is entirely open",
    designTip: "Write the brief with deliberate ambiguity. The decisions learners make about what to include reveal their professional judgment.",
    commonPitfalls: ["Rubrics that are too prescriptive — they reward compliance over thinking.", "Treating the first submission as the final output."],
    pairings: [{ id: "pressure-test", reason: "After producing a structured response, the Pressure Test interrogates the reasoning behind it as if presenting to a real client." }, { id: "argument-builder", reason: "Argument Builder builds the skill of constructing a defensible case — The Brief requires that skill in a realistic professional deliverable." }],
    category: "adaptive",
  },
  {
    id: "the-sequence", name: "The Sequence", tag: "Planned", tagColor: "#1A2B4A", icon: "🔢", aiRole: "Revealer",
    connectivity: "offline", positionPrimary: "opener", positionSecondary: "practice",
    mode: "assessment", structure: "fixed", outputFormat: "Selection",
    goal: ["Recall and apply the correct procedural order for a defined process", "Understand why sequence matters, not just what the sequence is"],
    description: "Learner receives a set of steps and must arrange them correctly. Plausible distractors are built in. After each attempt, the AI explains not just the correct order but why the sequence matters.",
    bestFor: "Clinical procedures, compliance workflows, safety protocols, onboarding processes — any process where doing steps out of order has real consequences",
    antiPattern: "Topics without a correct sequence. Avoid for conceptual or judgment-based content that cannot be linearized.",
    timeNeeded: "short", outputType: "Structured input", personalisation: "Same sequence and distractors for all learners",
    designTip: "Include at least two plausible-but-wrong adjacent pairs. The most instructive errors come from swapping steps that are logically close.",
    commonPitfalls: ["Sequences so obvious that no one gets them wrong.", "Explaining the correct order without explaining why each step must precede the next."],
    pairings: [{ id: "adaptive-question-pack", reason: "The Sequence validates procedural recall; AQP can then route learners who miss steps to targeted remediation content." }, { id: "the-diagnosis", reason: "Correct sequencing is often a prerequisite for The Diagnosis — learners need procedural fluency before they can diagnose effectively." }],
    category: "adaptive",
  },
  {
    id: "scenario-brancher", name: "Adaptive Scenario", tag: "Planned", tagColor: "#1A2B4A", icon: "🌿", aiRole: "World",
    connectivity: "live", positionPrimary: "practice", positionSecondary: null,
    mode: "simulation", structure: "adaptive", outputFormat: "Selection",
    goal: ["Experience realistic consequences of decisions in a complex multi-stakeholder situation", "Develop judgment by navigating a scenario with no pre-authored right answer"],
    description: "Learner makes choices that shape a live branching narrative. There are no pre-authored branches. The AI generates each story beat in direct response to the learner's actual choices. The world remembers what was decided.",
    bestFor: "Business ethics, leadership dilemmas, public policy, clinical ethics, crisis communication — situations where the realistic consequence of a decision is the learning",
    antiPattern: "Skills requiring real conversation practice. Avoid when learners need procedural knowledge.",
    timeNeeded: "medium", outputType: "Structured input", personalisation: "Scenario is generated per topic; narrative adapts to each learner's choices",
    designTip: "Establish 2 to 3 visible world-state variables that shift with each decision. Without visible consequences, choices feel arbitrary.",
    commonPitfalls: ["Branches that converge too quickly.", "Choices framed as obviously good or bad rather than genuine tradeoffs."],
    pairings: [{ id: "decision-sim", reason: "Decision Simulator builds judgment through visible consequences; Adaptive Scenario extends that into a richer narrative context." }, { id: "perspective-flip", reason: "After navigating a branching scenario, Perspective Flip lets the learner replay it from another stakeholder's point of view." }],
    category: "adaptive",
  },
  {
    id: "misconception-detector", name: "Misconception Detector", tag: "Planned", tagColor: "#1A2B4A", icon: "🧠", aiRole: "Guide",
    connectivity: "live", positionPrimary: "opener", positionSecondary: null,
    mode: "assessment", structure: "adaptive", outputFormat: "Written response",
    goal: ["Reveal confidently-held but incorrect mental models before instruction begins", "Route each learner to content that addresses their specific gaps, not a generic path"],
    description: "Before instruction begins, the AI probes the learner's existing mental model through open-ended questions. It surfaces gaps, contradictions, and confidently-held misconceptions then routes the learner to content targeting exactly those gaps.",
    bestFor: "Module openers where prior knowledge is highly variable — onboarding, re-training, cross-functional upskilling, any context where learners overestimate their own readiness",
    antiPattern: "Audiences with genuinely homogeneous prior knowledge — if everyone starts from the same place, adaptive routing provides no benefit.",
    timeNeeded: "short", outputType: "Open response", personalisation: "Learning path adapts to each individual's mental model",
    designTip: "Design the detector around the 3 or 4 most dangerous misconceptions in your domain. Generic probing questions surface rehearsed answers, not genuine mental models.",
    commonPitfalls: ["Questions too vague to reveal a misconception.", "Routing all learners to the same content regardless of their answers."],
    pairings: [{ id: "world-model-builder", reason: "WMB reveals the shape of the mental model visually before Misconception Detector probes the specific wrong assumptions it contains." }, { id: "adaptive-question-pack", reason: "Misconception Detector identifies which concepts are misunderstood; AQP then delivers question clusters targeted at exactly those gaps." }],
    category: "adaptive",
  },
  {
    id: "socratic-dialogue", name: "Socratic Dialogue", tag: "Planned", tagColor: "#1A2B4A", icon: "🗣️", aiRole: "Examiner",
    connectivity: "live", positionPrimary: "reflection", positionSecondary: null,
    mode: "reflection", structure: "open", outputFormat: "Written response",
    goal: ["Develop precision in reasoning by responding only to questions, never answers", "Surface and resolve internal contradictions in a held position"],
    description: "Learner makes a claim or takes a position. The AI never confirms or denies — it only responds with questions that force the learner to reason more precisely, resolve contradictions, and define terms they assumed were clear.",
    bestFor: "Philosophy, ethics, complex conceptual content, critical thinking development — wherever the goal is to make learners think more carefully",
    antiPattern: "Procedural or factual content where a clear correct answer exists.",
    timeNeeded: "medium", outputType: "Open response", personalisation: "Shaped entirely by the learner's own claims and reasoning",
    designTip: "Prime learners with a deliberately provocative or ambiguous opening prompt. The quality of the dialogue depends entirely on the quality of the first claim.",
    commonPitfalls: ["AI that reveals its position too early — learners stop reasoning.", "Dialogues that run without a synthesis or debrief."],
    pairings: [{ id: "argument-builder", reason: "Argument Builder develops the skill of constructing a case — Socratic Dialogue then tests whether the foundations of that case hold under sustained questioning." }, { id: "pressure-test", reason: "Both activities probe reasoning under pressure — Socratic Dialogue through questions only, Pressure Test through direct challenge." }],
    category: "adaptive",
  },
  {
    id: "concept-mapper", name: "Concept Mapper", tag: "Planned", tagColor: "#1A2B4A", icon: "🕸️", aiRole: "Guide",
    connectivity: "live", positionPrimary: "opener", positionSecondary: "reflection",
    mode: "reflection", structure: "open", outputFormat: "Written response",
    goal: ["Articulate causal relationships between concepts in a domain", "Identify missing or weak links in their mental model and route to content that fills them"],
    description: "Learner describes how a defined set of concepts relate to each other — which drives which, what the causal logic is. The AI evaluates the quality and specificity of each connection, flags shallow or missing links, and routes to content that fills identified gaps.",
    bestFor: "Complex frameworks, systems thinking, economics, organizational theory, science — any domain where understanding relationships between ideas matters as much as the ideas themselves",
    antiPattern: "Simple procedural topics. If the relationships are obvious, the activity produces no diagnostic signal.",
    timeNeeded: "medium", outputType: "Guided response", personalisation: "Map structure is unique to each learner",
    designTip: "Give learners the concept list but not the relationship structure. Letting them discover connections reveals genuine understanding versus surface familiarity.",
    commonPitfalls: ["Accepting surface-level connections without requiring direction, causality, or dependency.", "Maps with too many nodes — beyond 8 to 10 concepts cognitive load defeats the purpose."],
    pairings: [{ id: "world-model-builder", reason: "Both reveal the learner's mental model — WMB through actor relationships in a system, Concept Mapper through causal logic between ideas." }, { id: "the-diagnosis", reason: "Concept Mapper reveals how the learner understands relationships; The Diagnosis tests whether they can apply that understanding through structured inquiry." }],
    category: "adaptive",
  },
  {
    id: "perspective-flip", name: "Perspective Flip", tag: "Planned", tagColor: "#1A2B4A", icon: "🔄", aiRole: "Mirror",
    connectivity: "live", positionPrimary: "reflection", positionSecondary: "transfer",
    mode: "reflection", structure: "open", outputFormat: "Written response",
    goal: ["Inhabit the perspective of the other party in a past experience", "Articulate specifically what the other person needed that was not provided"],
    description: "Learner re-enters a situation they have already experienced — but now plays the other person's role. The AI recreates the interaction from the other side. Learner must respond as the other party would have, then articulate what they now understand differently.",
    bestFor: "Empathy and perspective-taking, conflict resolution, management skills, customer experience design, cross-cultural training",
    antiPattern: "Situations involving real trauma or significant power imbalance where role reversal could feel trivializing. Avoid as a first activity.",
    timeNeeded: "medium", outputType: "Open response", personalisation: "Built from the learner's own prior experience",
    designTip: "The debrief is the activity. After the flip, ask one question: What did the other person need from you that you didn't give them?",
    commonPitfalls: ["Running the flip before learners have genuinely processed their own experience.", "AI that plays the other party too sympathetically."],
    pairings: [{ id: "conversation-sim", reason: "Conversation Simulator generates the actual transcript that Perspective Flip then recreates from the other side — making the flip specific rather than generic." }, { id: "scenario-brancher", reason: "After navigating a branching scenario, Perspective Flip lets the learner inhabit a different stakeholder's path through the same events." }],
    category: "adaptive",
  },
  {
    id: "prediction-pause", name: "Prediction Pause", tag: "Planned", tagColor: "#1A2B4A", icon: "🔮", aiRole: "Revealer",
    connectivity: "offline", positionPrimary: "opener", positionSecondary: "reflection",
    mode: "reflection", structure: "fixed", outputFormat: "Written response",
    goal: ["Commit to a prediction and its reasoning before an outcome is revealed", "Diagnose the gap between expected and actual results as a learning signal"],
    description: "Before an outcome, data point, or consequence is revealed, the learner records their prediction and why. The reveal then compares their prediction to reality and diagnoses the reasoning gap.",
    bestFor: "Data literacy, behavioural economics, change management, safety culture, clinical judgment, financial forecasting — any domain where learner intuitions are systematically miscalibrated",
    antiPattern: "Topics where learners have no basis for a prediction. Avoid when the outcome is too obvious to create surprise.",
    timeNeeded: "short", outputType: "Guided response", personalisation: "Same outcome for all learners",
    designTip: "Ask learners to explain their reasoning, not just state their prediction. The reasoning is what gets updated in the reveal.",
    commonPitfalls: ["Revealing the outcome without connecting it to the learner's specific stated reasoning.", "Using outcomes that are too predictable."],
    pairings: [{ id: "myth-lab", reason: "Both use the gap between expectation and reality as the learning mechanism — sequenced together they reinforce the same metacognitive habit." }, { id: "misconception-detector", reason: "Prediction Pause reveals where intuitions are miscalibrated; Misconception Detector then diagnoses the underlying assumption driving those wrong predictions." }],
    category: "adaptive",
  },
  {
    id: "design-own-scenario", name: "Design Your Own Scenario", tag: "Planned", tagColor: "#1A2B4A", icon: "🛠️", aiRole: "Guide",
    connectivity: "live", positionPrimary: "transfer", positionSecondary: null,
    mode: "exploration", structure: "open", outputFormat: "Written response",
    goal: ["Design a realistic learning scenario with roles, stakes, and a solvable challenge", "Have the scenario validated for instructional integrity before peer or live use"],
    description: "Learner becomes the designer. They define a realistic scenario — the roles, the stakes, the constraints, and the challenge. The AI validates the design for realism and learning potential and identifies weaknesses.",
    bestFor: "Advanced practitioners who learn through teaching, train-the-trainer programmes, leadership development cohorts",
    antiPattern: "Novice learners who lack enough domain knowledge to construct a realistic scenario.",
    timeNeeded: "long", outputType: "Open response", personalisation: "Entirely learner-generated",
    designTip: "Give learners a design brief with constraints. Unconstrained scenario design almost always produces scenarios that are too simple or too theatrical.",
    commonPitfalls: ["Learners designing scenarios without a challenge structure.", "Skipping the AI validation step."],
    pairings: [{ id: "conversation-sim", reason: "Designing a conversation scenario requires deep understanding of what makes one work — the designer then experiences it from the learner's side." }, { id: "pressure-test", reason: "The AI validates the scenario design — which is itself a form of pressure testing the designer's instructional thinking." }],
    category: "adaptive",
  },
  {
    id: "co-viewer", name: "Co-Viewer", tag: "Built", tagColor: "#0F6E56", icon: "🎬", aiRole: "Guide",
    connectivity: "live", positionPrimary: "practice", positionSecondary: null,
    mode: "exploration", structure: "adaptive", outputFormat: "Written response",
    goal: ["Get immediate answers to questions during video viewing grounded in the video's content", "Deepen comprehension of complex content without leaving the learning context"],
    description: "Learner watches a video with a live chat interface alongside it. The AI is pre-loaded with the full transcript and a scene-by-scene content brief. Learner can ask any question at any moment and receive an answer grounded entirely in the video's content.",
    bestFor: "Any video-based learning where comprehension gaps are common — complex technical content, nuanced soft skills modelling, clinical demonstrations, case study footage",
    antiPattern: "Videos with no transcript or visual context brief.",
    timeNeeded: "medium", outputType: "Guided response", personalisation: "Same video for all; responses adapt entirely to each learner's questions",
    designTip: "The transcript alone is not enough. Write a scene-by-scene content brief that describes what is visually shown.",
    commonPitfalls: ["Using a raw auto-generated transcript with no visual context.", "No scope boundary — without clear instruction the AI defaults to general knowledge."],
    pairings: [{ id: "world-model-builder", reason: "WMB maps what the learner thinks about a system before they watch — the Co-Viewer AI can then address their specific misconceptions when questions arise." }, { id: "socratic-debrief", reason: "Co-Viewer handles comprehension questions during viewing; Socratic Video Debrief then deepens interpretation after — natural two-part sequence." }],
    category: "adaptive",
  },
  {
    id: "video-critique", name: "Video Critique", tag: "Planned", tagColor: "#1A2B4A", icon: "🎥", aiRole: "Examiner",
    connectivity: "live", positionPrimary: "reflection", positionSecondary: null,
    mode: "reflection", structure: "fixed", outputFormat: "Written response",
    goal: ["Evaluate observed behaviour against an expert rubric", "Develop the analytical skill to distinguish effective from ineffective practice"],
    description: "Learner watches a demonstration then submits a structured critique of what they observed. The AI evaluates the quality of the critique itself against an expert rubric — not just whether the learner liked what they saw.",
    bestFor: "Skill modelling for interpersonal competencies, clinical or technical procedure review, leadership behaviour analysis, sales and coaching skills",
    antiPattern: "Informational or conceptual videos where there is nothing to critique.",
    timeNeeded: "medium", outputType: "Open response", personalisation: "Same video and rubric for all learners",
    designTip: "Design the rubric before you select the video. The rubric defines what expert observation looks like.",
    commonPitfalls: ["Rubrics that accept surface-level critique without requiring connection to impact or outcome.", "Videos that model perfect behaviour — learners have nothing to critically evaluate."],
    pairings: [{ id: "perspective-flip", reason: "After critiquing observed behaviour from the outside, Perspective Flip puts the learner inside the same situation." }, { id: "conversation-sim", reason: "Video Critique builds the analytical skill to recognise effective practice; Conversation Simulator then requires the learner to produce it themselves." }],
    category: "adaptive",
  },
  {
    id: "predict-and-pause", name: "Predict & Pause", tag: "Planned", tagColor: "#1A2B4A", icon: "⏸️", aiRole: "Revealer",
    connectivity: "offline", positionPrimary: "opener", positionSecondary: "practice",
    mode: "reflection", structure: "fixed", outputFormat: "Written response",
    goal: ["Predict what happens at key decision moments before the video resolves", "Diagnose miscalibrated judgment by comparing prediction to actual outcome"],
    description: "Playback stops at pre-defined moments — a decision point, a consequence reveal, a turning point. Before the video continues, the learner predicts what happens next. The AI evaluates the prediction against what actually occurs.",
    bestFor: "Behaviour modelling videos, case study footage, clinical or technical procedure demonstrations",
    antiPattern: "Linear informational videos with no decision points.",
    timeNeeded: "medium", outputType: "Guided response", personalisation: "Same pause points and outcomes for all learners",
    designTip: "Place pause points immediately before moments of consequence, not after. The learner must predict before they see the result.",
    commonPitfalls: ["Pause points placed at random intervals rather than genuine decision moments.", "Accepting predictions without requiring the learner to explain their reasoning."],
    pairings: [{ id: "scene-continuation", reason: "Predict & Pause primes the learner's thinking at a decision point; Scene Continuation then requires them to act on it." }, { id: "myth-lab", reason: "Both create productive surprise by confronting expectations with reality — sequenced together they build a strong metacognitive habit." }],
    category: "adaptive",
  },
  {
    id: "scene-continuation", name: "Scene Continuation", tag: "Planned", tagColor: "#1A2B4A", icon: "▶️", aiRole: "Character",
    connectivity: "live", positionPrimary: "practice", positionSecondary: "transfer",
    mode: "simulation", structure: "adaptive", outputFormat: "Written response",
    goal: ["Apply a skill at the exact moment a video scenario leaves it unresolved", "Experience realistic AI-generated consequences based on their specific response"],
    description: "The video shows the opening of a situation and cuts before the resolution. The learner must decide what happens next and respond as if they are in the scene. The AI plays the other party or narrates consequences using the video's established context as foundation.",
    bestFor: "Interpersonal skill development, leadership scenarios, crisis communication, clinical judgment",
    antiPattern: "Procedural or factual videos where there is no meaningful continuation.",
    timeNeeded: "long", outputType: "Open response", personalisation: "Same scene for all; AI response adapts to each learner's continuation",
    designTip: "The cut point is everything. The video must end at maximum tension — the moment just before a response is required.",
    commonPitfalls: ["Cutting too early — learners have not seen enough context.", "The AI continuation ignoring the emotional tone established in the video."],
    pairings: [{ id: "conversation-sim", reason: "Scene Continuation uses video context to set up the scenario; Conversation Simulator provides the deeper adaptive conversation that follows." }, { id: "predict-and-pause", reason: "Predict & Pause develops judgment at the decision point; Scene Continuation then requires the learner to carry it through to resolution." }],
    category: "adaptive",
  },
  {
    id: "socratic-debrief", name: "Socratic Video Debrief", tag: "Planned", tagColor: "#1A2B4A", icon: "💭", aiRole: "Examiner",
    connectivity: "live", positionPrimary: "reflection", positionSecondary: "transfer",
    mode: "reflection", structure: "open", outputFormat: "Written response",
    goal: ["Build evidence-based interpretations of video content through sustained questioning", "Distinguish surface recall from analytical understanding grounded in specific observed moments"],
    description: "After watching a video, the learner enters a Socratic dialogue entirely anchored in the video's content. The AI never accepts claims without asking what in the video supports them.",
    bestFor: "Case study videos, documentary-style content, expert interview recordings, ethical dilemma scenarios",
    antiPattern: "Short instructional clips or procedural demonstrations where the content is meant to be applied, not debated.",
    timeNeeded: "medium", outputType: "Open response", personalisation: "Shaped entirely by the learner's own interpretations and claims",
    designTip: "Write 3 to 5 anchor questions that represent the deepest interpretive challenges in the video. These are targets the dialogue should reach, not opening questions.",
    commonPitfalls: ["No synthesis at the end — learners need structured reflection to consolidate.", "AI that accepts vague references without requiring the learner to name the specific moment."],
    pairings: [{ id: "co-viewer", reason: "Co-Viewer handles comprehension during viewing; Socratic Video Debrief deepens interpretation after — a complete video-based learning sequence." }, { id: "perspective-flip", reason: "Socratic Debrief builds evidence-based interpretation of what was shown; Perspective Flip then asks the learner to inhabit a different viewpoint on the same content." }],
    category: "adaptive",
  },
  {
    id: "true-or-false", name: "True or False", tag: "Built", tagColor: "#0F6E56", icon: "⚖️", aiRole: "None",
    connectivity: "offline", positionPrimary: "opener", positionSecondary: "assessment",
    mode: "assessment", structure: "fixed", outputFormat: "Selection",
    goal: ["Surface confidently-held misconceptions before instruction begins", "Force a clear binary commitment to a statement before the explanation is revealed"],
    description: "Learner evaluates a set of statements as true or false and receives an immediate rationale after every answer. The most effective statements are true-but-counterintuitive or false-but-credible — obvious statements teach nothing. Designed to create productive surprise and anchor the learning moment to a specific claim.",
    bestFor: "Any domain with persistent misconceptions — compliance, safety, clinical practice, financial literacy, management. Works especially well as a pre-instruction primer to surface false assumptions before they resist correction.",
    antiPattern: "Topics where all statements are obviously true or false. Avoid when the learning goal requires nuance or multiple valid answers — binary format forces artificial certainty.",
    timeNeeded: "short", outputType: "Selection", personalisation: "Same for all learners",
    designTip: "Write toward the misconception. The best false statements are ones your audience will confidently get wrong. The rationale is the learning — never skip it.",
    commonPitfalls: ["Statements that are obviously true or false — no productive surprise means no learning.", "Rationales that just restate the answer rather than explaining why."],
    refFile: "pb_true_or_false.jsx",
    category: "standard",
    pairings: [{ id: "multiple-choice", reason: "True or False primes learners with binary commitments; Multiple Choice then tests application of the same concepts with more nuance." }, { id: "myth-lab", reason: "Both use productive surprise as the learning mechanism — True or False is simpler and faster; Myth Lab adds a confidence dimension for deeper calibration." }],
  },
  {
    id: "sequencing", name: "Sequencing", tag: "Built", tagColor: "#0F6E56", icon: "↕️", aiRole: "None",
    connectivity: "offline", positionPrimary: "practice", positionSecondary: "assessment",
    mode: "assessment", structure: "fixed", outputFormat: "Selection",
    goal: ["Place steps, stages, or events in the correct procedural or chronological order", "Understand why sequence matters — not just what the steps are"],
    description: "Learner is presented with a shuffled set of steps or stages and must drag them into the correct order. Feedback on submission identifies misplaced items and explains the reasoning behind each position. Designed to reveal gaps in procedural knowledge, not just recall.",
    bestFor: "Processes with a meaningful order — onboarding procedures, compliance workflows, clinical protocols, project phases, decision sequences",
    antiPattern: "Steps with no meaningful order, or where multiple orderings are equally valid.",
    timeNeeded: "short", outputType: "Drag interaction", personalisation: "Same for all learners",
    designTip: "Include at least 2 pairs of adjacent steps that learners commonly confuse. Rationales should explain WHY position matters, not just restate the step.",
    commonPitfalls: ["Steps that can be done in any order — sequence only works when order has consequence.", "Rationales that just name the step rather than explaining positional logic."],
    refFile: "pb_sequencing.jsx",
    category: "standard",
    pairings: [{ id: "multiple-choice", reason: "Sequencing confirms procedural knowledge; Multiple Choice can then test the reasoning behind specific decision points within that process." }, { id: "categorisation", reason: "Sequence the phases, then categorise the actions or actors within each phase — a natural two-step activity pair." }],
  },
  {
    id: "categorisation", name: "Categorisation", tag: "Built", tagColor: "#0F6E56", icon: "🗂️", aiRole: "None",
    connectivity: "offline", positionPrimary: "practice", positionSecondary: "assessment",
    mode: "assessment", structure: "fixed", outputFormat: "Selection",
    goal: ["Sort items into the correct conceptual or functional categories", "Distinguish between categories that share surface-level similarities"],
    description: "Learner drags a set of cards from a pool into labelled category zones. Feedback reveals which items were misclassified and explains the correct categorisation. At least one item in the set is a plausible misclassification trap — an item learners commonly put in the wrong category.",
    bestFor: "Any domain with distinct but easily confused categories — compliance types, risk levels, contract clauses, clinical classifications, tool types",
    antiPattern: "Categories that are obvious or have no plausible overlap. Avoid when the learning goal requires open-ended reasoning.",
    timeNeeded: "short", outputType: "Drag interaction", personalisation: "Same for all learners",
    designTip: "2-3 categories is the sweet spot. More than 4 creates visual clutter that shifts cognitive load from content to interface.",
    commonPitfalls: ["Items that obviously belong in one category — no trap items means no real thinking.", "Category labels that telegraph the answer."],
    refFile: "pb_categorisation.jsx",
    category: "standard",
    pairings: [{ id: "matching", reason: "Categorisation groups items by type; Matching pairs each item with its specific definition or counterpart." }, { id: "sequencing", reason: "Categorise the actions or actors first, then sequence the phases they belong to." }],
  },
  {
    id: "multiple-choice", name: "Multiple Choice", tag: "Built", tagColor: "#0F6E56", icon: "◉", aiRole: "None",
    connectivity: "offline", positionPrimary: "practice", positionSecondary: "assessment",
    mode: "assessment", structure: "fixed", outputFormat: "Selection",
    goal: ["Apply knowledge to scenario-based or conceptual questions under realistic conditions", "Receive immediate feedback that explains why each option is right or wrong"],
    description: "Learner answers a set of questions, each with four options. Feedback fires immediately on selection — the correct answer is revealed and a brief explanation given for both the right and wrong choice. A results summary is shown after all questions are answered. Designed for application and understanding, not surface recall.",
    bestFor: "Knowledge checks, scenario-based application, compliance verification, concept discrimination — any domain where the difference between similar options is the learning target",
    antiPattern: "Topics requiring open-ended reasoning or where the learning goal is the quality of the argument, not the answer.",
    timeNeeded: "short", outputType: "Selection", personalisation: "Same for all learners",
    designTip: "Distractors must be plausible — learners should need to think to rule them out. Avoid obviously wrong options that inflate perceived scores.",
    commonPitfalls: ["Questions that test recall rather than application.", "Distractors that are clearly wrong, making correct answers too obvious."],
    refFile: "pb_multiple_choice.jsx",
    category: "standard",
    pairings: [{ id: "sequencing", reason: "Multiple Choice tests the reasoning behind specific steps; Sequencing confirms procedural order — pair them to cover both why and when." }, { id: "myth-lab", reason: "Myth Lab surfaces confident misconceptions; Multiple Choice can then test whether learners can correctly apply what they now know." }],
  },
  {
    id: "matching", name: "Matching", tag: "Built", tagColor: "#0F6E56", icon: "🔗", aiRole: "None",
    connectivity: "offline", positionPrimary: "practice", positionSecondary: "assessment",
    mode: "assessment", structure: "fixed", outputFormat: "Selection",
    goal: ["Connect terms, concepts, or actors to their definitions, roles, or counterparts", "Distinguish between similar items that are commonly confused or conflated"],
    description: "Learner draws lines from a set of left-column items to their matching right-column items. Connections are made by dragging a line from one dot to another using a visual connector. Right-column items are shuffled on load. Feedback on submission colour-codes correct and incorrect connections and explains wrong matches.",
    bestFor: "Vocabulary and terminology, roles and responsibilities, causes and effects, concepts and examples, any domain with paired relationships",
    antiPattern: "Pairings that are obvious without domain knowledge, or where multiple valid matches exist.",
    timeNeeded: "short", outputType: "Connection drawing", personalisation: "Same for all learners",
    designTip: "Include at least 2 pairs that learners commonly confuse — pairs with surface-level similarity that require genuine understanding to distinguish.",
    commonPitfalls: ["Pairs that can be matched by process of elimination rather than knowledge.", "Left items that contain keywords from the right items."],
    refFile: "pb_matching.jsx",
    category: "standard",
    pairings: [{ id: "categorisation", reason: "Matching pairs specific terms to definitions; Categorisation then groups those terms by type — natural two-step vocabulary activity." }, { id: "multiple-choice", reason: "Matching confirms term-to-definition knowledge; Multiple Choice can then test application of those terms in context." }],
  },
];

const DIMENSIONS = [
  { id: "mode", label: "Learning mode", question: "What kind of learning experience do you need?", options: [{ id: "practice", label: "Practice", sub: "Skill-building through doing and repetition" }, { id: "simulation", label: "Simulation", sub: "Contextual decisions with realistic consequences" }, { id: "reflection", label: "Reflection", sub: "Interpretation, metacognition, meaning-making" }, { id: "assessment", label: "Assessment", sub: "Evaluate or validate what learners know" }, { id: "exploration", label: "Exploration", sub: "Open-ended inquiry and discovery" }] },
  { id: "structure", label: "System behaviour", question: "How should the activity behave for different learners?", options: [{ id: "fixed", label: "Fixed", sub: "Same experience for everyone" }, { id: "adaptive", label: "Adaptive", sub: "Changes based on how the learner responds" }, { id: "open", label: "Open-ended", sub: "Learner-directed, non-linear" }] },
  { id: "outputFormat", label: "Learner response", question: "How does the learner interact with this activity?", options: [{ id: "Written response", label: "Written response", sub: "Learner types open-ended answers" }, { id: "Selection", label: "Selection", sub: "Learner chooses from structured options" }, { id: "Both", label: "Both", sub: "Activity uses selection and written response" }] },
  { id: "position", label: "Sequence position", question: "Where in the learning sequence does this activity belong?", options: [{ id: "opener", label: "Opener", sub: "Before instruction — surfaces prior knowledge or gaps" }, { id: "practice", label: "Practice", sub: "Mid-sequence — learners apply skills with support" }, { id: "reflection", label: "Reflection", sub: "After instruction — consolidate and reinterpret" }, { id: "transfer", label: "Transfer", sub: "Near the end — apply to real or new contexts" }] },
  { id: "timeNeeded", label: "Time budget", question: "How long should this activity take?", options: [{ id: "short", label: "Short", sub: "2-5 minutes" }, { id: "medium", label: "Medium", sub: "5-10 minutes" }, { id: "long", label: "Long", sub: "10-15 minutes" }] },
];


const RED = "#E8192C", RED_L = "#FDE8EA";
const NAVY = "#1A2B4A", BORDER = "#DDE1E7";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Helvetica Neue', Helvetica, Arial, monospace";
const GRN = "#0F6E56", GRN_L = "#E1F5EE";
const AMB = "#854F0B", AMB_L = "#FAEEDA";
const TS = "#4A5568", TT = "#8A96A3";

const AI_ROLE_STYLES = {
  Character: { bg: "#EEEDFE", color: "#3C3489", title: "The AI plays a specific person — stays in character and responds to the learner's exact words" },
  World:     { bg: "#FAEEDA", color: "#854F0B", title: "The AI plays the world — generates consequences that ripple through visible state variables after each decision" },
  Examiner:  { bg: "#FDE8EA", color: "#A32D2D", title: "The AI challenges and probes — never validates early, always presses on the weakest claim" },
  Guide:     { bg: "#E1F5EE", color: "#0F6E56", title: "The AI diagnoses and routes — reads the learner's pattern to infer gaps and direct what comes next" },
  Revealer:  { bg: "#E6F1FB", color: "#185FA5", title: "The AI withholds then discloses — only reveals what is directly asked for, nothing more" },
  Mirror:    { bg: "#F3EEFF", color: "#534AB7", title: "The AI recreates the other side — the learner experiences the situation from the other person's perspective" },
  None:      { bg: "#F4F5F7", color: "#4A5568", title: "No runtime AI — content is pre-baked at design time using the authoring studio" },
};
const MODE_STYLES = {
  practice:    { bg: "#FEF3E8", color: "#92400E", label: "Practice",    title: "Skill-building through doing and repetition" },
  reflection:  { bg: "#F3F0FF", color: "#4C1D95", label: "Reflection",  title: "Interpretation, metacognition, and meaning-making after instruction" },
  simulation:  { bg: "#EFF6FF", color: "#1E40AF", label: "Simulation",  title: "Contextual decisions with realistic consequences" },
  assessment:  { bg: "#ECFDF5", color: "#065F46", label: "Assessment",  title: "Evaluate or validate what learners know or can do" },
  exploration: { bg: "#F0FDFA", color: "#134E4A", label: "Exploration", title: "Open-ended inquiry and discovery with no predetermined answer" },
};
const STRUCTURE_STYLES = {
  fixed:    { bg: "#F4F5F7", color: "#4A5568", label: "Fixed",      title: "Same experience for every learner — content is authored once" },
  adaptive: { bg: "#EFF6FF", color: "#1E40AF", label: "Adaptive",   title: "The activity changes based on how each individual learner responds" },
  open:     { bg: "#F3F0FF", color: "#4C1D95", label: "Open-ended", title: "Learner-directed and non-linear — no fixed path through the activity" },
};
const POSITION_STYLES = {
  opener:     { bg: "#FFF7ED", color: "#C2410C", label: "Opener",     title: "Works well at the start of a learning sequence to surface prior knowledge or set context" },
  practice:   { bg: "#F0FDF4", color: "#15803D", label: "Practice",   title: "Best placed mid-sequence when learners have enough context to apply skills" },
  reflection: { bg: "#F5F3FF", color: "#6D28D9", label: "Reflection", title: "Works after instruction or experience to consolidate and reinterpret learning" },
  transfer:   { bg: "#FFFBEB", color: "#B45309", label: "Transfer",   title: "Best placed near the end to apply learning to new or real-world contexts" },
};
const CONNECTIVITY_STYLES = {
  live:    { color: "#185FA5", bg: "#E6F1FB", label: "Live only",        title: "Requires a live API connection — the AI responds to each learner in real time" },
  offline: { color: "#065F46", bg: "#ECFDF5", label: "Live + Pre-baked", title: "Runs live or as a pre-baked offline activity — content can be generated at design time" },
};

function timeLabel(t) { return t === "short" ? "2-5 min" : t === "medium" ? "5-10 min" : "10-15 min"; }
function scoreEntry(entry, sel) {
  let score = 0, reasons = [];
  if (sel.mode && entry.mode === sel.mode) { score += 3; reasons.push("Matches your learning mode"); }
  if (sel.position && (entry.positionPrimary === sel.position || entry.positionSecondary === sel.position)) { score += 2; reasons.push("Fits your sequence position"); }
  if (sel.structure && entry.structure === sel.structure) { score += 2; reasons.push("Matches your system behaviour"); }
  if (sel.outputFormat && (sel.outputFormat === "Both" || entry.outputFormat === sel.outputFormat)) { score += 2; reasons.push("Matches your response type"); }
  if (sel.timeNeeded && entry.timeNeeded === sel.timeNeeded) { score += 1; reasons.push("Fits your time budget"); }
  return { score, reasons };
}
function pj(raw) {
  try { const f = String.fromCharCode(96,96,96); return JSON.parse(raw.split(f+"json").join("").split(f).join("").trim()); } catch { return null; }
}
function cardSentence(entry) {
  const rv = { Character:"The AI plays the other person", World:"The AI generates consequences", Examiner:"The AI challenges and probes", Guide:"The AI diagnoses and routes", Revealer:"The AI withholds then discloses", Mirror:"The AI recreates the other side", None:"Pre-baked — no runtime AI required" }[entry.aiRole] || "AI-powered";
  const sp = { fixed:"same experience for everyone", adaptive:"adapts to each learner", open:"learner-directed" }[entry.structure] || "";
  return rv + " — " + sp;
}

async function analyseIdea(idea, catalog) {
  const summary = catalog.map(function(e){ return "ID:"+e.id+" | "+e.name+": "+e.description.slice(0,120)+" Best for: "+e.bestFor.slice(0,80); }).join("\n");
  const sys = "You are an instructional design expert. Match the described learning activity to the catalog or propose a new type.\n\nExisting catalog:\n"+summary+"\n\nReturn ONLY valid JSON: {match, matchStrength, matchReason, newIdea or null}";
  const res = await fetch("https://bdc-api.nicholasmcgowan07.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:800,system:sys,messages:[{role:"user",content:"Developer's idea: "+idea}]})});
  const d = await res.json(); return d.content[0].text;
}
async function generateObjectives(idea, activityName) {
  const sys = "You are an expert instructional designer. Generate 3 clear measurable learning objectives for a "+activityName+" activity. Each starts with an action verb. Return ONLY valid JSON: {topic, objectives: [string, string, string]}";
  const res = await fetch("https://bdc-api.nicholasmcgowan07.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:400,system:sys,messages:[{role:"user",content:"What I want to teach: "+idea}]})});
  const d = await res.json(); if(d.error) throw new Error(d.error.message); return d.content[0].text;
}
async function generateActivity(entry, contract) {
  const objText = contract.objectives.filter(function(o){return o.trim();}).map(function(o,i){return (i+1)+". "+o;}).join("\n");
  const sys = ["You are an expert React developer and instructional designer. Generate a complete production-ready JSX learning activity.","ACTIVITY: "+entry.name,"AI ROLE: "+entry.aiRole,"DESCRIPTION: "+entry.description,"BEST FOR: "+entry.bestFor,"OUTPUT FORMAT: "+entry.outputFormat,"DESIGN TIP: "+entry.designTip,"CURRICULUM CONTRACT: Topic: "+contract.topic+"\nObjectives:\n"+objText+"\nOut of scope: "+contract.outOfScope,"REQUIREMENTS: React functional component, default export App, fetch to https://bdc-api.nicholasmcgowan07.workers.dev, model claude-haiku-4-5-20251001, BDC colors RED #E8192C NAVY #1A2B4A, Helvetica Neue font, pill buttons, loading dots, error handling.","Output the complete JSX file only. No explanations."].join("\n");
  const res = await fetch("https://bdc-api.nicholasmcgowan07.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,system:sys,messages:[{role:"user",content:"Generate the complete activity JSX file now."}]})});
  const d = await res.json(); if(d.error) throw new Error(d.error.message); return d.content[0].text;
}

function Dots({label}) {
  return <div style={{display:"flex",alignItems:"center",gap:8,color:TT,fontSize:13,padding:"0.4rem 0"}}>{[0,200,400].map(d=><span key={d} style={{width:5,height:5,borderRadius:"50%",background:NAVY,display:"inline-block",animation:"pl-bounce 1.2s "+d+"ms infinite",opacity:0.4}}/>)}{label&&<span style={{marginLeft:4}}>{label}</span>}</div>;
}
function WifiIcon({size=14,color}) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><path d="M1.5 5.5a7.5 7.5 0 0111 0" stroke={color} strokeWidth="1.3" strokeLinecap="round"/><path d="M3.5 7.5a4.5 4.5 0 017 0" stroke={color} strokeWidth="1.3" strokeLinecap="round"/><path d="M5.5 9.5a2 2 0 013 0" stroke={color} strokeWidth="1.3" strokeLinecap="round"/><circle cx="7" cy="12" r="0.9" fill={color}/></svg>;
}
function BoxIcon({size=14,color}) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><rect x="1.5" y="5.5" width="11" height="7" rx="1" stroke={color} strokeWidth="1.2"/><path d="M1.5 8.5h11" stroke={color} strokeWidth="1" strokeLinecap="round"/><path d="M5 5.5V3a2 2 0 014 0v2.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>;
}
function ConnectivityBadge({entry}) {
  const lc="#185FA5", oc="#065F46";
  return <span style={{display:"inline-flex",alignItems:"center",gap:5}}><span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:20,background:"#E6F1FB",color:lc}}><WifiIcon size={11} color={lc}/>Live</span>{entry.connectivity==="offline"&&<span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:20,background:"#ECFDF5",color:oc}}><BoxIcon size={11} color={oc}/>Pre-baked</span>}</span>;
}

function ComparisonTable() {
  return (
    <div style={{overflowX:"auto",border:"0.5px solid "+BORDER,borderRadius:10,marginBottom:"1.5rem"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:SANS,tableLayout:"fixed"}}>
        <colgroup><col style={{width:140}}/><col style={{width:88}}/><col style={{width:80}}/><col style={{width:82}}/><col style={{width:92}}/><col style={{width:76}}/><col style={{width:54}}/><col style={{width:"auto"}}/></colgroup>
        <thead><tr>{["Activity","Mode","Structure","AI Role","Position","Output","Time","Goal"].map(h=><th key={h} style={{fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",color:TT,padding:"7px 8px",textAlign:"left",borderBottom:"1.5px solid "+BORDER,background:"#F8F9FB",fontFamily:MONO,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
        <tbody>
          {["Built","Planned"].map(group=>{
            const entries=CATALOG.filter(e=>e.tag===group);
            return [
              <tr key={"s"+group}><td colSpan={8} style={{background:"#F8F9FB",fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:TT,padding:"5px 8px",borderBottom:"0.5px solid "+BORDER,fontFamily:MONO}}>{group} — {entries.length}</td></tr>,
              ...entries.map(e=>{
                const ms=MODE_STYLES[e.mode]||{},ss=STRUCTURE_STYLES[e.structure]||{},rs=AI_ROLE_STYLES[e.aiRole]||{},ps=POSITION_STYLES[e.positionPrimary]||{},ps2=e.positionSecondary?POSITION_STYLES[e.positionSecondary]:null;
                return <tr key={e.id} style={{borderBottom:"0.5px solid "+BORDER}}>
                  <td style={{padding:"7px 8px",verticalAlign:"middle"}}><span style={{fontWeight:500,color:NAVY,fontSize:12}}>{e.icon} {e.name}</span></td>
                  <td style={{padding:"7px 8px",verticalAlign:"middle"}}><span style={{fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:4,background:ms.bg,color:ms.color}}>{ms.label}</span></td>
                  <td style={{padding:"7px 8px",verticalAlign:"middle"}}><span style={{fontSize:9,fontWeight:500,padding:"2px 6px",borderRadius:4,background:ss.bg,color:ss.color}}>{ss.label}</span></td>
                  <td style={{padding:"7px 8px",verticalAlign:"middle"}}><span style={{fontSize:9,fontWeight:500,padding:"2px 6px",borderRadius:4,background:rs.bg,color:rs.color}}>{e.aiRole}</span></td>
                  <td style={{padding:"7px 8px",verticalAlign:"top"}}><div style={{display:"flex",flexDirection:"column",gap:2}}><span style={{fontSize:9,fontWeight:600,padding:"1px 5px",borderRadius:3,background:ps.bg,color:ps.color,width:"fit-content"}}>{ps.label}</span>{ps2&&<span style={{fontSize:9,fontWeight:600,padding:"1px 5px",borderRadius:3,background:ps2.bg,color:ps2.color,width:"fit-content"}}>{ps2.label}</span>}</div></td>
                  <td style={{padding:"7px 8px",verticalAlign:"middle",fontSize:10,color:TS}}>{e.outputFormat}</td>
                  <td style={{padding:"7px 8px",verticalAlign:"middle",fontSize:10,color:TT,whiteSpace:"nowrap"}}>{timeLabel(e.timeNeeded)}</td>
                  <td style={{padding:"7px 8px",verticalAlign:"top",fontSize:10,color:TS,lineHeight:1.45}}>{(e.goal||[])[0]}</td>
                </tr>;
              }),
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}

function ActivityGridCard({entry,selected,onClick,dimmed}) {
  const rs=AI_ROLE_STYLES[entry.aiRole]||{}, ms=MODE_STYLES[entry.mode]||{};
  return (
    <div onClick={onClick} style={{background:"#fff",border:"1.5px solid "+(rs.color||BORDER),borderTop:"3px solid "+(ms.color||BORDER),borderRadius:10,padding:"1rem",cursor:"pointer",transition:"all 0.18s ease",opacity:dimmed?0.4:1,boxShadow:selected?"0 4px 20px rgba(26,43,74,0.12)":"0 1px 3px rgba(26,43,74,0.05)",transform:selected?"translateY(-1px)":"none",position:"relative"}}
      onMouseEnter={e=>{if(!selected){e.currentTarget.style.boxShadow="0 4px 12px rgba(26,43,74,0.10)";e.currentTarget.style.transform="translateY(-2px)";}}}
      onMouseLeave={e=>{if(!selected){e.currentTarget.style.boxShadow="0 1px 3px rgba(26,43,74,0.05)";e.currentTarget.style.transform="none";}}}>
      {selected&&<div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",width:28,height:3,background:rs.color||NAVY,borderRadius:"0 0 3px 3px"}}/>}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:"0.35rem"}}>
        <div style={{fontSize:15,fontWeight:600,color:NAVY,lineHeight:1.3}}>{entry.name}</div>
        <span style={{fontSize:28,lineHeight:1,flexShrink:0}}>{entry.icon}</span>
      </div>
      <div style={{fontSize:12,color:TS,lineHeight:1.5,marginBottom:"0.75rem",minHeight:34}}>{(entry.goal||[])[0]}</div>
      <div style={{fontSize:11,color:TT,lineHeight:1.55,borderTop:"1px solid "+BORDER,paddingTop:"0.625rem"}}>{cardSentence(entry)}</div>
    </div>
  );
}

function FeaturedPanel({entry,onBuild,onClose}) {
  const rs=AI_ROLE_STYLES[entry.aiRole]||{}, ms=MODE_STYLES[entry.mode]||{}, ss=STRUCTURE_STYLES[entry.structure]||{};
  const isBuilt=entry.tag==="Built";
  const ps=POSITION_STYLES[entry.positionPrimary]||{}, ps2=entry.positionSecondary?POSITION_STYLES[entry.positionSecondary]:null;
  const navigate=useNavigate();
  const timeMap={short:"2-5 min",medium:"5-10 min",long:"10-15 min"};
  const highlights=(entry.goal||[]).slice(0,3);
  const highlightIcons=["🧠","🔍","🗺️"];
  return (
    <div style={{background:"#fff",border:"1px solid "+BORDER,borderRadius:14,marginBottom:"1.5rem",overflow:"hidden",boxShadow:"0 4px 24px rgba(26,43,74,0.09)",animation:"pl-in 0.22s ease both"}}>
      <div style={{padding:"1.25rem 1.5rem",display:"flex",alignItems:"flex-start",gap:"1rem"}}>
        <div style={{width:56,height:56,borderRadius:14,background:"#F0FAF6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{entry.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:20,fontWeight:700,color:NAVY,marginBottom:"0.625rem",lineHeight:1.2}}>{entry.name}</div>
          <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
            {isBuilt&&<button onClick={()=>navigate("/"+entry.id)} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"0.45rem 1.125rem",borderRadius:50,border:"none",background:"#0F6E56",color:"#fff",fontFamily:SANS,fontSize:13,fontWeight:700,cursor:"pointer"}}><svg width="11" height="11" viewBox="0 0 13 13" fill="none"><path d="M5 4.5l4 2-4 2V4.5z" fill="#fff"/></svg>Try</button>}
          </div>
        </div>
        <button onClick={onClose} style={{flexShrink:0,width:28,height:28,borderRadius:"50%",border:"1px solid "+BORDER,background:"#F8F9FB",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:TT}}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div style={{padding:"0 1.5rem 1rem"}}>
        <p style={{fontSize:15,fontWeight:600,color:NAVY,lineHeight:1.55,margin:0}}>{entry.description}</p>
      </div>
      <div style={{padding:"0.75rem 1.5rem",borderTop:"1px solid "+BORDER,borderBottom:"1px solid "+BORDER,display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap"}}>
        <span style={{fontSize:12,fontWeight:600,padding:"3px 10px",borderRadius:4,background:ms.bg,color:ms.color}}>{ms.label}</span>
        <span style={{color:BORDER,fontSize:14}}>|</span>
        <span style={{fontSize:12,fontWeight:500,padding:"3px 10px",borderRadius:4,background:ss.bg,color:ss.color}}>{ss.label}</span>
        <span style={{color:BORDER,fontSize:14}}>|</span>
        <span style={{fontSize:12,fontWeight:500,padding:"3px 10px",borderRadius:4,background:rs.bg,color:rs.color}}>{entry.aiRole}</span>
        <span style={{color:BORDER,fontSize:14}}>|</span>
        <span style={{fontSize:12,fontWeight:600,color:ps.color}}>{ps.label}{ps2&&<span style={{color:TT}}> to {ps2.label}</span>}</span>
        <span style={{color:BORDER,fontSize:14}}>|</span>
        <span style={{fontSize:12,color:TT}}>{timeMap[entry.timeNeeded]||entry.timeNeeded}</span>
      </div>
      {highlights.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat("+highlights.length+",1fr)",borderBottom:"1px solid "+BORDER}}>
          {highlights.map((g,i)=>(
            <div key={i} style={{padding:"1rem 1.25rem",borderRight:i<highlights.length-1?"1px solid "+BORDER:"none",display:"flex",alignItems:"flex-start",gap:"0.625rem"}}>
              <span style={{fontSize:18,flexShrink:0}}>{highlightIcons[i]}</span>
              <span style={{fontSize:13,color:NAVY,lineHeight:1.5,fontWeight:500}}>{g}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{padding:"0.875rem 1.5rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
        <span style={{fontSize:13,color:TT}}><strong style={{color:NAVY}}>Best for:</strong> {entry.bestFor}</span>
      </div>
    </div>
  );
}

function ExploreView({onBuild}) {
  const [activeModes,setActiveModes]=useState(new Set());
  const [selected,setSelected]=useState(null);
  const [showTable,setShowTable]=useState(false);
  const [showFilters,setShowFilters]=useState(false);
  const panelRef=useRef(null), topRef=useRef(null);
  const mobile=useMobile();
  const cols=mobile?"repeat(2, 1fr)":"repeat(3, 1fr)";
  const modes=["practice","reflection","simulation","assessment","exploration"];
  const toggleMode=m=>{setActiveModes(prev=>{const next=new Set(prev);next.has(m)?next.delete(m):next.add(m);return next;});setSelected(null);};
  const filtered=CATALOG.filter(e=>activeModes.size===0||activeModes.has(e.mode));
  const STANDARD_ORDER=["true-or-false","multiple-choice","sequencing","categorisation","matching","myth-lab"];
  const standardEntries=filtered.filter(e=>e.category==="standard").sort((a,b)=>{const ai=STANDARD_ORDER.indexOf(a.id),bi=STANDARD_ORDER.indexOf(b.id);return(ai===-1?99:ai)-(bi===-1?99:bi);});
  const adaptiveEntries=filtered.filter(e=>e.category==="adaptive");
  const handleCardClick=entry=>{
    const isDesel=selected?.id===entry.id;
    setSelected(isDesel?null:entry);
    if(!isDesel){setTimeout(()=>{if(topRef.current){const top=topRef.current.getBoundingClientRect().top+window.scrollY-68;window.scrollTo({top,behavior:"smooth"});}},50);}
  };

  const SectionHeader=({label,count,subtitle})=>(
    <div style={{display:"flex",alignItems:"baseline",gap:"0.75rem",marginBottom:"1rem",paddingBottom:"0.625rem",borderBottom:`2px solid ${NAVY}`}}>
      <div style={{fontSize:18,fontWeight:300,color:NAVY,letterSpacing:"-.01em"}}>{label}</div>
      <div style={{fontSize:12,color:TT}}>{count} activit{count===1?"y":"ies"}</div>
      <div style={{fontSize:12,color:TT,marginLeft:"auto",fontStyle:"italic"}}>{subtitle}</div>
    </div>
  );

  return (
    <div>
      <div ref={topRef} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem",gap:"0.5rem",flexWrap:"wrap"}}>
        <span style={{fontSize:12,color:TT}}>{filtered.length} of {CATALOG.length} activities{activeModes.size>0&&<span style={{marginLeft:6,padding:"1px 8px",borderRadius:20,background:RED,color:"#fff",fontSize:11,fontWeight:600}}>{activeModes.size}</span>}</span>
        <div style={{display:"flex",gap:"0.5rem"}}>
          <button onClick={()=>setShowFilters(f=>!f)} style={{fontFamily:SANS,fontSize:12,fontWeight:500,padding:"0.35rem 0.875rem",borderRadius:50,cursor:"pointer",transition:"all 0.15s",background:showFilters||activeModes.size>0?NAVY:"#F8F9FB",color:showFilters||activeModes.size>0?"#fff":TS,border:"1px solid "+(showFilters||activeModes.size>0?NAVY:BORDER),display:"flex",alignItems:"center",gap:5}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Filter{activeModes.size>0?` (${activeModes.size})`:""}
          </button>
          <button onClick={()=>setShowTable(t=>!t)} style={{fontFamily:SANS,fontSize:12,fontWeight:500,padding:"0.35rem 0.875rem",borderRadius:50,cursor:"pointer",transition:"all 0.15s",background:showTable?NAVY:"#F8F9FB",color:showTable?"#fff":TS,border:"1px solid "+(showTable?NAVY:BORDER),display:"flex",alignItems:"center",gap:5}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/><rect x="7" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/><rect x="1" y="7" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/><rect x="7" y="7" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/></svg>
            Compare all
          </button>
        </div>
      </div>
      {showFilters&&<div style={{marginBottom:"1.25rem",padding:"0.875rem 1rem",background:"#fff",border:`1px solid ${BORDER}`,borderRadius:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.625rem"}}>
          <span style={{fontSize:11,fontWeight:600,color:TT}}>Filter by learning mode</span>
          {activeModes.size>0&&<button onClick={()=>setActiveModes(new Set())} style={{fontSize:11,color:RED,background:"none",border:"none",cursor:"pointer",fontFamily:SANS,fontWeight:600,padding:0}}>Clear all</button>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          {modes.map(m=>{const ms=MODE_STYLES[m]||{},active=activeModes.has(m),count=CATALOG.filter(e=>e.mode===m).length;return <button key={m} onClick={()=>toggleMode(m)} style={{fontFamily:SANS,fontSize:12,fontWeight:active?700:400,padding:"0.35rem 0.875rem",borderRadius:50,cursor:"pointer",transition:"all 0.15s",background:active?ms.bg:"transparent",color:active?ms.color:TT,border:"1px solid "+(active?ms.color:BORDER),display:"inline-flex",alignItems:"center",gap:5}}>{ms.label}<span style={{fontSize:10,opacity:0.65}}>{count}</span></button>;})}
        </div>
      </div>}
      {showTable&&<ComparisonTable/>}
      {selected&&<div ref={panelRef}><FeaturedPanel key={selected.id} entry={selected} onBuild={onBuild} onClose={()=>setSelected(null)}/></div>}

      {/* Standard section */}
      {standardEntries.length>0&&<div style={{marginBottom:"2.5rem"}}>
        <SectionHeader label="Standard" count={standardEntries.length} subtitle="Pre-baked · no runtime API · designed in the authoring studio"/>
        <div style={{display:"grid",gridTemplateColumns:cols,gap:"0.875rem"}}>
          {standardEntries.map(entry=><ActivityGridCard key={entry.id} entry={entry} selected={selected?.id===entry.id} dimmed={selected!==null&&selected.id!==entry.id} onClick={()=>handleCardClick(entry)}/>)}
        </div>
      </div>}

      {/* Adaptive section */}
      {adaptiveEntries.length>0&&<div>
        <SectionHeader label="Adaptive" count={adaptiveEntries.length} subtitle="Live AI · responds to each learner in real time"/>
        <div style={{display:"grid",gridTemplateColumns:cols,gap:"0.875rem"}}>
          {adaptiveEntries.map(entry=><ActivityGridCard key={entry.id} entry={entry} selected={selected?.id===entry.id} dimmed={selected!==null&&selected.id!==entry.id} onClick={()=>handleCardClick(entry)}/>)}
        </div>
      </div>}
    </div>
  );
}

function FilterBtn({option,selected,onSelect}) {
  const active=selected===option.id;
  return <button onClick={()=>onSelect(active?null:option.id)} style={{textAlign:"left",padding:"0.6rem 0.75rem",borderRadius:8,border:"1.5px solid "+(active?RED:BORDER),borderLeft:"4px solid "+(active?RED:"transparent"),background:active?RED_L:"#fff",cursor:"pointer",fontFamily:SANS,transition:"all 0.15s",display:"flex",alignItems:"center",gap:"0.6rem"}}>
    <div style={{width:16,height:16,borderRadius:"50%",flexShrink:0,border:"2px solid "+(active?RED:BORDER),background:active?RED:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{active&&<div style={{width:5,height:5,borderRadius:"50%",background:"#fff"}}/>}</div>
    <div><div style={{fontSize:13,fontWeight:active?600:500,color:active?RED:NAVY,lineHeight:1.3}}>{option.label}</div><div style={{fontSize:11,color:active?RED:TT,lineHeight:1.4,opacity:active?0.85:1}}>{option.sub}</div></div>
  </button>;
}

function MatchView({onBuild}) {
  const [sel,setSel]=useState({mode:null,structure:null,outputFormat:null,position:null,timeNeeded:null});
  const [expanded,setExpanded]=useState({mode:false,structure:false,outputFormat:false,position:false,timeNeeded:false});
  const [customIdea,setCustomIdea]=useState(""), [customResult,setCustomResult]=useState(null), [customLoading,setCustomLoading]=useState(false), [customError,setCustomError]=useState(null);
  const pick=(dim,val)=>{setSel(s=>({...s,[dim]:val}));const dims=DIMENSIONS.map(d=>d.id),idx=dims.indexOf(dim);setExpanded(e=>({...e,[dim]:false,...(idx<dims.length-1?{[dims[idx+1]]:true}:{})}));};
  const activeCount=Object.values(sel).filter(Boolean).length;
  const scored=CATALOG.map(entry=>{const {score,reasons}=scoreEntry(entry,sel);return{entry,score,reasons};}).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,5);
  const runCustom=async()=>{if(!customIdea.trim())return;setCustomLoading(true);setCustomError(null);setCustomResult(null);try{const raw=await analyseIdea(customIdea,CATALOG);setCustomResult(pj(raw));}catch(e){setCustomError(e.message);}setCustomLoading(false);};
  const matchedEntry=customResult?.match?CATALOG.find(e=>e.id===customResult.match):null;
  return (
    <div style={{display:"grid",gridTemplateColumns:"360px 1fr",gap:"2rem",alignItems:"start"}}>
      <div>
        {DIMENSIONS.map((dim,di)=>{
          const isOpen=expanded[dim.id],chosen=sel[dim.id],chosenOpt=dim.options.find(o=>o.id===chosen);
          return <div key={dim.id} style={{marginBottom:"1.25rem",paddingBottom:"1.25rem",borderBottom:"1px solid "+BORDER}}>
            <div onClick={()=>setExpanded(e=>({...e,[dim.id]:!e[dim.id]}))} style={{display:"flex",alignItems:"center",gap:"0.5rem",cursor:"pointer",marginBottom:isOpen?"0.75rem":0,userSelect:"none"}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:chosen?RED:BORDER,color:chosen?"#fff":TT,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:MONO}}>{di+1}</div>
              <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:chosen?NAVY:TT,fontFamily:MONO}}>{dim.label}</span>
              {chosen&&!isOpen&&<span style={{fontSize:12,color:RED,fontWeight:600,fontFamily:SANS,textTransform:"none",letterSpacing:0,marginLeft:4}}>→ {chosenOpt?.label}</span>}
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{marginLeft:"auto",transform:isOpen?"rotate(180deg)":"none",transition:"transform 0.2s",opacity:0.35}}><path d="M2 4l3.5 3.5L9 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/></svg>
            </div>
            {isOpen&&<><div style={{fontSize:13,color:TS,marginBottom:"0.625rem",lineHeight:1.5}}>{dim.question}</div><div style={{display:"flex",flexDirection:"column",gap:"0.3rem"}}>{dim.options.map(opt=><FilterBtn key={opt.id} option={opt} selected={sel[dim.id]} onSelect={v=>pick(dim.id,v)}/>)}</div></>}
          </div>;
        })}
        {activeCount>0&&<button onClick={()=>{setSel({mode:null,structure:null,outputFormat:null,position:null,timeNeeded:null});setExpanded({mode:false,structure:false,outputFormat:false,position:false,timeNeeded:false});}} style={{fontSize:11,color:RED,background:"none",border:"none",cursor:"pointer",fontFamily:MONO,textDecoration:"underline",fontWeight:600,marginBottom:"1rem"}}>Clear all</button>}
        <div style={{paddingTop:"0.5rem"}}>
          <div style={{fontSize:11,fontWeight:700,fontFamily:MONO,letterSpacing:"0.08em",textTransform:"uppercase",color:TT,marginBottom:"0.5rem"}}>Describe your idea</div>
          <p style={{fontSize:13,color:TS,lineHeight:1.65,marginBottom:"0.625rem"}}>The AI will match it to the catalog or propose a new type.</p>
          <textarea value={customIdea} onChange={e=>setCustomIdea(e.target.value)} placeholder="e.g. I want learners to practice giving feedback..." style={{width:"100%",border:"1.5px solid "+BORDER,borderRadius:10,padding:"0.7rem 0.875rem",fontFamily:SANS,fontSize:13,color:NAVY,background:"#fff",resize:"none",lineHeight:1.6,minHeight:80,boxSizing:"border-box"}} rows={3}/>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:"0.5rem"}}>
            <button onClick={runCustom} disabled={!customIdea.trim()||customLoading} style={{padding:"0.55rem 1.25rem",borderRadius:50,border:"none",background:RED,color:"#fff",cursor:!customIdea.trim()||customLoading?"default":"pointer",fontSize:13,fontWeight:700,fontFamily:SANS,opacity:!customIdea.trim()||customLoading?0.45:1}}>{customLoading?"Analysing…":"Analyse idea"}</button>
          </div>
          {customLoading&&<Dots label="Matching to catalog…"/>}
          {customError&&<div style={{fontSize:12,color:"#A32D2D",marginTop:"0.5rem"}}>{customError}</div>}
          {customResult&&<div style={{marginTop:"1rem"}}>
            <div style={{fontSize:10,fontWeight:600,fontFamily:MONO,letterSpacing:"0.08em",textTransform:"uppercase",color:matchedEntry?GRN:AMB,marginBottom:"0.4rem"}}>{matchedEntry?(customResult.matchStrength==="strong"?"Strong match":"Partial match"):"New activity type"}</div>
            <div style={{fontSize:12.5,color:TS,lineHeight:1.6,padding:"0.625rem 0.875rem",background:"#F8F9FB",borderRadius:8,borderLeft:"3px solid "+(matchedEntry?(customResult.matchStrength==="strong"?GRN:RED):AMB),marginBottom:"0.75rem"}}>{customResult.matchReason}</div>
          </div>}
        </div>
      </div>
      <div style={{position:"sticky",top:"1rem"}}>
        <div style={{fontSize:10,fontWeight:600,fontFamily:MONO,letterSpacing:"0.09em",textTransform:"uppercase",color:TT,marginBottom:"0.75rem"}}>Recommendations {activeCount>0&&"("+scored.length+" matched)"}</div>
        {activeCount===0&&!customResult&&<div style={{border:"1.5px dashed "+BORDER,borderRadius:12,padding:"3rem 1.5rem",textAlign:"center"}}><div style={{fontSize:32,marginBottom:"0.75rem",opacity:0.3}}>🧭</div><div style={{fontSize:13.5,color:TS,lineHeight:1.7,maxWidth:280,margin:"0 auto"}}>Answer the filters or describe your idea to get recommendations.</div></div>}
        {scored.map(({entry,score,reasons},i)=>{
          const rs=AI_ROLE_STYLES[entry.aiRole]||{},ms=MODE_STYLES[entry.mode]||{},ss=STRUCTURE_STYLES[entry.structure]||{},isTop=i===0;
          return <div key={entry.id} style={{border:"1.5px solid "+(isTop?RED:BORDER),borderLeft:"4px solid "+(ms.color||BORDER),borderRadius:12,padding:"0.875rem 1rem",marginBottom:"0.5rem",background:isTop?RED_L:"#fff",boxShadow:isTop?"0 2px 10px rgba(232,25,44,0.1)":"0 1px 4px rgba(26,43,74,0.06)",animation:"pl-in 0.3s ease both"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:"0.625rem"}}>
              <span style={{fontSize:18}}>{entry.icon}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:"0.375rem",flexWrap:"wrap"}}>
                  <span style={{fontSize:13.5,fontWeight:600,color:NAVY}}>{entry.name}</span>
                  {isTop&&<span style={{fontSize:9,fontWeight:700,padding:"1px 8px",borderRadius:20,background:RED,color:"#fff"}}>BEST MATCH</span>}
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:4,background:ms.bg,color:ms.color}}>{ms.label}</span>
                  <span style={{fontSize:10,fontWeight:500,padding:"2px 7px",borderRadius:4,background:ss.bg,color:ss.color}}>{ss.label}</span>
                  <span style={{fontSize:10,fontWeight:500,padding:"2px 7px",borderRadius:4,background:rs.bg,color:rs.color}}>{entry.aiRole}</span>
                  <span style={{fontSize:10,color:TT,padding:"2px 0"}}>{timeLabel(entry.timeNeeded)}</span>
                </div>
              </div>
            </div>
            {reasons.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem",marginBottom:"0.625rem"}}>{reasons.map((r,ri)=><span key={ri} style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:GRN_L,color:GRN,fontWeight:500}}>✓ {r}</span>)}</div>}
            <div style={{fontSize:12,color:TS,lineHeight:1.5,marginBottom:"0.75rem"}}>{(entry.goal||[])[0]}</div>
            <button onClick={()=>onBuild(entry)} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"0.45rem 1rem",borderRadius:50,border:"none",background:entry.tag==="Built"?RED:NAVY,color:"#fff",fontFamily:SANS,fontSize:12,fontWeight:700,cursor:"pointer"}}>{entry.tag==="Built"?"Adapt this →":"Generate this →"}</button>
          </div>;
        })}
        {customResult&&matchedEntry&&<div style={{border:"1.5px solid "+GRN,borderLeft:"4px solid "+((MODE_STYLES[matchedEntry.mode]||{}).color||GRN),borderRadius:12,padding:"0.875rem 1rem",background:GRN_L,marginTop:"0.5rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"0.5rem"}}><span style={{fontSize:18}}>{matchedEntry.icon}</span><span style={{fontSize:13.5,fontWeight:600,color:NAVY}}>{matchedEntry.name}</span></div>
          <div style={{fontSize:12,color:"#04342C",lineHeight:1.5,marginBottom:"0.75rem"}}>{(matchedEntry.goal||[])[0]}</div>
          <button onClick={()=>onBuild(matchedEntry)} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"0.45rem 1rem",borderRadius:50,border:"none",background:matchedEntry.tag==="Built"?RED:NAVY,color:"#fff",fontFamily:SANS,fontSize:12,fontWeight:700,cursor:"pointer"}}>{matchedEntry.tag==="Built"?"Adapt this →":"Generate this →"}</button>
        </div>}
      </div>
    </div>
  );
}

function BuildView({activity,onBack}) {
  const isBuilt=activity?.tag==="Built";
  const [idea,setIdea]=useState(""), [generatingObj,setGeneratingObj]=useState(false), [objError,setObjError]=useState(null);
  const [contract,setContract]=useState({topic:"",objectives:["","",""],outOfScope:""});
  const [output,setOutput]=useState(null), [generating,setGenerating]=useState(false), [error,setError]=useState(null), [copied,setCopied]=useState(false);
  const ready=contract.topic.trim().length>3&&contract.objectives.filter(o=>o.trim()).length>=2;
  const handleGenerateObj=async()=>{if(!idea.trim())return;setGeneratingObj(true);setObjError(null);try{const raw=await generateObjectives(idea,activity?.name||"learning activity");const p=pj(raw);if(p)setContract(c=>({...c,topic:p.topic||c.topic,objectives:p.objectives?.length?[...p.objectives,...Array(Math.max(0,3-p.objectives.length)).fill("")]:c.objectives}));}catch(e){setObjError(e.message);}setGeneratingObj(false);};
  const handleBuild=async()=>{setGenerating(true);setError(null);setOutput(null);try{if(isBuilt){const ol=contract.objectives.filter(o=>o.trim()).map(o=>'    "'+o+'",').join("\n");const sc=contract.outOfScope.split(",").map(s=>'"'+s.trim()+'"').filter(s=>s!=='""').join(", ");const cc='const CONTRACT = {\n  topic: "'+contract.topic+'",\n  objectives: [\n'+ol+'\n  ],\n  outOfScope: ['+sc+'],\n};';setOutput({type:"adapt",code:cc});}else{const code=await generateActivity(activity,contract);setOutput({type:"generate",code});}}catch(e){setError(e.message);}setGenerating(false);};
  const handleCopy=()=>{navigator.clipboard.writeText(output.code).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};
  if(!activity) return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"4rem 2rem",textAlign:"center"}}><div style={{fontSize:48,marginBottom:"1rem",opacity:0.25}}>🔨</div><div style={{fontSize:16,fontWeight:500,color:NAVY,marginBottom:"0.5rem"}}>No activity selected</div><div style={{fontSize:14,color:TS,lineHeight:1.65,maxWidth:360}}>Go to <strong>Explore</strong> or <strong>Match</strong>, find an activity, and click the build button.</div></div>;
  const rs=AI_ROLE_STYLES[activity.aiRole]||{};
  return (
    <div style={{maxWidth:680,margin:"0 auto"}}>
      <button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:5,background:"none",border:"none",cursor:"pointer",color:TT,fontSize:13,fontFamily:SANS,marginBottom:"1.25rem",padding:0}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>Back to Explore</button>
      <div style={{background:"#fff",border:"1px solid "+BORDER,borderRadius:12,padding:"1.25rem",marginBottom:"1.5rem",boxShadow:"0 1px 4px rgba(26,43,74,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"0.75rem",flexWrap:"wrap"}}><span style={{fontSize:24}}>{activity.icon}</span><span style={{fontSize:17,fontWeight:600,color:NAVY}}>{activity.name}</span><span style={{fontSize:9,fontWeight:700,padding:"1px 7px",borderRadius:20,background:activity.tagColor+"22",color:activity.tagColor,letterSpacing:"0.06em"}}>{activity.tag}</span><span style={{fontSize:10,padding:"2px 8px",borderRadius:4,fontWeight:500,background:rs.bg,color:rs.color}}>{activity.aiRole}</span></div>
        <p style={{fontSize:13,color:TS,lineHeight:1.65,marginBottom:"0.75rem"}}>{activity.description}</p>
        <div style={{fontSize:12,color:TT,padding:"0.625rem 0.875rem",background:isBuilt?GRN_L:AMB_L,borderRadius:7,border:"1px solid "+(isBuilt?"#9FE1CB":"#FAC775")}}>{isBuilt?<><strong style={{color:GRN}}>Adapt mode:</strong> <span style={{color:"#04342C"}}>Fill in your curriculum contract below to get a configured contract block for <code style={{fontFamily:MONO,fontSize:11}}>{activity.refFile||activity.id+".jsx"}</code>.</span></>:<><strong style={{color:AMB}}>Generate mode:</strong> <span style={{color:"#412402"}}>The AI will generate a complete, ready-to-test JSX file based on the catalog spec for this activity type.</span></>}</div>
      </div>
      <div style={{background:"#fff",border:"1px solid "+BORDER,borderRadius:12,padding:"1.25rem",marginBottom:"1rem",boxShadow:"0 1px 4px rgba(26,43,74,0.06)"}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:TT,marginBottom:"1.25rem",fontFamily:MONO}}>Curriculum Contract</div>
        <div style={{marginBottom:"1.25rem",padding:"1rem",background:"#F8F9FB",border:"1px solid "+BORDER,borderRadius:8}}>
          <label style={{fontSize:11,fontWeight:600,color:TT,display:"block",marginBottom:"0.35rem",textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:MONO}}>Describe your idea <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>— we'll generate objectives</span></label>
          <textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="e.g. I want learners to understand how to give feedback that changes behaviour without damaging the relationship" style={{width:"100%",border:"1.5px solid "+BORDER,borderRadius:8,padding:"0.65rem 0.9rem",fontFamily:SANS,fontSize:13,color:NAVY,background:"#fff",resize:"none",lineHeight:1.6,minHeight:72,outline:"none",boxSizing:"border-box"}} rows={3}/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"0.625rem"}}>
            {objError?<span style={{fontSize:12,color:"#A32D2D"}}>{objError}</span>:<span style={{fontSize:12,color:TT}}>Topic and objectives will be filled in below.</span>}
            <button onClick={handleGenerateObj} disabled={!idea.trim()||generatingObj} style={{flexShrink:0,display:"inline-flex",alignItems:"center",gap:5,padding:"0.45rem 1rem",borderRadius:50,border:"none",background:NAVY,color:"#fff",fontFamily:SANS,fontSize:12,fontWeight:700,cursor:!idea.trim()||generatingObj?"default":"pointer",opacity:!idea.trim()||generatingObj?0.45:1,marginLeft:12}}>{generatingObj?"Generating…":"Generate objectives →"}</button>
          </div>
        </div>
        <div style={{marginBottom:"1rem"}}><label style={{fontSize:11,fontWeight:600,color:TT,display:"block",marginBottom:"0.35rem",textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:MONO}}>Topic *</label><input value={contract.topic} onChange={e=>setContract(c=>({...c,topic:e.target.value}))} placeholder="e.g. Giving effective feedback in the workplace" style={{width:"100%",border:"1.5px solid "+BORDER,borderRadius:8,padding:"0.65rem 0.9rem",fontFamily:SANS,fontSize:14,color:NAVY,background:"#fff",outline:"none",lineHeight:1.5,boxSizing:"border-box"}}/></div>
        <div style={{marginBottom:"1rem"}}><label style={{fontSize:11,fontWeight:600,color:TT,display:"block",marginBottom:"0.35rem",textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:MONO}}>Learning Objectives * (min 2)</label>{contract.objectives.map((obj,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:"0.4rem"}}><span style={{fontSize:11,fontWeight:700,color:RED,fontFamily:MONO,width:16,flexShrink:0}}>{i+1}.</span><input value={obj} onChange={e=>{const o=[...contract.objectives];o[i]=e.target.value;setContract(c=>({...c,objectives:o}));}} placeholder={"Objective "+(i+1)} style={{flex:1,border:"1.5px solid "+BORDER,borderRadius:8,padding:"0.55rem 0.75rem",fontFamily:SANS,fontSize:13,color:NAVY,background:"#fff",outline:"none",lineHeight:1.5,boxSizing:"border-box"}}/></div>)}</div>
        <div style={{marginBottom:"1.25rem"}}><label style={{fontSize:11,fontWeight:600,color:TT,display:"block",marginBottom:"0.35rem",textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:MONO}}>Out of scope <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>(comma-separated)</span></label><input value={contract.outOfScope} onChange={e=>setContract(c=>({...c,outOfScope:e.target.value}))} placeholder="e.g. HR procedures, salary discussions" style={{width:"100%",border:"1.5px solid "+BORDER,borderRadius:8,padding:"0.65rem 0.9rem",fontFamily:SANS,fontSize:13,color:NAVY,background:"#fff",outline:"none",lineHeight:1.5,boxSizing:"border-box"}}/></div>
        <div style={{display:"flex",justifyContent:"flex-end"}}><button onClick={handleBuild} disabled={!ready||generating} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"0.65rem 1.5rem",borderRadius:50,border:"none",background:isBuilt?RED:NAVY,color:"#fff",fontFamily:SANS,fontSize:14,fontWeight:700,cursor:!ready||generating?"default":"pointer",opacity:!ready||generating?0.45:1}}>{generating?"Building…":isBuilt?"Generate contract →":"Generate activity →"}</button></div>
        {generating&&<div style={{marginTop:"1rem"}}><Dots label={isBuilt?"Configuring contract…":"Generating activity file — this takes about 30 seconds…"}/></div>}
        {error&&<div style={{marginTop:"0.75rem",background:"#FCEBEB",border:"1px solid #F09595",borderRadius:8,padding:"0.875rem",fontSize:13,color:"#501313"}}>{error}</div>}
      </div>
      {output&&<div style={{background:"#fff",border:"1.5px solid "+GRN,borderRadius:12,padding:"1.25rem",boxShadow:"0 2px 10px rgba(15,110,86,0.08)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.875rem"}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:GRN,fontFamily:MONO}}>{output.type==="adapt"?"Your configured contract":"Generated activity file"}</div>
          <button onClick={handleCopy} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"0.4rem 0.875rem",borderRadius:50,border:"1.5px solid "+(copied?GRN:BORDER),background:copied?GRN_L:"#F8F9FB",color:copied?GRN:TS,fontFamily:SANS,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>{copied?"✓ Copied!":"Copy code"}</button>
        </div>
        <pre style={{fontSize:11.5,fontFamily:MONO,color:NAVY,background:"#F8F9FB",border:"1px solid "+BORDER,borderRadius:8,padding:"1rem",overflowX:"auto",lineHeight:1.6,maxHeight:400,overflowY:"auto",margin:0}}>{output.code}</pre>
        <div style={{marginTop:"0.875rem",fontSize:12.5,color:TS,lineHeight:1.65,padding:"0.75rem 1rem",background:GRN_L,borderRadius:8}}>{output.type==="adapt"?<>Open <code style={{fontFamily:MONO,fontSize:11}}>{activity.refFile||activity.id+".jsx"}</code> and replace the CONTRACT block at the top with the code above. Then run it as an artifact to test.</>:"Paste this code into a new Claude.ai chat. Claude will render it as a live, runnable artifact."}</div>
      </div>}
    </div>
  );
}

export default function PlatformPage() {
  const [activeTab,setActiveTab]=useState("explore");
  const [buildActivity,setBuildActivity]=useState(null);
  const handleBuild=entry=>{setBuildActivity(entry);setActiveTab("build");};
  const tabs=[{id:"explore",label:"Explore"},{id:"match",label:"Match"},{id:"build",label:"Build"}];
  useEffect(()=>{
    if(document.getElementById('inter-font'))return;
    const l=document.createElement('link');l.id='inter-font';l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700&display=swap';
    document.head.appendChild(l);
  },[]);
  return (
    <div style={{fontFamily:"'Inter',system-ui,-apple-system,sans-serif",minHeight:"100vh",background:"#F4F6F7",color:NAVY}}>
      <style>{`@keyframes pl-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}@keyframes pl-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;margin:0;padding:0}input:focus,textarea:focus{border-color:#E8192C!important;outline:none}button:active{transform:scale(0.98)}`}</style>
      <div style={{background:"#fff",borderBottom:"1px solid #E8ECEE",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 1.5rem",display:"flex",alignItems:"center",height:56,position:"relative"}}>
          <div style={{fontSize:27,fontWeight:700,color:NAVY,letterSpacing:"-0.02em",flexShrink:0}}>bdc<span style={{color:RED}}>*</span></div>
          <div style={{display:"flex",gap:0,position:"absolute",left:"50%",transform:"translateX(-50%)"}}>
            {tabs.map(tab=><button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"0 1.25rem",height:56,background:"none",border:"none",borderBottom:"2px solid "+(activeTab===tab.id?RED:"transparent"),color:activeTab===tab.id?NAVY:"#4A6070",fontSize:13,fontWeight:activeTab===tab.id?600:400,cursor:"pointer",fontFamily:"'Inter',system-ui,-apple-system,sans-serif",transition:"all 0.2s"}}>
              {tab.label}
              {tab.id==="build"&&buildActivity&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:RED,color:"#fff",fontWeight:700}}>{buildActivity.icon}</span>}
            </button>)}
          </div>
          <div style={{marginLeft:"auto"}}></div>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"2rem 1.5rem"}}>
        {activeTab==="explore"&&<div style={{marginBottom:"1.5rem"}}><div style={{fontSize:10,fontWeight:700,fontFamily:MONO,letterSpacing:"0.12em",textTransform:"uppercase",color:RED,marginBottom:"0.35rem"}}>Explore</div><h1 style={{fontSize:24,fontWeight:400,color:NAVY,marginBottom:"0.35rem"}}>Browse the activity catalog</h1><p style={{fontSize:14,color:TS,lineHeight:1.65}}>Standard activities are pre-baked and need no runtime API. Adaptive activities use live AI to respond to each learner in real time.</p></div>}
        {activeTab==="match"&&<div style={{marginBottom:"1.5rem"}}><div style={{fontSize:10,fontWeight:700,fontFamily:MONO,letterSpacing:"0.12em",textTransform:"uppercase",color:RED,marginBottom:"0.35rem"}}>Match</div><h1 style={{fontSize:24,fontWeight:400,color:NAVY,marginBottom:"0.35rem"}}>Find the right activity type</h1><p style={{fontSize:14,color:TS,lineHeight:1.65}}>Answer the filters or describe your idea. The AI will recommend the best match.</p></div>}
        {activeTab==="build"&&<div style={{marginBottom:"1.5rem"}}><div style={{fontSize:10,fontWeight:700,fontFamily:MONO,letterSpacing:"0.12em",textTransform:"uppercase",color:RED,marginBottom:"0.35rem"}}>Build</div><h1 style={{fontSize:24,fontWeight:400,color:NAVY,marginBottom:"0.35rem"}}>{buildActivity?(buildActivity.tag==="Built"?"Adapt: ":"Generate: ")+buildActivity.name:"Configure your activity"}</h1><p style={{fontSize:14,color:TS,lineHeight:1.65}}>{buildActivity?(buildActivity.tag==="Built"?"Enter your curriculum contract to get a configured version of this activity.":"The AI will generate a complete ready-to-test JSX file."):"Select an activity from Explore or Match to begin."}</p></div>}
        {activeTab==="explore"&&<ExploreView onBuild={handleBuild}/>}
        {activeTab==="match"&&<MatchView onBuild={handleBuild}/>}
        {activeTab==="build"&&<BuildView activity={buildActivity} onBack={()=>setActiveTab("explore")}/>}
      </div>
    </div>
  );
}
