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

// =====================================================================
      // 아래부터 신규 추가된 노드 타입 생성 분기 2026-11-07 01:20분추가 
// =====================================================================
import { SubsystemNode } from './SubsystemNode';
import { ExternalSystemNode } from './ExternalSystemNode';
import { NoteNode } from './NoteNode';

// 기존 config 객체에 새 노드 타입 및 툴바 항목 확장 주입
(useCaseDiagramConfig.nodeTypes as any).subsystem = SubsystemNode;
(useCaseDiagramConfig.nodeTypes as any).externalSystem = ExternalSystemNode;
(useCaseDiagramConfig.nodeTypes as any).note = NoteNode;

(useCaseDiagramConfig.tools.nodes as any).push(
  { type: 'subsystem', label: '서브시스템' },
  { type: 'externalSystem', label: '외부 시스템' },
  { type: 'note', label: '노트 주석' }
);