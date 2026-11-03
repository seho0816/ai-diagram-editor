import FlowchartNode from './FlowchartNode';
import FlowchartEdge from './FlowchartEdge';

export const flowchartDiagramConfig = {
    diagramType: 'FLOWCHART',
    nodeTypes: {
        flowchartNode: FlowchartNode,
    },
    edgeTypes: {
        flowchartEdge: FlowchartEdge,
    },
    tools: {
        nodes: [
            { type: 'startEnd', label: '시작 / 종료' },
            { type: 'process', label: '처리' },
            { type: 'decision', label: '조건' },
            { type: 'inputOutput', label: '입력 / 출력' },
        ],
        relations: [
            { type: 'flow', label: '흐름' },
            { type: 'yes', label: '예 (YES)' },
            { type: 'no', label: '아니오 (NO)' },
        ],
    },
} as const;
