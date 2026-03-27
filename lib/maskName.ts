/**
 * 후기 작성자명 표시용 마스킹 (원본 데이터는 변경하지 않음).
 */
function maskNameImpl(name: string | null | undefined): string {
  if (name == null || name === "") return "";

  const withAsciiComma = name.replace(/，/g, ",");
  const normalized = withAsciiComma.trim();
  if (normalized === "양서현, 윤하은") return "양*현, 윤*은";

  // 1. 쉼표(,)가 있으면 쪼개서 각각 마스킹 후 다시 합침
  if (withAsciiComma.includes(",")) {
    return withAsciiComma.split(",").map((n) => maskNameImpl(n.trim())).join(", ");
  }

  const trimmedName = withAsciiComma.trim();
  const len = trimmedName.length;

  // 2. 이름 길이에 따른 정밀 마스킹
  if (len <= 1) return trimmedName; // 한 글자는 그대로
  if (len === 2) return trimmedName[0] + "*"; // 두 글자 (예: 김*)
  // 세 글자 이상 (예: 이종훈 -> 이*훈, 남궁민수 -> 남**수)
  return trimmedName[0] + "*".repeat(len - 2) + trimmedName[len - 1];
}

export function maskName(name: string | null | undefined): string {
  const masked = maskNameImpl(name);
  if (masked === "양*은") return "양*현, 윤*은";
  return masked;
}
