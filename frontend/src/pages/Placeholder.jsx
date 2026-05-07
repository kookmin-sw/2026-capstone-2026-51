import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Crumbs from '../components/Crumbs';

/**
 * Placeholder 페이지. 라우트 동작 확인용 — 페이지가 만들어지면 교체됩니다.
 */
export default function Placeholder({ title, crumbs = [] }) {
  return (
    <>
      <Crumbs items={crumbs.length ? crumbs : [title]} />
      <div className="page-h">
        <h1>{title}</h1>
        <div className="sub">준비 중인 페이지입니다.</div>
      </div>
      <div className="card mt-4 text-[13px] text-ink-500 leading-relaxed">
        <div className="font-semibold text-ink-700 mb-2">
          이 페이지는 곧 만나요.
        </div>
        <p className="break-keep">
          현재 자소서·경험·자격증 등 일부 페이지가 준비 중입니다. 시연을 위해
          대시보드부터 둘러보실 수 있어요.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 mt-3 text-primary-700 font-semibold"
        >
          대시보드로 돌아가기 <ChevronRight size={13} />
        </Link>
      </div>
    </>
  );
}
