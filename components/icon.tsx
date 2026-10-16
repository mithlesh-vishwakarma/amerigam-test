import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function Icon({ name, size = 20 }: { name: keyof typeof Icons; size?: number }) { const C = Icons[name] as LucideIcon; return <C size={size} strokeWidth={1.5} />; }
