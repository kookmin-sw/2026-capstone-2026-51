import React, { useState, useMemo } from 'react';
import Crumbs from '../components/Crumbs';
import {
  COMPARE_SCOPES,
  ACTIVITY_BARS,
  CATEGORY_DIST,
  RECS_BY_SCOPE,
  RECS_HEADLINE,
} from '../data/stats';

/* ---------- Segmented filter ---------- */
function CompareScopeBar({ scope, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 bg-white border border-ink-200 rounded-lg p-1">
      {COMPARE_SCOPES.map((s) => {
        const active = scope === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={
              'px-4 py-2 rounded-md text-[13px] whitespace-nowrap transition-colors ' +
              (active
                ? 'bg-primary-900 text-white font-semibold'
                : 'text-ink-500 hover:bg-ink-50 font-medium')
            }
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Activity bar (me vs peer) ---------- */
function ActivityBar({ b }) {
  const max = Math.max(b.me, b.peer) * 1.3;
  const ahead = b.me >= b.peer;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12.5px] font-semibold text-ink-900">
          {b.label}
        </span>
        <span
          className={
            'text-[11px] font-semibold ' +
            (ahead ? 'text-emerald-700' : 'text-rose-600')
          }
        >
          {b.meLabel} · {b.peerLabel}
        </span>
      </div>
      <div className="grid grid-cols-[60px_1fr] items-center gap-2 mb-1">
        <span className="text-[11px] font-bold text-primary-800 tabular-nums">
          {b.me}
          {b.pct ? '%' : ''}
        </span>
        <div className="h-3 bg-ink-100 rounded overflow-hidden">
          <div
            className="h-full bg-primary-700 rounded"
            style={{ width: (b.me / max) * 100 + '%' }}
          />
        </div>
      </div>
      <div className="grid grid-cols-[60px_1fr] items-center gap-2">
        <span className="text-[11px] text-ink-500 tabular-nums">
          {b.peer}
          {b.pct ? '%' : ''}
        </span>
        <div className="h-3 bg-ink-100 rounded overflow-hidden">
          <div
            className="h-full bg-ink-300 rounded"
            style={{ width: (b.peer / max) * 100 + '%' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Category donut ---------- */
function CategoryDonut() {
  const total = CATEGORY_DIST.reduce((a, c) => a + c.value, 0);
  const r = 56,
    cx = 80,
    cy = 80,
    sw = 14;

  const arcs = useMemo(() => {
    let acc = 0;
    return CATEGORY_DIST.map((c) => {
      const start = (acc / 100) * Math.PI * 2 - Math.PI / 2;
      acc += c.pct;
      const end = (acc / 100) * Math.PI * 2 - Math.PI / 2;
      const large = c.pct > 50 ? 1 : 0;
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      return {
        d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
        color: c.color,
      };
    });
  }, []);

  return (
    <div>
      <div className="text-[13px] font-bold text-ink-900 mb-1">
        경험 카테고리 분포
      </div>
      <div className="text-[11px] text-ink-500 mb-3.5">
        총 {total}건 · 카테고리별 비중
      </div>
      <div className="flex items-center gap-4">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          className="shrink-0"
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="#F1F4F8"
            strokeWidth={sw}
            fill="none"
          />
          {arcs.map((a, i) => (
            <path
              key={i}
              d={a.d}
              stroke={a.color}
              strokeWidth={sw}
              fill="none"
              strokeLinecap="butt"
            />
          ))}
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            fontSize="24"
            fontWeight="700"
            fill="#0E1A33"
            letterSpacing="-0.02em"
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            fontSize="10"
            fill="#6B7280"
            fontWeight="500"
          >
            총 경험
          </text>
        </svg>
        <div className="flex-1 min-w-0">
          {CATEGORY_DIST.map((c) => (
            <div
              key={c.label}
              className="flex items-center justify-between text-[12px] py-1.5 border-b border-ink-100 last:border-b-0"
            >
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ background: c.color }}
                />
                <span className="font-medium text-ink-900">{c.label}</span>
              </span>
              <span className="text-ink-500">
                <b className="text-ink-900 font-bold">{c.value}</b>
                <span className="ml-1.5 text-[11px]">{c.pct}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Gap recommendations ---------- */
function GapRecommendCard({ scope }) {
  const recs = RECS_BY_SCOPE[scope];
  const headline = RECS_HEADLINE[scope];
  return (
    <div className="bg-white border border-ink-200 rounded-lg shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-bold text-ink-900">부족한 경험</h2>
          <div className="text-[12px] text-ink-500 mt-1">
            {headline.sub} · 보완하면 좋은 영역 3곳
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
          종합 {headline.ratio}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {recs.map((r, i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-white border border-ink-200 flex flex-col"
          >
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[13px] font-bold text-ink-900">
                {r.cat}
              </span>
              <span className="text-[11px] font-bold text-amber-700 tabular-nums">
                {r.gap}
              </span>
            </div>
            <div className="text-[11px] text-ink-500 mb-3 leading-relaxed">
              {r.detail}
            </div>
            <div className="flex flex-col">
              {r.items.map((it, j) => (
                <div
                  key={j}
                  className="text-[12px] text-ink-900 py-2 border-t border-ink-100 flex items-center gap-2"
                >
                  <span className="w-[18px] h-[18px] rounded bg-ink-100 text-ink-500 grid place-items-center text-[10px] font-bold shrink-0">
                    {j + 1}
                  </span>
                  <span>{it}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function Stats() {
  const [scope, setScope] = useState('cohort');
  const scopeMeta = COMPARE_SCOPES.find((s) => s.id === scope);
  const detailNumeric = scopeMeta.detail.split(' · ')[1]; // "214명"

  return (
    <>
      <Crumbs items={['통계']} />

      <header className="mb-6">
        <h1 className="text-[22px] font-bold tracking-tight text-ink-900">
          나의 활동 통계
        </h1>
        <div className="text-[13px] text-ink-500 mt-1.5">
          활동을 데이터로 돌아보고, 부족한 영역을 보완해보세요.
        </div>
      </header>

      {/* Filter row */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <span className="text-[13px] font-semibold text-ink-900">
            비교 대상
          </span>
          <CompareScopeBar scope={scope} onChange={setScope} />
        </div>
        <span className="text-[12px] text-ink-500">
          현재 비교 기준:{' '}
          <b className="text-ink-900 font-semibold">{scopeMeta.detail}</b>
        </span>
      </div>

      {/* Activity vs peers + donut */}
      <div className="bg-white border border-ink-200 rounded-lg shadow-sm p-5 mb-4">
        <div className="mb-5">
          <h2 className="text-[15px] font-bold text-ink-900">
            동기와 비교하기
          </h2>
          <div className="text-[12px] text-ink-500 mt-1">
            {scopeMeta.label} · {detailNumeric} · 익명 집계
          </div>
        </div>
        <div className="grid grid-cols-[1.35fr_1fr] gap-7 items-start">
          <div>
            <div className="text-[13px] font-bold text-ink-900 mb-1">
              이번 학기 활동량 — 나 vs {scopeMeta.label} 평균
            </div>
            <div className="text-[11px] text-ink-500 mb-3.5">
              최근 3개월간의 활동을 직접 비교
            </div>
            {ACTIVITY_BARS.map((b, i) => (
              <ActivityBar key={i} b={b} />
            ))}
          </div>
          <div className="pl-7 border-l border-ink-200 self-stretch">
            <CategoryDonut />
          </div>
        </div>
      </div>

      <GapRecommendCard scope={scope} />
    </>
  );
}
