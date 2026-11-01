
import ClassNode from './ClassNode';
import UmlEdge from './UmlEdge';

export const classDiagramConfig = {
    diagramType: 'CLASS',

    nodeTypes: {
        classNode: ClassNode,
    },

    edgeTypes: {
        umlEdge: UmlEdge,
    },

    tools: {
        nodes: [
            { type: 'classNode', label: '클래스' },
        ],
        relations: [
            { type: 'association', label: '연관' },
            { type: 'generalization', label: '상속' },
            { type: 'aggregation', label: '집합' },
            { type: 'composition', label: '합성' },
            { type: 'dependency', label: '의존' },
        ],
    },
} as const;
