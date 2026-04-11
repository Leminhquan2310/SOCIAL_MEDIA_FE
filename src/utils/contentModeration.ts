export interface ContentModerationResult {
  matches: string[];
}

const forbiddenKeywords = [
  "sex",
  "porn",
  "xxx",
  "hentai",
  "viagra",
  "đồi trụy",
  "bao cao su",
];

const forbiddenPatternRules: Array<{ name: string; pattern: RegExp }> = [
  { name: "sex", pattern: /\bsex\b/i },
  { name: "porn", pattern: /\bporn\b/i },
  { name: "hentai", pattern: /\bhentai\b/i },
  { name: "viagra", pattern: /\bviagra\b/i },
  { name: "đồi trụy", pattern: /\bđồi trụy\b/i },
  { name: "bao cao su", pattern: /\bbao cao su\b/i },
];

const stripHtml = (text: string): string => {
  if (!text) {
    return "";
  }

  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const validateContent = (text: string): ContentModerationResult => {
  const plainText = stripHtml(text);
  const normalizedText = plainText.toLowerCase();
  const matches = new Set<string>();

  if (!normalizedText) {
    return { matches: [] };
  }

  forbiddenKeywords.forEach((keyword) => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (normalizedKeyword && normalizedText.includes(normalizedKeyword)) {
      matches.add(keyword);
    }
  });

  forbiddenPatternRules.forEach((rule) => {
    if (rule.pattern.test(plainText)) {
      matches.add(rule.name);
    }
  });

  return { matches: Array.from(matches) };
};

export const validatePostContent = validateContent;
