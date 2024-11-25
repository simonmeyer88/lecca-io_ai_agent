import { EdgeProps, getBezierPath } from 'reactflow';

import '../edge-types.css';

// the placeholder edges do not have a special functionality, only used as a visual
function PlaceholderEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <path
      id={id}
      style={style}
      className={'workflow-placeholderPath'}
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
}

export default PlaceholderEdge;
