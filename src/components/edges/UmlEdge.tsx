
import {
    BaseEdge,
    getSmoothStepPath,
    type EdgeProps,
} from '@xyflow/react';

import type {
    DiagramEdge,
} from '../../types/diagram';

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
                 }: EdgeProps<DiagramEdge>) {

    // 관계선의 SVG 경로 계산
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 5,
    });

    const isGeneralization =
        data?.relationType === 'generalization';

    const strokeColor = selected
        ? '#2563eb'
        : '#334155';

    // 관계선마다 고유한 SVG 마커 ID 생성
    const markerId = `uml-marker-${id.replace(
        /[^a-zA-Z0-9_-]/g,
        '-'
    )}`;

    return (
        <>
            {isGeneralization && (
                <defs>
                    <marker
                        id={markerId}
                        markerWidth="20"
                        markerHeight="18"
                        refX="17"
                        refY="9"
                        orient="auto"
                        markerUnits="userSpaceOnUse"
                    >
                        {/* UML 상속 관계: 속이 빈 삼각형 */}
                        <path
                            d="M 1 1 L 17 9 L 1 17 Z"
                            fill="#ffffff"
                            stroke={strokeColor}
                            strokeWidth="1.5"
                        />
                    </marker>
                </defs>
            )}

            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={
                    isGeneralization
                        ? `url(#${markerId})`
                        : undefined
                }
                style={{
                    stroke: strokeColor,
                    strokeWidth: selected ? 2.5 : 1.75,
                }}
                interactionWidth={24}
            />
        </>
    );
}

export default UmlEdge;
