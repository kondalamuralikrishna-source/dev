import { L2CoachScenario } from "../types";

export const L2_SPEAKING_COACH_SCENARIOS: L2CoachScenario[] = [
  {
    id: "scenario_retail_return",
    title: "Negotiating an Exception Return at a Retail Store",
    category: "Retail & Consumer",
    level: "B1",
    icon: "ShoppingBag",
    userRole: "Customer returning premium wireless headphones purchased 18 days ago with opened packaging and an electronic digital receipt only.",
    interlocutorName: "Alex",
    interlocutorRole: "Senior Customer Service Associate at Apex Goods",
    interlocutorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    difficulty: "standard",
    contextDescription:
      "Apex Goods has a strict 14-day policy for electronics refunds. You bought headphones 18 days ago, discovered audio crackling, but misplaced the physical paper slip. You have a digital order ID and need a replacement, store credit, or refund.",
    communicativeObjectives: [
      "State the return reason and audio defect clearly without reading any script",
      "Politely address the 14-day window and explain why you're visiting today",
      "Negotiate an acceptable compromise (e.g. store credit, warranty exchange, or digital lookup)",
      "Maintain a polite, diplomatic register with appropriate hedging and courteous closing"
    ],
    pragmaticFocus:
      "Polite mitigation and hedging (e.g., 'I was wondering if...', 'Could we perhaps look up...', 'Would it be possible to...') rather than demands.",
    initialInterlocutorUtterance:
      "Hi there, welcome to Apex Customer Care. How can I assist you today?",
    suggestedOpeningIntent:
      "Greet the associate, explain what you would like to return, and mention the audio issue."
  },
  {
    id: "scenario_project_pushback",
    title: "Pushing Back on an Unrealistic Engineering Deadline",
    category: "Workplace & Engineering",
    level: "B2",
    icon: "Briefcase",
    userRole: "Lead Software Engineer responding to a sudden 3-week deadline cut by the Product Manager.",
    interlocutorName: "Marcus Vance",
    interlocutorRole: "Director of Product Management",
    interlocutorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    difficulty: "firm",
    contextDescription:
      "Executive leadership wants the microservices migration launched by the end of the month instead of Q3. You need to defend architectural integrity and technical debt risks while offering constructive scope trade-offs.",
    communicativeObjectives: [
      "Express understanding of business urgency while clearly flagging technical risks",
      "Articulate specific trade-offs (e.g. cutting secondary features vs. delaying launch)",
      "Use diplomatic disagreement markers rather than blunt rejection",
      "Propose an phased rollout compromise that protects system reliability"
    ],
    pragmaticFocus:
      "Diplomatic disagreement and corporate assertiveness (e.g., 'While I recognize the market window...', 'From an architectural reliability standpoint...', 'What we could commit to is...').",
    initialInterlocutorUtterance:
      "Thanks for jumping in. Leadership just moved our release up to the 28th. We need the full API redesign shipped by then. Can we count on your team?",
    suggestedOpeningIntent:
      "Acknowledge the target timeline, but clearly and diplomatically explain the severe technical risks and propose scoping alternatives."
  },
  {
    id: "scenario_salary_negotiation",
    title: "Executive Compensation & Offer Negotiation",
    category: "Negotiation & Leases",
    level: "C1",
    icon: "TrendingUp",
    userRole: "Senior Candidate negotiating a compensation package with an in-house Talent Partner.",
    interlocutorName: "Elena Rostova",
    interlocutorRole: "VP of Global Talent Acquisition",
    interlocutorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    difficulty: "firm",
    contextDescription:
      "You have received an initial offer of $145,000 base + 10% bonus. Market research indicates $165,000 for your specialized domain expertise. You want to negotiate higher base salary, sign-on bonus, or accelerated equity vesting.",
    communicativeObjectives: [
      "Reiterate high enthusiasm for the team and strategic vision",
      "Anchor your value proposition using market benchmarks and proven impact",
      "Counter with a specific target range while keeping the tone collaborative",
      "Inquire into flexible levers (sign-on bonus, performance review cycle, equity)"
    ],
    pragmaticFocus:
      "Collaborative assertiveness and executive presence (e.g., 'Given the scope of revenue ownership...', 'Based on current market data for this tier...', 'Is there latitude to bridge this gap via...').",
    initialInterlocutorUtterance:
      "We're thrilled to extend this offer of $145k. The team was unanimous in wanting you on board. How are you feeling about the numbers?",
    suggestedOpeningIntent:
      "Express gratitude and genuine excitement for the role, then pivot tactfully into your compensation expectations based on your specialized domain value."
  },
  {
    id: "scenario_lease_dispute",
    title: "Resolving an Unjust Property Maintenance Charge",
    category: "Negotiation & Leases",
    level: "B2",
    icon: "Home",
    userRole: "Apartment Tenant disputing an unexpected $350 emergency plumbing fee billed after normal hours.",
    interlocutorName: "David Miller",
    interlocutorRole: "Senior Property Operations Manager",
    interlocutorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    difficulty: "standard",
    contextDescription:
      "Your kitchen pipe leaked on Sunday morning due to pre-existing corroded fittings. The management portal added a $350 'Emergency After-Hours Tenant Negligence' fee. Your lease specifies pre-existing infrastructure wear is landlord responsibility.",
    communicativeObjectives: [
      "Calmly outline the sequence of events and pipe condition",
      "Reference lease terms regarding standard wear and tear vs. tenant fault",
      "Politely request immediate fee waiver and ledger credit",
      "Maintain a firm, professional demeanor without emotional escalation"
    ],
    pragmaticFocus:
      "Evidence-based grievance resolution, polite assertiveness, and de-escalation.",
    initialInterlocutorUtterance:
      "Hello, Greenwood Leasing Office. David speaking. What can I do for you today?",
    suggestedOpeningIntent:
      "State your unit number, mention the $350 fee on your monthly statement, and explain that the leak was caused by pre-existing corrosion."
  },
  {
    id: "scenario_missed_flight",
    title: "Emergency International Flight Rebooking & Accommodation",
    category: "Travel & Transit",
    level: "B1",
    icon: "Plane",
    userRole: "International Passenger stranded at London Heathrow due to a delayed connection, facing an overnight layover.",
    interlocutorName: "Clara Bennett",
    interlocutorRole: "Senior Airport Duty Manager",
    interlocutorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    difficulty: "high_friction",
    contextDescription:
      "Your first flight landed 45 minutes late, causing you to miss the last daily flight to New York. The agent initially claims the delay was due to 'air traffic control congestion' and claims they cannot issue hotel vouchers.",
    communicativeObjectives: [
      "Clearly explain your itinerary, missed connecting flight, and luggage status",
      "Inquire into the earliest rebooking options for tomorrow morning",
      "Politely press for hotel accommodation and meal vouchers under passenger rights",
      "Confirm baggage transfer procedures clearly"
    ],
    pragmaticFocus:
      "Assertive consumer advocacy, polite persistence under fatigue, and clarifying critical operational logistics.",
    initialInterlocutorUtterance:
      "Next in line please. Yes, sir/ma'am, I understand there are delays across the board tonight. What's your booking reference?",
    suggestedOpeningIntent:
      "State your destination, missed connection, and urgent need for both the next available seat and overnight hotel accommodations."
  },
  {
    id: "scenario_medical_consultation",
    title: "Describing Nuanced Symptoms & Treatment Concerns",
    category: "Emergency & Healthcare",
    level: "B2",
    icon: "Stethoscope",
    userRole: "Patient experiencing recurring migraines and dizziness after starting a new prescription.",
    interlocutorName: "Dr. Sanjay Patel",
    interlocutorRole: "Attending Physician, Internal Medicine",
    interlocutorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    difficulty: "friendly",
    contextDescription:
      "You started blood pressure medication two weeks ago. Over the past 4 days, you've experienced episodic dizziness when standing and mild nausea. You want to know if this is a temporary adjustment phase or if you need a dosage alteration.",
    communicativeObjectives: [
      "Describe onset, frequency, duration, and triggers of symptoms with descriptive clarity",
      "Ask targeted questions regarding medication side effects vs. allergic reactions",
      "Clarify dosage adjustments, hydration guidelines, and warning signs requiring ER visits",
      "Summarize the doctor's instructions back to ensure mutual understanding"
    ],
    pragmaticFocus:
      "Precise descriptive medical terminology, symptom chronology, and active confirmation checking (e.g., 'Just to confirm, should I take this with meals?').",
    initialInterlocutorUtterance:
      "Good morning. I see we're following up on the medication we started two weeks ago. How have you been feeling since then?",
    suggestedOpeningIntent:
      "Describe how you've felt over the past few days, focusing on the dizziness upon standing and when it started occurring."
  },
  {
    id: "scenario_client_escalation",
    title: "De-escalating a Furious Enterprise Client After an Outage",
    category: "Executive & Leadership",
    level: "C1",
    icon: "ShieldAlert",
    userRole: "Head of Customer Success addressing an Enterprise Client after a 90-minute payment gateway downtime.",
    interlocutorName: "Arthur King",
    interlocutorRole: "Chief Commercial Officer, MegaMart Global",
    interlocutorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    difficulty: "high_friction",
    contextDescription:
      "MegaMart lost an estimated $180k in transactions during a peak Friday flash sale due to an unannounced cloud infrastructure failover. The client is threatening contract termination and demanding executive accountability.",
    communicativeObjectives: [
      "Offer an empathetic, non-defensive apology that takes immediate ownership",
      "Provide a transparent, jargon-free summary of the root cause and immediate safeguard patches",
      "Present concrete SLA credits and a post-mortem review timeline",
      "Rebuild long-term strategic confidence with decisive remediation steps"
    ],
    pragmaticFocus:
      "Crisis de-escalation, empathy without liability concessions, and structured remediation commitments.",
    initialInterlocutorUtterance:
      "I hope you realize what happened today. We lost nearly $200k in transaction volume because your systems went black during our primary campaign. Why should we not trigger our termination clause right now?",
    suggestedOpeningIntent:
      "Take immediate ownership of the disruption, validate the severity of their revenue impact, and present the immediate preventative actions already deployed."
  }
];

export const L2_COACH_CATEGORIES = [
  "All Scenarios",
  "Retail & Consumer",
  "Workplace & Engineering",
  "Negotiation & Leases",
  "Travel & Transit",
  "Emergency & Healthcare",
  "Executive & Leadership"
] as const;
