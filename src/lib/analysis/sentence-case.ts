/**
 * Capitalises the first character of a string while preserving any leading whitespace
 * or non-Latin characters.
 *
 * Used for formatting model-written observations, interpretations, notes, and questions
 * when presented in the UI, without modifying the underlying validated data or quotes.
 */
export function sentenceCase(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  let index = 0;
  while (index < text.length && /\s/.test(text[index])) {
    index++;
  }

  if (index >= text.length) {
    return text;
  }

  const leadingWs = text.slice(0, index);
  const remainingChars = Array.from(text.slice(index));
  const firstChar = remainingChars[0];
  const rest = remainingChars.slice(1).join("");

  return `${leadingWs}${firstChar.toLocaleUpperCase()}${rest}`;
}
