import api from './axios';
import { STATS_BACK_TO_FRONT, pickStat } from '../lib/enums';

/**
 * 사용자 본인 프로필 갱신. 온보딩 완료 시 호출.
 * 백엔드: PUT /users/me  (ApiResponse 래핑 응답)
 */
export async function updateMyProfile(profile) {
  const res = await api.put('/users/me', profile);
  return res.data?.data ?? res.data;
}

/**
 * 현재 로그인한 사용자의 프로필 조회. 사이드바/헤더의 이름 표시에 사용.
 * 응답의 `data.userName` 등을 그대로 활용.
 */
export async function getMe() {
  const res = await api.get('/users/me');
  return res.data?.data ?? res.data;
}

/**
 * 대시보드용 집계 데이터 조회 (PeersOrb 5축, 내 로드맵, 선배 로드맵).
 *
 * 백엔드 DashboardResponse 는 { statistics, userExperiences, graduateUserExperiences } 형태인데,
 * 친구 Dashboard.jsx 는 { peerAxes, myRoadmap, seniorRoadmaps } 키를 기대. 어댑터로 변환.
 *  - statistics.{partTime|external|internal|license|intern}.{avg|myCount} → peerAxes[]
 *  - userExperiences.{partTime|intern|license|internal|external}History → myRoadmap[]
 *  - graduateUserExperiences[] → seniorRoadmaps[]
 */
export async function getMyDashboard() {
  const res = await api.get('/users/me/dashboard');
  const raw = res.data?.data ?? res.data;
  return adaptDashboard(raw);
}

/* ===================== 백엔드 응답 → 친구 키 어댑터 ===================== */

const AXIS_DEFS = [
  { key: 'internal', label: '대내활동' },
  { key: 'activity', label: '대외활동' },
  { key: 'intern', label: '인턴' },
  { key: 'parttime', label: '알바' },
  { key: 'cert', label: '자격증' },
];

// 백엔드 history 키 → 프론트 카테고리 키
const HISTORY_TO_CAT = {
  partTimeHistory: 'parttime',
  internHistory: 'intern',
  licenseHistory: 'cert',
  internalHistory: 'internal',
  externalHistory: 'activity',
};

function adaptDashboard(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    ...raw,
    peerAxes: buildPeerAxes(raw.statistics),
    myRoadmap: buildRoadmap(raw.userExperiences),
    seniorRoadmaps: buildSeniors(raw.graduateUserExperiences),
  };
}

function buildPeerAxes(statistics) {
  if (!statistics) return [];
  const me = pickStat(statistics, 'myCount');
  const peers = pickStat(statistics, 'avg');
  // 모든 me/peers 가 0 이면 빈 배열로 — Dashboard 가 PEER_AXES mock fallback 띄우게.
  const allZero = Object.values(STATS_BACK_TO_FRONT).every(
    (k) => !Number(me[k]) && !Number(peers[k])
  );
  if (allZero) return [];
  return AXIS_DEFS.map(({ key, label }) => ({
    key,
    label,
    me: Number(me[key] ?? 0),
    peers: Number(peers[key] ?? 0),
  }));
}

function buildRoadmap(userExperiences) {
  if (!userExperiences || typeof userExperiences !== 'object') return [];
  const items = [];
  for (const [historyKey, cat] of Object.entries(HISTORY_TO_CAT)) {
    const list = userExperiences[historyKey];
    if (!Array.isArray(list)) continue;
    for (const it of list) {
      const start = parseYm(it.startDate);
      items.push({
        y: start.y,
        m: start.m,
        cat,
        title: it.name || '(제목 없음)',
        date: fmtRange(it.startDate, it.endDate),
        detail: '',
      });
    }
  }
  return items.sort((a, b) => a.y - b.y || a.m - b.m);
}

function buildSeniors(graduateUserExperiences) {
  if (!Array.isArray(graduateUserExperiences)) return [];
  return graduateUserExperiences
    .map((g, i) => ({
      name: `선배 ${i + 1}`,
      co: '',
      year: '',
      items: buildRoadmap(g),
    }))
    .filter((s) => s.items.length > 0);
}

function parseYm(s) {
  const m = /^(\d{4})-(\d{1,2})/.exec(s ?? '');
  if (!m) return { y: 0, m: 0 };
  return { y: Number(m[1]), m: Number(m[2]) };
}

function fmtRange(start, end) {
  const fmt = (s) => {
    const m = /^(\d{4})-(\d{2})/.exec(s ?? '');
    return m ? `${m[1].slice(2)}.${m[2]}` : '';
  };
  const a = fmt(start);
  const b = fmt(end);
  if (!a && !b) return '';
  if (!b || a === b) return a;
  return `${a} ~ ${b}`;
}

/**
 * 통계 페이지 데이터 조회.
 *  - groupBy: 'STATE' | 'SCHOOL_NUM' | 'WORKER'
 *  - 응답: { my, average, max, weakPoints, topRankers }
 *  - 프론트에서 groupBy별로 캐싱하므로 재선택해도 추가 호출 없음.
 */
export async function getMyStats(groupBy) {
  const res = await api.get('/users/me/stats', { params: { groupBy } });
  return res.data?.data ?? res.data;
}
