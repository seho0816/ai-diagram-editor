
import {
    BaseEdge,
    getSmoothStepPath,
    Position,
    type EdgeProps,
} from '@xyflow/react';

import type {
    UmlDiagramEdge,
    UmlRelationType,
} from './types';

// 연결점 근처에 다중성을 표시할 좌표
function getMultiplicityPosition(
    x: number,
    y: number,
    position: Position
) {
    switch (position) {
        case Position.Top:
            return { x: x + 12, y: y - 17, anchor: 'start' as const };

        case Position.Bottom:
            return { x: x + 12, y: y + 22, anchor: 'start' as const };

        case Position.Left:
            return { x: x - 24, y: y - 12, anchor: 'end' as const };

        case Position.Right:
            return { x: x + 24, y: y - 12, anchor: 'start' as const };
    }
}

// 관계 종류별 화살표 모양
function EdgeMarker({
                        id,
                        relationType,
                        color,
                    }: {
    id: string;
    relationType: UmlRelationType;
    color: string;
}) {
    if (relationType === 'association') {
        return null;
    }

    let shape;

    switch (relationType) {
        case 'generalization':
            // 빈 삼각형
            shape = (
                <path
                    d="M3 2 L24 12 L3 22 Z"
                    fill="white"
                    stroke={color}
                    strokeWidth="1.5"
                />
            );
            break;

        case 'aggregation':
            // 빈 마름모
            shape = (
                <path
                    d="M2 12 L13 3 L24 12 L13 21 Z"
                    fill="white"
                    stroke={color}
                    strokeWidth="1.5"
                />
            );
            break;

        case 'composition':
            // 채워진 마름모
            shape = (
                <path
                    d="M2 12 L13 3 L24 12 L13 21 Z"
                    fill={color}
                    stroke={color}
                    strokeWidth="1.5"
                />
            );
            break;

        case 'dependency':
            // 열린 화살표
            shape = (
                <path
                    d="M3 3 L24 12 L3 21"
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                />
            );
            break;
    }

    return (
        <defs>
            <marker
                id={id}
                markerWidth="28"
                markerHeight="24"
                refX="24"
                refY="12"
                orient="auto"
                markerUnits="userSpaceOnUse"
            >
                {shape}
            </marker>
        </defs>
    );
}

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
                 }: EdgeProps<UmlDiagramEdge>) {

    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 5,
    });

    const relationType =
        data?.relationType ?? 'association';

    const color = selected ? '#2563eb' : '#334155';

    const markerId = `uml-marker-${id.replace(
        /[^a-zA-Z0-9_-]/g,
        '-'
    )}`;

    const sourceLabel = getMultiplicityPosition(
        sourceX,
        sourceY,
        sourcePosition
    );

    const targetLabel = getMultiplicityPosition(
        targetX,
        targetY,
        targetPosition
    );

    return (
        <>
            <EdgeMarker
                id={markerId}
                relationType={relationType}
                color={color}
            />

            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={
                    relationType === 'association'
                        ? undefined
                        : `url(#${markerId})`
                }
                style={{
                    stroke: color,
                    strokeWidth: selected ? 2.5 : 1.75,
                    strokeDasharray:
                        relationType === 'dependency'
                            ? '6 4'
                            : undefined,
                }}
                interactionWidth={24}
            />

            {/* 시작 클래스 쪽 다중성 */}
            {data?.sourceMultiplicity && (
                <text
                    x={sourceLabel.x}
                    y={sourceLabel.y}
                    textAnchor={sourceLabel.anchor}
                    fontSize={12}
                    fontWeight={600}
                    fill={color}
                    stroke="white"
                    strokeWidth={4}
                    paintOrder="stroke"
                    pointerEvents="none"
                >
                    {data.sourceMultiplicity}
                </text>
            )}

            {/* 도착 클래스 쪽 다중성 */}
            {data?.targetMultiplicity && (
                <text
                    x={targetLabel.x}
                    y={targetLabel.y}
                    textAnchor={targetLabel.anchor}
                    fontSize={12}
                    fontWeight={600}
                    fill={color}
                    stroke="white"
                    strokeWidth={4}
                    paintOrder="stroke"
                    pointerEvents="none"
                >
                    {data.targetMultiplicity}
                </text>
            )}
        </>
    );
}

export default UmlEdge;
