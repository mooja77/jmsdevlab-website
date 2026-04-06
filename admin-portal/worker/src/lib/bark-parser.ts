/**
 * Bark email parsing utilities — shared between routes and cron.
 */

/** Decode partially masked email domain: y***o.com → yahoo.com */
export function decodeDomain(masked: string): string {
  const map: Record<string, string> = {
    'g***l.com': 'gmail.com',
    'y***o.com': 'yahoo.com',
    'h*****l.com': 'hotmail.com',
    'o*****k.com': 'outlook.com',
    'i****d.com': 'icloud.com',
    'l**e.com': 'live.com',
    'p********l.com': 'protonmail.com',
    'a*l.com': 'aol.com',
  };
  for (const [pattern, domain] of Object.entries(map)) {
    if (masked.length === domain.length) {
      let match = true;
      for (let i = 0; i < masked.length; i++) {
        if (masked[i] !== '*' && masked[i] !== domain[i]) { match = false; break; }
      }
      if (match) return domain;
    }
  }
  return masked;
}

/** Parse partial email like k**********8@y***o.com */
export function decodePartialEmail(partial: string): {
  firstChar: string; charCount: number; lastChar: string; domain: string; raw: string;
} | null {
  if (!partial || !partial.includes('@')) return null;
  const [local, domainRaw] = partial.split('@');
  if (!local || !domainRaw) return null;
  return {
    firstChar: local[0],
    charCount: local.length,
    lastChar: local[local.length - 1],
    domain: decodeDomain(domainRaw),
    raw: partial,
  };
}

/** Parse partial phone like 086******* */
export function decodePartialPhone(partial: string): { prefix: string; totalDigits: number; raw: string } | null {
  if (!partial) return null;
  const cleaned = partial.replace(/[\s\-]/g, '');
  const digits = cleaned.match(/^(\d{3})/);
  if (!digits) return null;
  return {
    prefix: digits[1],
    totalDigits: cleaned.replace(/\*/g, '0').length,
    raw: partial,
  };
}

/** Parse a Bark notification email body into structured data */
export function parseBarkEmail(body: string, subject: string): {
  firstName: string;
  category: string;
  location: string;
  partialPhone: string;
  partialEmail: string;
  projectDetails: Record<string, string>;
  quote: string | null;
} {
  const result = {
    firstName: '',
    category: '',
    location: '',
    partialPhone: '',
    partialEmail: '',
    projectDetails: {} as Record<string, string>,
    quote: null as string | null,
  };

  // Name + category: "🔔 Cleo is looking for a Web Designer"
  const nameMatch = body.match(/🔔\s*(\w+)\s+is looking for a\s+(.+?)[\n📍]/s)
    || subject.match(/(?:Verified|details|urgently).*?:\s*(\w+)\s+(?:is looking for|urgently needs)\s+a\s+(.+)/i)
    || subject.match(/(\w+)\s+urgently needs a\s+(.+)/i);
  if (nameMatch) {
    result.firstName = nameMatch[1].trim();
    result.category = nameMatch[2].trim();
  }

  // Location: "📍Dublin" or "📍Arklow: Happy to receive..."
  const locMatch = body.match(/📍([^:\n]+?)(?::\s*(?:Happy|Needs)|[\n]|\s+\d+\s+credits)/);
  if (locMatch) {
    result.location = locMatch[1].trim();
  }

  // Partial phone: "086*******" or "085 *** ****" or "087 *** ****"
  const phoneMatch = body.match(/(0\d{2}[\s*]+[\d*\s]+)/);
  if (phoneMatch) {
    result.partialPhone = phoneMatch[1].trim();
  }

  // Partial email: "c*********l@g***l.com" or "s**********s@g***l.com"
  const emailMatch = body.match(/([a-zA-Z]\*+[a-zA-Z0-9]@[a-zA-Z*]+\.[a-zA-Z.]+)/);
  if (emailMatch) {
    result.partialEmail = emailMatch[1].trim();
  }

  // Quoted text
  const quoteMatch = body.match(/"([^"]{10,})"/);
  if (quoteMatch) {
    result.quote = quoteMatch[1].trim();
  }

  // Project details: Q&A pairs
  const detailsSection = body.split('Project Details')[1];
  if (detailsSection) {
    // Match question → answer, stopping at the next question or "Contact"
    const qaPattern = /(?:Which|What|How|Do you|Is this)[^?]+\?\s*(.+?)(?=\s*(?:Which|What|How|Do you|Is this|Contact\s|$))/gi;
    let match;
    while ((match = qaPattern.exec(detailsSection)) !== null) {
      const question = match[0].split('?')[0].trim() + '?';
      const answer = match[1].trim();
      if (answer && !answer.startsWith('Contact') && !answer.startsWith('You\'ll')) {
        const key = question
          .replace(/Which of these best describes your\s*/i, '')
          .replace(/What type of business is this for\?/i, 'Business type')
          .replace(/What type of project is this\?/i, 'Project type')
          .replace(/What are the objectives.*\?/i, 'Objectives')
          .replace(/What is your estimated budget.*\?/i, 'Budget')
          .replace(/What is your budget.*\?/i, 'Budget')
          .replace(/How soon would you like.*\?/i, 'Timeline')
          .replace(/How likely are you to make a hiring decision\?/i, 'Hiring intent')
          .replace(/What sort of development work.*\?/i, 'Dev work')
          .replace(/What platform.*\?/i, 'Platform')
          .replace(/Which platform.*\?/i, 'Platform')
          .replace(/Which programming language.*\?/i, 'Language')
          .replace(/Do you have a budget.*\?/i, 'Has budget')
          .replace(/How do you plan on monetising.*\?/i, 'Monetisation')
          .replace(/\?$/, '');
        result.projectDetails[key || question] = answer;
      }
    }
  }

  return result;
}

/** Score a lead's business priority (0-100) */
export function scorePriority(lead: {
  budget?: string | null;
  hiring_intent?: string | null;
  timeline?: string | null;
  bark_category?: string | null;
  email_domain?: string | null;
}): { score: number; label: 'hot' | 'warm' | 'cold' } {
  let score = 0;

  // Budget
  const b = (lead.budget || '').toLowerCase();
  if (b.includes('20,000') || b.includes('20000')) score += 40;
  else if (b.includes('2000') || b.includes('1000-2000') || b.includes('1,000')) score += 30;
  else if (b.includes('500-1000') || b.includes('500')) score += 15;

  // Hiring intent
  const h = (lead.hiring_intent || '').toLowerCase();
  if (h.includes('ready to hire') || h.includes('definitely')) score += 25;
  else if (h.includes('likely')) score += 15;

  // Timeline
  const t = (lead.timeline || '').toLowerCase();
  if (t.includes('asap')) score += 20;
  else if (t.includes('next few weeks') || t.includes('next week')) score += 10;

  // Category match
  const cat = (lead.bark_category || '').toLowerCase();
  if (cat.includes('web designer') || cat.includes('web developer') || cat.includes('mobile') || cat.includes('software')) score += 15;

  // Custom domain (not gmail/yahoo = real business)
  const common = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com'];
  if (lead.email_domain && !common.includes(lead.email_domain)) score += 10;

  const label = score >= 60 ? 'hot' : score >= 30 ? 'warm' : 'cold';
  return { score, label };
}

export const COMMON_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com', 'protonmail.com', 'aol.com'];
