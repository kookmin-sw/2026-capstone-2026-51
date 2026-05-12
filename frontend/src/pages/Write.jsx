import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, ChevronRight, Trash2, Check } from 'lucide-react';
import Crumbs from '../components/Crumbs';
import { Card } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { RECOMMENDED, mockGenerateDraft } from '../data/essays';

/* ------------------------------------------------------------------ *
 * 자소서 작성 — 2단계.
 * Step 1) 지원 정보 (회사명 / 희망 직무 / 공통 요구사항)
 * Step 2) 문항 카드 — 추가 시 (문항 입력 / 경험 선택 / 초안 생성) 3섹션이 펼쳐짐
 *   - 경험 선택: LLM이 매칭 상위 2개 default 선택. 나머지는 스크롤 영역에서
 *               유사도순 정렬 + 최대 2개까지 토글 가능.
 *   - 초안 생성: [생성하기] → 기본 초안. [요구사항 + 다시 생성하기] →
 *               아래에 "후의 답변" 추가 + 원래/후 답변 저장 선택.
 * ------------------------------------------------------------------ */

/* ============== Step 1 ============== */
function Step1({ form, onChange, onNext }) {
  const ready = form.company.trim() && form.role.trim();
  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-[15px] font-bold text-ink-900">지원 정보</h2>
        <p className="text-[12.5px] text-ink-500 mt-1">
          자소서를 작성할 회사, 직무, 그리고 공고에 공통으로 등장하는 요구사항을
          정리해주세요.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="회사명" required>
          <input
            className="field"
            placeholder="예: 카카오"
            value={form.company}
            onChange={(e) => onChange({ company: e.target.value })}
          />
        </Field>
        <Field label="희망 직무" required>
          <input
            className="field"
            placeholder="예: 백엔드 개발자"
            value={form.role}
            onChange={(e) => onChange({ role: e.target.value })}
          />
        </Field>
      </div>

      <div className="mt-3">
        <Field
          label="공통 요구사항"
          hint="공고에 반복적으로 등장한 인재상·역량을 적어두면 모든 문항의 초안 생성에 반영됩니다."
        >
          <textarea
            className="field min-h-[100px]"
            placeholder="예: 백엔드 시스템 설계 경험, 동료 코드 리뷰 문화, 도전 정신을 갖춘 인재"
            value={form.requirements}
            onChange={(e) => onChange({ requirements: e.target.value })}
          />
        </Field>
      </div>

      <div className="flex justify-end mt-5 pt-4 border-t border-ink-150">
        <Button variant="primary" disabled={!ready} onClick={onNext}>
          다음 단계 <ChevronRight size={13} />
        </Button>
      </div>
    </Card>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <div className="flex items-baseline gap-1 mb-1.5">
        <span className="text-[12px] font-semibold text-ink-700">{label}</span>
        {required && <span className="text-[11px] text-red-500">*</span>}
      </div>
      {children}
      {hint && (
        <div className="text-[11.5px] text-ink-500 mt-1.5 leading-relaxed">
          {hint}
        </div>
      )}
    </label>
  );
}

