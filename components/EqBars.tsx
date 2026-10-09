export default function EqBars({ className = '' }: { className?: string }) {
  return (
    <span className={`eq-bars ${className}`} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}
