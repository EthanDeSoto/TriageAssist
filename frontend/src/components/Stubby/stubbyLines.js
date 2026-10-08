export const STUBBY_LINES = {
  idle: [
    "Have you tried turning it off and on again? Not me. Please don't.",
    "I've seen things. Printers. Terrible printers.",
    "Queue's quiet. Suspiciously quiet.",
    "Somewhere out there, a cable is loose. I can feel it.",
  ],
  bored: [
    "Breaking news: printer still jammed. More at 11.",
    "Nothing in the queue. This is either peace or the calm before it.",
    "I read the whole paper. Twice. It's a short paper.",
  ],
  typing: [
    "Ooh, a juicy one.",
    "Reading over your shoulder. Professionally.",
    "Keep going, I'm invested now.",
  ],
  caught: [
    "Got it. Nice throw.",
    "A screenshot! Worth a thousand vague descriptions.",
  ],
  loading: [
    "Consulting the cloud. The cloud is thinking. The cloud is… still thinking.",
    "Thinking hard. Or buffering. Hard to tell from in here.",
    "Any second now. Probably.",
  ],
  coldStart: [
    "Server's asleep. Honestly? Relatable.",
    "Free tier. We wait. We respect the nap.",
  ],
  successLow: [
    "Low priority. I'll allow it.",
    "Low. Nobody's on fire. Lovely.",
  ],
  successMedium: [
    "Medium. The most honest priority there is.",
    "Solid ticket. Workable. Thumbs up from me.",
  ],
  successHigh: [
    "High priority. Sleeves are up. I have sleeves now.",
    "Someone's blocked. Let's unblock them.",
  ],
  successCritical: [
    "CRITICAL. Staying calm. This is my calm face.",
    "Critical. Grabbing the extinguisher. Purely symbolic. Mostly.",
  ],
  error: [
    "It's not DNS. …It's never DNS. …Is it DNS?",
    "That didn't work. Not your fault. Probably not mine either.",
    "Something fell over. Give it another go.",
  ],
  access: [
    "Password reset number four today. Is it a Monday?",
    "Another lockout. The badge reader and I are both tired.",
  ],
  clicked: [
    "I'm a ticket stub. My whole life is waiting in a queue.",
    "Careful, I'm load-bearing.",
    "You clicked me. That's the most attention I've had all sprint.",
    "I don't do escalations. I do moral support.",
  ],
  leaving: [
    "Fine. I'll be in the break room.",
    "Say the word and I'm back. I'm always around.",
  ],
};

export function pickLine(group, lastLine) {
  const lines = STUBBY_LINES[group];
  if (!lines || lines.length === 0) {
    return null;
  }
  const options = lines.filter((line) => line !== lastLine);
  const pool = options.length > 0 ? options : lines;
  return pool[Math.floor(Math.random() * pool.length)];
}
