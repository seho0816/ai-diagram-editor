import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    type EdgeProps,
} from '@xyflow/react';
import type { FlowchartDiagramEdge } from './types';

const relationStyles = {
    flow: { color: '#475569', dash: undefined, label: undefined },
    yes: { color: '#16a34a', dash: '7 4', label: '예' },
    no: { color: '#dc2626', dash: '12 4', label: '아니오' },
} as const;

function FlowchartEdge(props: EdgeProps<FlowchartDiagramEdge>) {
    const {
        id, sourceX, sourceY, targetX, targetY,
        sourcePosition, targetPosition, data, selected,
    } = props;

    // 라벨 좌표는 path 계산 결과를 사용해야 합니다.
    const [path, labelX, labelY] = getSmoothStepPath({
        sourceX, sourceY, targetX, targetY,
        sourcePosition, targetPosition,
        borderRadius: 8,
    });

    const relation = data?.relationType ?? 'flow';
    const style = relationStyles[relation];
    const color = selected ? '#2563eb' : style.color;
    const markerId = `flow-arrow-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

    return (
        <>
            <defs>
                <marker
                    id={markerId}
                    markerWidth="10"
                    markerHeight="10"
                    refX="8"
                    refY="5"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
                </marker>
            </defs>
            <BaseEdge
                id={id}
                path={path}
                markerEnd={`url(#${markerId})`}
                style={{
                    stroke: color,
                    strokeWidth: selected ? 2.8 : 2,
                    strokeDasharray: style.dash,
                }}
                interactionWidth={22}
            />
            {style.label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                            pointerEvents: 'none',
                            background: '#fff',
                            padding: '2px 6px',
                            borderRadius: 4,
                            color,
                            fontSize: 12,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                        }}
                        className="nodrag nopan"
                    >
                        {style.label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export default FlowchartEdge;
