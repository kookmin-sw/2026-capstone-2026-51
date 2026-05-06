import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Pencil,
  Trash2,
  X as XIcon,
  ArrowLeft,
  PencilLine,
  Check,
} from 'lucide-react';
import Crumbs from '../components/Crumbs';
import EssayMetaForm from '../components/essay/EssayMetaForm';
import {
  useEssay,
  useUpdateEssayMeta,
  useUpdateEssayResult,
  useDeleteEssay,
} from '../api/queries/useEssays';
import { PROGRESS_LABEL, PROGRESS_TONE } from '../lib/enums';
import { toast } from '../store/useToast';

/**
 * /essays/:id — 자소서 상세 페이지.
 *
 * 데이터: GET /essays/:id (useEssay 훅이 EssayDetailResponse 의 requirement→globalReq,
 *  modifiedDate→updatedAt normalize 적용).
 *
 * 동작:
 *  - 메타 view ↔ edit 토글. 저장 = PATCH /essays/:id.
 *  - 문항 목록: 질문/답변/maxLength/문항 번호 표시. "이 문항 편집" 버튼은 본 페이지에서
 *    문항 단위 편집기를 띄우는 대신 /write 의 QuestionEditor 흐름으로 보내지 않고,
 *    상세에서는 읽기 전용으로 노출 (편집은 전용 페이지가 아닌 /write 흐름에서 관리).
 *    → 본 PR 에서는 단순히 읽기 + 결과/삭제 컨트롤. 문항 인라인 편집은 추후 단위로 분리.
 *  - 결과 입력: PATCH /essays/:id/result body: { progress: PASS|FAIL|IN_PROGRESS }.
 *  - 삭제: DELETE /essays/:id (2클릭 confirm + 5초 자동 취소).
 *
 * 진입 경로: /essays 카드 → /essays/:id (essayId 가 응답에 있을 때만 활성).
 *  목록 응답에 essayId 가 누락되면 진입은 차단되어 본 페이지에 도달 못 함.
 */
export default function EssayDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const q = useEssay(id);

  const [editingMeta, setEditingMeta] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateMeta = useUpdateEssayMeta();
  const updateResult = useUpdateEssayResult();
  const deleteEssay = useDeleteEssay();

  const handleMetaSave = (body) => {
    updateMeta.mutate(
      { id, body },
      {
        onSuccess: () => {
          setEditingMeta(false);
          toast.success('자소서 정보가 수정되었습니다.');
          q.refetch();
        },
        onError: (e) => toast.error(e?.apiMessage || '수정에 실패했습니다.'),
      }
    );
  };

  const handleResult = (progress) => {
    updateResult.mutate(
      { id, progress },
      {
        onSuccess: () => {
          toast.success('결과가 반영되었습니다.');
          q.refetch();
        },
        onError: (e) =>
          toast.error(e?.apiMessage || '결과 반영에 실패했습니다.'),
      }
    );
  };

  const handleDelete = () => {

  return null;
}
