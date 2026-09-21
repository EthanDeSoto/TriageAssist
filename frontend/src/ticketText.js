import { ASSIGNED_GROUPS, CATEGORIES, PRIORITIES, labelFor } from "./ticketOptions";

export function formatTicketAsText(ticket) {
  const lines = [
    `Summary: ${ticket.summary}`,
    `Category: ${labelFor(CATEGORIES, ticket.category)}`,
    `Priority: ${labelFor(PRIORITIES, ticket.priority)}`,
    `Assigned group: ${labelFor(ASSIGNED_GROUPS, ticket.assigned_group)}`,
    `Confidence: ${ticket.confidence}`,
  ];

  if (ticket.likely_cause) {
    lines.push("", `Likely cause: ${ticket.likely_cause}`);
  }

  lines.push("", "Next steps:");
  ticket.next_steps.forEach((step, index) => {
    lines.push(`${index + 1}. ${step}`);
  });

  if (ticket.questions_for_user.length > 0) {
    lines.push("", "Questions for the user:");
    ticket.questions_for_user.forEach((question) => {
      lines.push(`- ${question}`);
    });
  }

  return lines.join("\n");
}

export function formatTicketAsJson(ticket) {
  return JSON.stringify(ticket, null, 2);
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
