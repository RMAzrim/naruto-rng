import { useEffect, useRef, useCallback } from 'react';

interface WheelProps {
  options: { id: string; label: string; color?: string }[];
  selectedIndex: number;
  spinning: boolean;
  onSpinEnd?: () => void;
  reducedMotion?: boolean;
}

const WHEEL_SIZE = 260;

export function Wheel({
  options,
  selectedIndex,
  spinning,
  onSpinEnd,
  reducedMotion = false,
}: WheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);

  const sliceAngle = 360 / options.length;
  const colors = [
    '#1e293b', '#334155', '#475569', '#0ea5e9', '#38bdf8', '#1d4ed8',
    '#64748b', '#7dd3fc', '#fbbf24', '#fde047',
  ];

  const getSliceRotation = useCallback(() => {
    // Rotate so selected slice lands at top center (270deg / -90 deg)
    const target = -selectedIndex * sliceAngle - sliceAngle / 2 - 90;
    return target;
  }, [selectedIndex, sliceAngle]);

  useEffect(() => {
    if (!spinning) return;
    const svg = svgRef.current;
    if (!svg) return;

    const start = rotationRef.current;
    const target = getSliceRotation();
    // Determine shortest extra spins
    const fullRotations = 5;
    let end = target - fullRotations * 360;
    // Normalize
    while (end - start < -360 * fullRotations) end -= 360;

    const duration = reducedMotion ? 400 : 1600;
    const startTime = performance.now();

    function animate(time: number) {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      const current = start + (end - start) * ease;
      rotationRef.current = current;
      svg!.style.transform = `rotate(${current}deg)`;

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        svg!.style.transform = `rotate(${end}deg)`;
        rotationRef.current = end;
        onSpinEnd?.();
      }
    }

    requestAnimationFrame(animate);
  }, [spinning, getSliceRotation, onSpinEnd, reducedMotion]);

  return (
    <div className="wheel-container" ref={containerRef} style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
      <svg
        ref={svgRef}
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        viewBox="0 0 260 260"
        style={{
          transformOrigin: 'center center',
          transition: reducedMotion ? 'none' : undefined,
        }}
      >
        {options.map((opt, i) => {
          const startAngle = i * sliceAngle;
          const endAngle = startAngle + sliceAngle;
          const startX = 130 + 125 * Math.cos((startAngle * Math.PI) / 180);
          const startY = 130 + 125 * Math.sin((startAngle * Math.PI) / 180);
          const endX = 130 + 125 * Math.cos((endAngle * Math.PI) / 180);
          const endY = 130 + 125 * Math.sin((endAngle * Math.PI) / 180);
          const largeArc = sliceAngle > 180 ? 1 : 0;

          return (
            <path
              key={opt.id}
              d={`M 130 130 L ${startX} ${startY} A 125 125 0 ${largeArc} 1 ${endX} ${endY} Z`}
              fill={colors[i % colors.length]}
              stroke="#0f172a"
              strokeWidth="2"
            />
          );
        })}
        {/* Center circle */}
        <circle cx="130" cy="130" r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
        {/* Pointer at top */}
        <polygon points="130,10 145,40 115,40" fill="#38bdf8" />
      </svg>
      <div className="wheel-labels" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}>
          {options[selectedIndex]?.label || '—'}
        </div>
      </div>
    </div>
  );
}
