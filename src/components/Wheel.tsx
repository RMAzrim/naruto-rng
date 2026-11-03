import { useEffect, useMemo, useRef } from 'react';

export interface WheelOption {
  id: string;
  label: string;
  weight?: number;
  color?: string;
}

interface WheelProps {
  options: WheelOption[];
  targetId: string | null;
  spinToken: number;
  spinning: boolean;
  onSpinEnd: () => void;
  onSpin?: () => void;
  reducedMotion?: boolean;
  disabled?: boolean;
  centerLabel?: string;
  centerSubLabel?: string;
  highlightId?: string | null;
}

const VIEW = 700;
const CX = 350;
const CY = 350;
const RADIUS = 326;

const PALETTE = [
  '#e76f51',
  '#f4a261',
  '#e9c46a',
  '#8ab17d',
  '#2a9d8f',
  '#4d8cc9',
  '#6c63b5',
  '#ad5c9d',
  '#cf566c',
  '#d98c45',
  '#86a85f',
  '#459c9a',
];

function hashLabel(label: string): number {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function polar(angleDeg: number, radius = RADIUS) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

function slicePath(startAngle: number, endAngle: number): string {
  const start = polar(startAngle);
  const end = polar(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export function Wheel({
  options,
  targetId,
  spinToken,
  spinning,
  onSpinEnd,
  onSpin,
  reducedMotion = false,
  disabled = false,
  centerLabel = 'PUTAR',
  centerSubLabel,
  highlightId = null,
}: WheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rotationRef = useRef(0);
  const lastTokenRef = useRef(0);
  const onEndRef = useRef(onSpinEnd);

  useEffect(() => {
    onEndRef.current = onSpinEnd;
  }, [onSpinEnd]);

  const segments = useMemo(() => {
    const total = options.reduce((sum, option) => {
      const weight = typeof option.weight === 'number' && Number.isFinite(option.weight)
        ? Math.max(0.0001, option.weight)
        : 1;
      return sum + weight;
    }, 0);

    let cursor = 0;
    let previousColor = '';
    return options.map((option, index) => {
      const weight = typeof option.weight === 'number' && Number.isFinite(option.weight)
        ? Math.max(0.0001, option.weight)
        : 1;
      const share = weight / total;
      const start = cursor * 360;
      cursor += share;
      const end = cursor * 360;

      let color = option.color ?? PALETTE[hashLabel(option.label) % PALETTE.length];
      if (color === previousColor) {
        color = PALETTE[(hashLabel(option.label) + index + 1) % PALETTE.length];
      }
      previousColor = color;

      return {
        ...option,
        start,
        end,
        mid: (start + end) / 2,
        share,
        color,
      };
    });
  }, [options]);

  useEffect(() => {
    if (!spinning || !targetId) return;
    if (lastTokenRef.current === spinToken) return;
    lastTokenRef.current = spinToken;

    const svg = svgRef.current;
    if (!svg) return;

    const targetIndex = segments.findIndex((segment) => segment.id === targetId);
    const target = segments[targetIndex >= 0 ? targetIndex : 0];
    if (!target) return;

    const from = rotationRef.current;
    const currentNorm = ((from % 360) + 360) % 360;
    const pointerNorm = ((-90 - target.mid) % 360 + 360) % 360;
    const delta = ((pointerNorm - currentNorm) % 360 + 360) % 360;
    const fullTurns = reducedMotion ? 2 : 8;
    const endRotation = from + delta + fullTurns * 360;
    const duration = reducedMotion ? 650 : 3200;
    const startTime = performance.now();
    let frame = 0;

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      const rotation = from + (endRotation - from) * eased;
      rotationRef.current = rotation;
      svg.style.transform = `rotate(${rotation}deg)`;

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        rotationRef.current = endRotation;
        svg.style.transform = `rotate(${endRotation}deg)`;
        onEndRef.current();
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [spinToken, spinning, targetId, segments, reducedMotion]);

  const showLabels = options.length <= 30;

  return (
    <div className="wheel-stage">
      <div className="wheel-pointer" aria-hidden="true" />

      <svg
        ref={svgRef}
        className="wheel-svg"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        role="img"
        aria-label={`Roda undian dengan ${options.length} pilihan`}
      >
        <circle cx={CX} cy={CY} r={RADIUS + 10} fill="rgba(8, 5, 10, 0.55)" />
        {segments.map((segment) => (
          <path
            key={segment.id}
            d={slicePath(segment.start, segment.end)}
            fill={segment.color}
            stroke={segment.id === highlightId ? '#fff6d8' : 'rgba(255, 248, 236, 0.34)'}
            strokeWidth={segment.id === highlightId ? 5 : 2}
          />
        ))}

        {showLabels && segments.map((segment) => {
          const label = segment.label;
          const fontSize = Math.max(9, Math.min(19, Math.floor(330 / Math.max(label.length, 10))));
          const flipped = segment.mid > 90 && segment.mid < 270;

          return (
            <g
              key={`label-${segment.id}`}
              transform={
                flipped
                  ? `translate(${CX} ${CY}) rotate(${segment.mid + 180})`
                  : `translate(${CX} ${CY}) rotate(${segment.mid})`
              }
              pointerEvents="none"
            >
              <text
                x={flipped ? -312 : 312}
                y={0}
                textAnchor={flipped ? 'start' : 'end'}
                dominantBaseline="middle"
                fontSize={fontSize}
                fontWeight={800}
                fill="#fffdf6"
                stroke="rgba(20, 10, 5, 0.55)"
                strokeWidth={3}
                paintOrder="stroke"
                style={{ letterSpacing: '0.01em' }}
              >
                {label}
              </text>
            </g>
          );
        })}

        <circle
          cx={CX}
          cy={CY}
          r={RADIUS + 10}
          fill="none"
          stroke="rgba(255, 248, 236, 0.4)"
          strokeWidth={3}
          strokeDasharray="2 12"
        />
      </svg>

      <button
        type="button"
        className={`wheel-center${spinning ? ' is-spinning' : ''}`}
        onClick={onSpin}
        disabled={disabled || spinning || !onSpin}
        aria-label={spinning ? 'Roda sedang berputar' : `${centerLabel} roda undian`}
      >
        <span className="wheel-center-main">{spinning ? '···' : centerLabel}</span>
        <span className="wheel-center-sub">
          {spinning ? 'BERPUTAR' : centerSubLabel ?? (disabled ? 'TERKUNCI' : 'KLIK')}
        </span>
      </button>
    </div>
  );
}
