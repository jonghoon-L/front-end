export type StudyMaterial = {
  id: number;
  title: string;
  downloadUrl: string;
  downloadCount: number;
};

export const studyMaterials: StudyMaterial[] = [
  {
    id: 1,
    title: "2025 수능 국어 핵심 문법 정리",
    downloadUrl: "/files/2025-국어-문법정리.pdf",
    downloadCount: 156,
  },
  {
    id: 2,
    title: "수학 미적분 기초 문제집",
    downloadUrl: "/files/수학-미적분-기초.pdf",
    downloadCount: 89,
  },
  {
    id: 3,
    title: "영어 구문독해 실전 예제",
    downloadUrl: "/files/영어-구문독해.pdf",
    downloadCount: 203,
  },
];
