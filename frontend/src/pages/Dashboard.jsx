import React, { useState } from 'react';
import Crumbs from '../components/Crumbs';
import HeroBanner from '../components/dashboard/HeroBanner';
import PeersOrb from '../components/PeersOrb';
import RoadmapCard from '../components/dashboard/RoadmapCard';
import { PEER_AXES, MY_ROADMAP, SENIOR_ROADMAPS } from '../data/dashboard';

/**
 * 대시보드 — 4개 카드 세로 스택.
 *  1) HeroBanner
 *  2) PeersOrb (5축 입체 레이더)
 *  3) 내 로드맵 — 실제 날짜축, hover-only 칩
 *  4) 선배 로드맵 — 좌우 화살표 carousel + coverage
 */
export default function Dashboard() {
  const [hasProfile] = useState(true);
  const [seniorIdx, setSeniorIdx] = useState(0);
  const senior = SENIOR_ROADMAPS[seniorIdx];

  return (
    <>
      <Crumbs items={['대시보드']} />
      <HeroBanner hasProfile={hasProfile} />
      {hasProfile ? (
        <div className="grid gap-4">
          <PeersOrb axes={PEER_AXES} />

          {/* 내 로드맵 */}
          <RoadmapCard
            title="나의 학창시절 로드맵"
            items={MY_ROADMAP}
            showNowMarker
          />

          {/* 선배 로드맵 — carousel 머 (참고용, coverage 없음) */}
          <RoadmapCard
            title="취업 선배의 로드맵 비교"
            carousel={{
              list: SENIOR_ROADMAPS,
              idx: seniorIdx,
              onChange: setSeniorIdx,
            }}
            items={senior.items}
          />
        </div>
      ) : (
        <div className="bg-paper border border-border rounded-lg p-10 text-center text-ink-500 text-sm">
          내 경험을 먼저 입력하면 동기 비교 · 선배 로드맵이 활성화됩니다.
        </div>
      )}
    </>
  );
}
