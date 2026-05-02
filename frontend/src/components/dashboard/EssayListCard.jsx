import { Link } from 'react-router-dom';
import { FileText, PencilLine } from 'lucide-react';
import { useEssays } from '../../api/queries/useEssays';
import { PROGRESS_LABEL, PROGRESS_TONE } from '../../lib/enums';

/**
 * 대시보드 PeersOrb 우측 패널 — 내 자소서 목록 + 자소서 작성하기 CTA.
 *
 *  - 최대 5개까지만 노출 (그 이상은 "전체 보기" 링크).
 *  - 카드 클릭 → 상세 진입은 백엔드 `EssayResponse.essayId` 누락으로 차단되어 있으므로,
 *    각 행은 비링크. 전체 관리는 우하단 "전체 보기" / 작성은 "자소서 작성하기" CTA 로.
 *  - embedded=true 면 외곽 .card 래퍼/패딩 제거. 상단 통합 카드의 한 칸으로 들어갈 때 사용.
 */
export default function EssayListCard({ embedded = false }) {
  const list = useEssays();
  const items = list.data || [];
  const visible = items.slice(0, 5);

  return null;
}
