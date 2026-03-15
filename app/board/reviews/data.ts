export type ReviewPost = {
  id: number;
  category: string;
  branch: string;
  title: string;
  author: string;
  createdAt: string;
  views: number;
  content: string[];
  imageUrls?: string[];
  isTop?: boolean;
};

export const reviewPosts: ReviewPost[] = [
  {
    id: 1,
    category: "우수후기",
    branch: "N수생관",
    isTop: true,
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
  {
    id: 2,
    category: "우수후기",
    branch: "하이엔드관",
    isTop: true,
    title: "수업 품질이 정말 좋았어요",
    author: "이종훈",
    createdAt: "2025.02.20",
    views: 156,
    content: [
      "선생님들이 친절하고 설명도 잘 해주셔서 수능 준비에 큰 도움이 되었습니다. 특히 영어 과목 수업이 인상적이었고, 실전 문제 풀이가 많이 도움됐어요.",
      "",
      "저는 고3 재수생인데, 수능 D-200부터 이곳에서 공부를 시작했습니다. 처음에는 학원과 독서실을 여러 곳 알아봤는데, 이곳의 시설과 분위기가 가장 마음에 들어서 등록했어요. 스터디룸이 넓고 쾌적한데다 조용해서 집중이 정말 잘 됐습니다.",
      "",
      "영어 선생님께서는 매 수업마다 핵심 문법과 구문을 체계적으로 정리해주셨고, 모의고사 풀이 후에는 개별 첨삭까지 해주셔서 제 실력이 눈에 띄게 늘었어요. 수학도 기초부터 다시 다져주셔서 수능 때 1등급을 받을 수 있었습니다.",
    ],
  },
  {
    id: 3,
    category: "일반",
    branch: "N수생관",
    title: "분위기가 좋아서 집중이 잘 돼요",
    author: "백소미",
    createdAt: "2025.02.21",
    views: 98,
    content: [
      "스터디룸이 넓고 쾌적해서 공부하기 딱 좋습니다. 조용한 환경에서 혼자 공부할 수 있어서 효율이 많이 올랐어요. 화장실이나 음수대도 가까워서 편했습니다.",
    ],
  },
  {
    id: 4,
    category: "우수후기",
    branch: "하이엔드관",
    title: "강추합니다!",
    author: "김은형",
    createdAt: "2025.02.22",
    views: 187,
    content: [
      "친구 추천으로 왔는데 생각보다 훨씬 좋았어요. 관리 선생님께서 수시로 체크해주시고, 진로 상담도 받을 수 있어서 좋았습니다. 수능 D-100부터 여기서 공부했는데 성적이 많이 올랐어요.",
    ],
  },
];

export function getReviewPostById(id: number) {
  return reviewPosts.find((post) => post.id === id);
}
