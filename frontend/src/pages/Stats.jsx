import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Crumbs from '../components/Crumbs';
import { cn } from '../lib/cn';
import {
  STATS_GROUP_LABEL,
  pickStat,
  weakPointLabel,
  EXPERIENCE_CATEGORY_LABEL,
} from '../lib/enums';
import { useMyStats } from '../api/queries/useMe';
import { CAT_COLORS } from '../data/dashboard';

const GROUP_KEYS = Object.keys(STATS_GROUP_LABEL);

function cycleGroup(current, direction) {
  const idx = GROUP_KEYS.indexOf(current);
  const next = (idx + direction + GROUP_KEYS.length) % GROUP_KEYS.length;
  return GROUP_KEYS[next];
}

  return null;
}
