/**
 * 이름 가운데 글자를 마스킹 처리합니다.
 * - 2글자: 첫글자 + *
 * - 3글자: 첫글자 + * + 마지막
 * - 4글자 이상: 첫글자 + (가운데 모두 *) + 마지막
 * - "이름1, 이름2" 형태는 각 이름을 개별 처리
 */
export function blurName(name: string): string {
  if (!name || typeof name !== "string") return name;
  return name
    .split(/[,·]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((single) => {
      const chars = [...single];
      const len = chars.length;
      if (len <= 1) return single;
      if (len === 2) return `${chars[0]}*`;
      const middleCount = len - 2;
      const mask = "*".repeat(middleCount);
      return `${chars[0]}${mask}${chars[len - 1]}`;
    })
    .join(", ");
}
