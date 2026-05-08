import { useNavigate } from 'react-router-dom';
import Crumbs from '../components/Crumbs';
import ExperienceForm from '../components/experience/ExperienceForm';
import { useCreateExperience } from '../api/queries/useExperiences';
import { toast } from '../store/useToast';

/**
 * /my-experience/new — 경험 추가.
 * 백엔드 POST /experiences 직접 사용. 성공 시 목록으로 이동.
 */
export default function NewExperience() {
  const nav = useNavigate();
  const create = useCreateExperience();

  const handleSubmit = (body) => {
    create.mutate(body, {
      onSuccess: () => {
        toast.success('경험이 저장되었습니다.');
        nav('/my-experience');
      },
      onError: (e) => {
        toast.error(
          e?.apiMessage || '저장 중 오류가 발생했습니다. 다시 시도해주세요.'
        );
      },
    });
  };

  return (
    <>

  return null;
}
