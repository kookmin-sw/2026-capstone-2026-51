import { useState } from 'react';
import { cn } from '../../lib/cn';

/**
 * 자소서 메타 정보 폼 — 회사명 / 희망 직무 / 글로벌 요구사항.
 *
 * Swagger EssayCreateRequest:
 *   companyName, wishJob, globalReq — 모두 minLength:1 (required).
 * EssayUpdateRequest 도 동일 shape (자소서 메타 수정에 사용).
 *
 * Props:
 *  - initialValue?: { companyName, wishJob, globalReq }
 *  - onSubmit(body): swagger EssayCreate/Update Request 형식
 *  - onCancel?: 취소 콜백 (있으면 취소 버튼 노출)
 *  - isPending: mutation 진행 중인지
 *  - submitLabel
 */
export default function EssayMetaForm({
  initialValue,
  onSubmit,
  onCancel,
  isPending,
  submitLabel = '다음 단계',
}) {
  const [form, setForm] = useState(() => ({
    companyName: initialValue?.companyName ?? '',
    wishJob: initialValue?.wishJob ?? '',
    globalReq: initialValue?.globalReq ?? '',
  }));
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validate(form) : {};

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form);
    if (Object.keys(errs).length > 0) return;
    if (isPending) return;
    onSubmit({
      companyName: form.companyName.trim(),
      wishJob: form.wishJob.trim(),
      globalReq: form.globalReq.trim(),
    });
  };

  return null;
}
