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
  const isGeneralization = relationType === 'generalization'; // 2026-11-12 추가

  const color = selected ? '#2563eb' : '#334155'; // 2026-11-12 추가: 선과 마커 색을 같이 쓰기 위해 분리

  // 2026-11-12 추가: 관계별 화살표 마커 (엣지 id별로 따로 만들어 색 충돌 방지)
  const hollowTriangleId = `usecase-hollow-triangle-${id}`;
  const openArrowId = `usecase-open-arrow-${id}`;

  let markerEnd: string | undefined; // 2026-11-12 추가
  if (isGeneralization) markerEnd = `url(#${hollowTriangleId})`;
  else if (isIncludeOrExtend) markerEnd = `url(#${openArrowId})`;

  return (
    <>
      {/* 2026-11-12 추가: 마커 정의 */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          {/* 일반화: 속이 빈 삼각형 */}
          <marker
            id={hollowTriangleId}
            viewBox="0 0 12 12"
            refX="11"
            refY="6"
            markerWidth="12"
            markerHeight="12"
            orient="auto-start-reverse"
          >
            <path d="M1 1 L11 6 L1 11 Z" fill="#ffffff" stroke={color} strokeWidth="1.5" />
          </marker>
          {/* 포함/확장: 열린 화살표 */}
          <marker
            id={openArrowId}
            viewBox="0 0 12 12"
            refX="11"
            refY="6"
            markerWidth="10"
            markerHeight="10"
            orient="auto-start-reverse"
          >
            <path d="M1 1 L11 6 L1 11" fill="none" stroke={color} strokeWidth="1.5" />
          </marker>
        </defs>
      </svg>

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd} // 2026-11-12 추가
        style={{
          stroke: color, // 2026-11-12 수정: 기존 selected 삼항식 → color 변수 사용
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