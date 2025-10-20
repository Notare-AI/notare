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
  selected,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeColor = selected ? '#3b82f6' : 'hsl(var(--primary))';
  const strokeWidth = selected ? 3 : 2;

  const edgeStyle = {
    ...style,
    stroke: strokeColor,
    strokeWidth: strokeWidth,
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
            fill={strokeColor}
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