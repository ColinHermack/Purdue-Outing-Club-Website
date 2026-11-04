/**
 * Builds avatar initials from a full name: the first letter of the first and last words.
 *
 * @param name The member's full name.
 * @returns One or two uppercase letters, or "?" for an empty name.
 */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "?";

  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";

  return (first + last).toUpperCase();
}
