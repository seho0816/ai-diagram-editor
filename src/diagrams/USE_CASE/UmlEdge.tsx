import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import type { UseCaseDiagramEdge } from './types';

function UmlEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<UseCaseDiagramEdge>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const relationType = data?.relationType || 'association';
  const isIncludeOrExtend = relationType === 'include' || relationType === 'extend';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#2563eb' : '#334155',
          strokeWidth: selected ? 2.5 : 1.75,
          strokeDasharray: isIncludeOrExtend ? '5,5' : undefined,
        }}
      />
      {isIncludeOrExtend && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#fff',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              border: '1px solid #cbd5e1',
            }}
          >
            {`<<${relationType}>>`}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default UmlEdge;