const icons = {
  flame: (
    <path d="M13 2c1 5-3 6-3 10 2-1 3-2 4-4 4 3 6 6 5 9a7 7 0 0 1-7 5c-4 0-7-3-7-7 0-3 2-6 4-8 0 2 0 3 1 3 0-3 1-5 3-8Z" />
  ),
  lock: (
    <>
      <rect x="6" y="10" width="12" height="10" rx="2" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3m-3 4v2" />
    </>
  ),
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  strength: <path d="M8 12h8M3 10v4m18-4v4M6 7v10m12-10v10" />,
  cardio: <path d="M2 12h5l3-6 4 12 3-6h5" />,
  check: <path d="m5 12 4 4L19 6" />,
};

export function Icon({ name }: { name: keyof typeof icons }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}
