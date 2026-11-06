import type { DiagramModule } from '../diagramModule';
import { classDiagramActions } from '../class/actions';

export const useCaseDiagramActions: DiagramModule = {
  initialNodes: [],
  initialEdges: [],
  defaultRelationType: 'association',

  createNode: ((...args: any[]) => {
    const toolType = args[0] as string;
    const position = (typeof args[1] === 'object' && 'x' in args[1] ? args[1] : args[2]) || { x: 100, y: 100 };
    const id = `${toolType}_${Date.now()}`;

    switch (toolType) {
      case 'actor':
      case 'actorNode':
        return {
          id,
          type: 'actorNode',
          position,
          data: { label: '새 액터' },
        };
      case 'usecase':
      case 'useCaseNode':
        return {
          id,
          type: 'useCaseNode',
          position,
          data: { label: '새 유스케이스' },
        };
      case 'boundary':
      case 'boundaryNode':
        return {
          id,
          type: 'boundaryNode',
          position,
          data: { label: '시스템 경계' },
        };
      // =====================================================================
      // 아래부터 신규 추가된 노드 타입 생성 분기 2026-11-07 01:20분추가
      // =====================================================================
      case 'subsystem':
        return {
          id,
          type: 'subsystem',
          position,
          data: { label: '서브시스템' },
        };
      case 'externalSystem':
        return {
          id,
          type: 'externalSystem',
          position,
          data: { label: '외부 시스템' },
        };
      case 'note':
        return {
          id,
          type: 'note',
          position,
          data: { label: '노트 주석' },
        };
      default:
        return {
          id,
          type: 'useCaseNode',
          position,
          data: { label: '새 노드' },
        };
    }
  }) as any,

  createEdge: classDiagramActions.createEdge,
};