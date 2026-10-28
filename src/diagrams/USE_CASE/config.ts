import ActorNode from './ActorNode';
import UseCaseNode from './UseCaseNode';
import BoundaryNode from './BoundaryNode';
import UmlEdge from './UmlEdge';
import type { DiagramType } from '../../types/diagram';

export const useCaseDiagramConfig = {
  diagramType: 'USE_CASE' as DiagramType,

  nodeTypes: {
    actorNode: ActorNode,
    useCaseNode: UseCaseNode,
    boundaryNode: BoundaryNode,
  },

  edgeTypes: {
    umlEdge: UmlEdge,
  },

  tools: {
    nodes: [
      { type: 'actorNode', label: '액터' },
      { type: 'useCaseNode', label: '유스케이스' },
      { type: 'boundaryNode', label: '시스템 경계' },
    ],
    relations: [
      { type: 'association', label: '연관' },
      { type: 'include', label: '포함 (<<include>>)' },
      { type: 'extend', label: '확장 (<<extend>>)' },
      { type: 'generalization', label: '일반화' },
    ],
  },
} as const;