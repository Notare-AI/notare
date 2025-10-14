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

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, stroke: 'blue', strokeWidth: 2 }} />
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
            fill="blue"
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