/* ============== Step 2 ============== */
function Step2({ form, onChange, questions, setQuestions, onBack, onSave }) {
  const addQuestion = () => {
    const id = Date.now();
    // LLM 추천: match 상위 2개 자동 선택
    const sorted = [...RECOMMENDED].sort((a, b) => b.match - a.match);
    const llmDefault = sorted.slice(0, 2).map((r) => r.id);
    setQuestions((qs) => [
      ...qs,
      {
        id,
        title: '',
        limit: 800,
        picked: llmDefault,
        // 초안 상태
        draft: '',
        requirements: '',
        altDraft: '', // 다시 생성한 답변(텍스트폼 2)
        // 'none' | 'picked' (저장됨)
        saveChoice: null,
      },
    ]);
  };

  const updateQ = (id, patch) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const removeQ = (id) => setQuestions((qs) => qs.filter((q) => q.id !== id));

  return (
    <>
      {/* 헤더 요약 (Step1 결과) */}
      <Card className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] text-ink-500 font-semibold mb-1">
              지원 정보
            </div>
            <div className="text-[14px] font-bold text-ink-900 truncate">
              {form.company} <span className="text-ink-400 font-normal">·</span>{' '}
              {form.role}
            </div>
            {form.requirements && (
              <div className="text-[12px] text-ink-600 mt-1 line-clamp-1">
                요구사항 — {form.requirements}
              </div>
            )}
          </div>
          <Button onClick={onBack}>지원 정보 수정</Button>
        </div>
      </Card>

      {/* 문항 리스트 */}
      <div className="flex flex-col gap-4">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={i}
            requirements={form.requirements}
            onChange={(patch) => updateQ(q.id, patch)}
            onRemove={() => removeQ(q.id)}
          />
        ))}
      </div>

      {/* 문항 추가 / 저장 */}
      <div className="mt-4 flex flex-col items-stretch gap-3">
        <button
          onClick={addQuestion}
          className="w-full py-4 rounded-md border border-dashed border-ink-300 bg-paper hover:bg-ink-50 text-[13px] font-semibold text-ink-700 inline-flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={14} /> 문항을 추가
        </button>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onBack}>이전</Button>
          <Button
            variant="primary"
            disabled={questions.length === 0}
            onClick={onSave}
          >
            <Check size={13} /> 저장
          </Button>
        </div>
      </div>
    </>
  );
}

