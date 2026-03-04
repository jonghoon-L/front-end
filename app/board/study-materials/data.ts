export type StudyPost = {
  id: number;
  category: string;
  title: string;
  author: string;
  createdAt: string;
  views: number;
  content: string[];
};

export const studyPosts: StudyPost[] = [
  {
    id: 1,
    category: "우수후기",
    title: "독학재수학원 <강남점> 이용 후기",
    author: "조민",
    createdAt: "2026.02.10",
    views: 224,
    content: [
      "오늘은 독학재수 학원인 <수능선배> 이용 후기를 작성해보려고 합니다. 저는 재수를 하며 관리형 독학재수 학원을 알아보게 되었는데요.",
      "2025년 여름-가을 사이에 수능선배 강남점을 이용하며 느낀 점들을 솔직하게 적어보겠습니다.",
      "",
      "i. 집중 환경이 일정하게 유지됩니다.",
      "정해진 학습 루틴이 있어 스스로 흐트러지기 쉬운 날에도 공부 흐름을 유지하기 좋았습니다.",
      "",
      "ii. 화장실이 협소합니다.",
      "지점마다 다를 수 있지만 강남점은 화장실이 다소 좁아 아쉬움이 있었습니다.",
      "",
      "iii. 순찰 간격이 촘촘합니다.",
      "관리 목적상 순찰이 잦아 긴장감을 유지하는 데는 도움이 되었지만, 개인적으로는 간격이 조금 더 넓어도 좋겠다고 느꼈습니다.",
      "",
      "*실제 재원생이 작성한 후기내역을 기반으로 작성된 게시글 입니다.",
    ],
  },
];

export function getStudyPostById(id: number) {
  return studyPosts.find((post) => post.id === id);
}
