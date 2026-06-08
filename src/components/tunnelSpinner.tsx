import { useMemo } from "react";

type TunnelSpinnerProps = {
  radius?: number;
  count?: number;
};

export default function TunnelSpinner({ radius = 120, count = 80 }: TunnelSpinnerProps) {

  const particles = useMemo(() => Array.from({ length: count }), [count]);
  const duration = 3;

  return (
    <div className="spinner">

      {particles.map((_, i) => {

        const angle = (i / count) * 360;
        const delay = (i * duration) / count;

        return (
          <i
            key={i}
            style={{
              transform: `rotate(${angle}deg) translate3d(${radius}px,0,0)`
            }}
          >
            <b style={{ animationDelay: `${delay}s` }} />
          </i>
        );
      })}

    </div>
  );
}