/* ============== Question Card ============== */
function QuestionCard({ q, index, requirements, onChange, onRemove }) {
  const [busy, setBusy] = React.useState(false);
  const [busyAlt, setBusyAlt] = React.useState(false);

  const togglePick = (id) => {
    const has = q.picked.includes(id);
    if (has) onChange({ picked: q.picked.filter((x) => x !== id) });
    else if (q.picked.length < 2) onChange({ picked: [...q.picked, id] });
  };

  const generate = () => {
    setBusy(true);
    setTimeout(() => {
      const draft = mockGenerateDraft({
        question: q.title,
        picked: q.picked,
        requirements,
      });
      onChange({ draft, altDraft: '', saveChoice: null });
      setBusy(false);
    }, 600);
  };

  const regenerate = () => {
    setBusyAlt(true);
    setTimeout(() => {
      const altDraft = mockGenerateDraft({
        question: q.title,
        picked: q.picked,
        requirements: (requirements || '') + ' / ' + (q.requirements || ''),
      });
      onChange({ altDraft, saveChoice: null });
      setBusyAlt(false);
    }, 600);
  };

  // 추천 정렬: LLM 기본 선택 2개 → 나머지 (유사도 순)
  const sorted = [...RECOMMENDED].sort((a, b) => b.match - a.match);
  const llmDefault = sorted.slice(0, 2).map((r) => r.id);
  const rest = sorted.filter((r) => !llmDefault.includes(r.id));

  return (
    <Card>
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary-900 text-white grid place-items-center text-[11px] font-bold">
            Q{index + 1}
          </span>
          <span className="text-[13px] font-bold text-ink-900">
            자소서 문항
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-ink-400 hover:text-red-500 transition-colors p-1"
          title="문항 삭제"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* (1) 문항 입력 */}
      <Section step="1" title="문항">
        <textarea
          className="field min-h-[68px]"
          placeholder="자소서 문항을 그대로 붙여넣으세요."
          value={q.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[11.5px] text-ink-500">글자 제한</span>
          <input
            type="number"
            className="field max-w-[110px] py-1 text-[12px]"
            value={q.limit}
            min={100}
            step={100}
            onChange={(e) => onChange({ limit: Number(e.target.value) || 0 })}
          />
          <span className="text-[11.5px] text-ink-500">자</span>
        </div>
      </Section>

      {/* (2) 경험 선택 */}
      <Section
        step="2"
        title="이 문항에 쓸 경험"
        hint={`AI가 추천한 상위 ${llmDefault.length}개를 자동 선택했어요. 최대 2개까지 선택할 수 있어요.`}
        right={
          <span className="text-[11.5px] font-semibold text-primary-800">
            {q.picked.length}/2
          </span>
        }
      >
        {/* LLM 추천 (기본 선택) */}
        <div className="grid gap-2 mb-2">
          {llmDefault.map((id) => {
            const r = sorted.find((x) => x.id === id);
            return (
              <ExpRow
                key={id}
                r={r}
                llm
                picked={q.picked.includes(id)}
                disabled={!q.picked.includes(id) && q.picked.length >= 2}
                onToggle={() => togglePick(id)}
              />
            );
          })}
        </div>

        {/* 나머지 — 유사도 순 정렬 + 스크롤 */}
        <div className="text-[11px] font-semibold text-ink-500 mb-1.5 mt-3">
          그 외 경험 · 유사도 순
        </div>
        <div className="max-h-[200px] overflow-y-auto pr-1 flex flex-col gap-2 border border-ink-150 rounded-md p-2 bg-ink-50/50">
          {rest.map((r) => (
            <ExpRow
              key={r.id}
              r={r}
              picked={q.picked.includes(r.id)}
              disabled={!q.picked.includes(r.id) && q.picked.length >= 2}
              onToggle={() => togglePick(r.id)}
            />
          ))}
        </div>
      </Section>

      {/* (3) 초안 생성 */}
      <Section step="3" title="초안 생성">
        <textarea
          className="field min-h-[180px] leading-relaxed"
          placeholder="[생성하기]를 누르면 AI가 작성한 초안이 여기에 표시됩니다."
          value={q.draft}
          onChange={(e) => onChange({ draft: e.target.value })}
        />
        <div className="text-right text-[11.5px] text-ink-500 font-mono mt-1">
          {q.draft.length} / {q.limit}
        </div>

        {/* 생성하기 / 요구사항 + 다시 생성하기 */}
        <div className="mt-3 rounded-md bg-ink-50 border border-ink-150 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={13} className="text-primary-700" />
            <span className="text-[12px] font-bold text-ink-800">AI 초안</span>
          </div>

          {!q.draft ? (
            <Button
              variant="primary"
              disabled={!q.title || q.picked.length === 0 || busy}
              onClick={generate}
            >
              {busy ? (
                '생성 중…'
              ) : (
                <>
                  <Sparkles size={13} /> 생성하기
                </>
              )}
            </Button>
          ) : (
            <>
              <textarea
                className="field min-h-[60px] text-[12.5px]"
                placeholder="추가/수정 요구사항을 적으면 다시 생성할 때 반영됩니다. (예: 더 짧게, 결론 먼저)"
                value={q.requirements}
                onChange={(e) => onChange({ requirements: e.target.value })}
              />
              <div className="flex justify-end mt-2">
                <Button
                  variant="primary"
                  onClick={regenerate}
                  disabled={busyAlt}
                >
                  {busyAlt ? (
                    '생성 중…'
                  ) : (
                    <>
                      <Sparkles size={13} /> 다시 생성하기
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* 다시 생성한 답변(텍스트폼 2) */}
        {q.altDraft && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-bold text-primary-800">
                다시 생성한 답변
              </span>
              {q.saveChoice && (
                <Badge tone="green">
                  {q.saveChoice === 'original'
                    ? '원래 답변 저장됨'
                    : '후의 답변 저장됨'}
                </Badge>
              )}
            </div>
            <textarea
              className="field min-h-[180px] leading-relaxed bg-primary-50/40"
              value={q.altDraft}
              onChange={(e) => onChange({ altDraft: e.target.value })}
            />
            <div className="text-right text-[11.5px] text-ink-500 font-mono mt-1">
              {q.altDraft.length} / {q.limit}
            </div>

            {/* 어떤 답변을 저장할지 */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                onClick={() =>
                  onChange({
                    draft: q.draft,
                    altDraft: '',
                    saveChoice: 'original',
                  })
                }
              >
                원래 답변 저장하기
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  onChange({
                    draft: q.altDraft,
                    altDraft: '',
                    saveChoice: 'alt',
                  })
                }
              >
                <Check size={13} /> 후의 답변 저장하기
              </Button>
            </div>
          </div>
        )}
      </Section>
    </Card>
  );
}

function Section({ step, title, hint, right, children }) {
  return (
    <div className="mt-4 first:mt-0 pt-4 first:pt-0 border-t first:border-t-0 border-ink-150">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-primary-50 text-primary-800 grid place-items-center text-[10px] font-bold">
            {step}
          </span>
          <span className="text-[12.5px] font-bold text-ink-900">{title}</span>
        </div>
        {right}
      </div>
      {hint && (
        <div className="text-[11.5px] text-ink-500 mb-2 leading-relaxed">
          {hint}
        </div>
      )}
      {children}
    </div>
  );
}

function ExpRow({ r, picked, disabled, llm, onToggle }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`text-left p-2.5 rounded-md border flex items-start gap-2.5 transition-colors
        ${picked ? 'border-primary-700 bg-primary-50' : 'border-ink-200 bg-paper hover:bg-ink-50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded-sm border-[1.5px] grid place-items-center text-[10px] font-bold text-white
        ${picked ? 'bg-primary-800 border-primary-800' : 'bg-paper border-ink-300'}`}
      >
        {picked ? '✓' : ''}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="text-[12.5px] font-bold text-ink-900 truncate">
            {r.title}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {llm && <Badge tone="navy">AI 추천</Badge>}
            <Badge tone="green">매칭 {r.match}%</Badge>
          </div>
        </div>
        <div className="text-[11px] text-ink-500">
          {r.cat} · {r.dur} · {r.tags}
        </div>
      </div>
    </button>
  );
}

