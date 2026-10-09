const swatches = [
  ['#1ed760', '#0a0a0a'],
  ['#f5f3ee', '#1a1a1a'],
  ['#0f7a37', '#0a0a0a'],
  ['#212121', '#1ed760'],
  ['#1ed760', '#121212'],
  ['#3a3a3a', '#f5f3ee'],
  ['#0a0a0a', '#1ed760'],
  ['#181818', '#a7a7a7'],
  ['#1ed760', '#0f7a37'],
];

// A grid of abstract "album art" tiles built from CSS gradients — stands in
// for real cover art without depending on any external image source.
export default function AlbumMosaic({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      {swatches.map(([a, b], i) => (
        <div
          key={i}
          className="aspect-square rounded-xl border border-white/5 shadow-lg"
          style={{
            background: `linear-gradient(${135 + i * 12}deg, ${a} 0%, ${b} 100%)`,
            animationDelay: `${i * 60}ms`,
          }}
        >
          <div
            className="w-full h-full rounded-xl opacity-40"
            style={{
              backgroundImage:
                i % 3 === 0
                  ? 'repeating-linear-gradient(45deg, rgba(0,0,0,0.15) 0 2px, transparent 2px 8px)'
                  : i % 3 === 1
                  ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 60%)'
                  : 'repeating-radial-gradient(circle, rgba(0,0,0,0.12) 0 1px, transparent 1px 10px)',
            }}
          />
        </div>
      ))}
    </div>
  );
}
