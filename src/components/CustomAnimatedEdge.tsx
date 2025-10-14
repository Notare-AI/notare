import { BaseEdge, getSmoothStepPath, EdgeProps } from '@xyflow/react';

export default function CustomAnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  animated,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeStyle = {
    ...style,
    stroke: 'hsl(var(--primary))',
    strokeWidth: 2,
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      {animated && (
        <>
          <path
            id={`${id}-animation-path`}
            d={edgePath}
            fill="none"
            stroke="none"
          />
          <rect
            width="8"
            height="8"
            x="-4"
            y="-4"
            fill="hsl(var(--primary))"
            rx="1"
            ry="1"
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
            >
              <mpath href={`#${id}-animation-path`} />
            </animateMotion>
          </rect>
        </>
      )}
    </>
  );
}