/* ============== Page ============== */
export default function Write() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({
    company: '',
    role: '',
    requirements: '',
  });
  const [questions, setQuestions] = React.useState([]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  return (
    <>
      <Crumbs items={['자소서', '작성하기']} />
      <div className="page-h flex items-start justify-between gap-4 mb-4">
        <div>
          <h1>자소서 작성</h1>
          <div className="sub">
            {step === 1
              ? '먼저 어떤 자소서를 쓸지 알려주세요.'
              : '문항을 추가하고, 내 경험을 바탕으로 초안을 만들어보세요.'}
          </div>
        </div>
        <Button onClick={() => navigate('/essays')}>취소</Button>
      </div>

      {/* 단계 표시 */}
      <div className="flex items-center gap-2 mb-4 text-[12px]">
        <StepDot active={step === 1} done={step > 1} n={1} label="지원 정보" />
        <span className="w-6 h-px bg-ink-300" />
        <StepDot active={step === 2} done={false} n={2} label="문항 작성" />
      </div>

      {step === 1 ? (
        <Step1 form={form} onChange={update} onNext={() => setStep(2)} />
      ) : (
        <Step2
          form={form}
          onChange={update}
          questions={questions}
          setQuestions={setQuestions}
          onBack={() => setStep(1)}
          onSave={() => navigate('/essays')}
        />
      )}
    </>
  );
}

function StepDot({ active, done, n, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
      ${
        active
          ? 'bg-primary-50 text-primary-800'
          : done
            ? 'bg-ink-100 text-ink-700'
            : 'text-ink-500'
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full grid place-items-center text-[10px] font-bold
        ${
          active
            ? 'bg-primary-800 text-white'
            : done
              ? 'bg-primary-700 text-white'
              : 'bg-ink-200 text-ink-500'
        }`}
      >
        {done ? '✓' : n}
      </span>
      <span className="font-semibold">{label}</span>
    </span>
  );
}
