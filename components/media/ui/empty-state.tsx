import { ChatsCircle, ImageSquare, MagnifyingGlass, Package, Wallet, UserCircleCheck } from "@phosphor-icons/react/ssr";

/** Phosphor duotone is reserved for empty states and verification seals. */
const icons = {
  posts: ImageSquare,
  search: MagnifyingGlass,
  market: Package,
  messages: ChatsCircle,
  wallet: Wallet,
  profile: UserCircleCheck,
} as const;

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: keyof typeof icons;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  const Icon = icons[icon];
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-m-ink/10 bg-m-card px-6 py-12 text-center shadow-m-tile">
      <span className="mb-4 text-m-blue">
        <Icon size={56} weight="duotone" aria-hidden />
      </span>
      <p className="text-base font-bold text-m-ink">{title}</p>
      {body && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-m-ink/65">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
