import FlowchartNode from './FlowchartNode';
import FlowchartEdge from './FlowchartEdge';

export const flowchartDiagramConfig = {
    diagramType: 'FLOWCHART',
    nodeTypes: { flowchartNode: FlowchartNode },
    edgeTypes: { flowchartEdge: FlowchartEdge },
    tools: {
        nodes: [
            { type: 'startEnd', label: '시작/종료', group: 'basic' },
            { type: 'process', label: '처리', group: 'basic' },
            { type: 'decision', label: '조건', group: 'basic' },
            { type: 'inputOutput', label: '입력/출력', group: 'basic' },
            { type: 'document', label: '문서', group: 'extended' },
            { type: 'database', label: '데이터베이스', group: 'extended' },
            { type: 'predefined', label: '사전 정의 처리', group: 'extended' },
            { type: 'connector', label: '연결자', group: 'extended' },
            { type: 'offPage', label: '오프페이지', group: 'extended' },
            { type: 'delay', label: '지연', group: 'extended' },
            { type: 'manualInput', label: '수동 입력', group: 'extended' },
            { type: 'display', label: '표시', group: 'extended' },
        ],
        relations: [
            { type: 'flow', label: '흐름' },
            { type: 'yes', label: '예' },
            { type: 'no', label: '아니오' },
        ],
    },
} as const;
