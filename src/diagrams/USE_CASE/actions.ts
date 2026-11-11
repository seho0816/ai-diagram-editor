import type { DiagramModule } from '../diagramModule';
import type { DiagramNode } from '../../types/diagram';
import { classDiagramActions } from '../class/actions';

export const useCaseDiagramActions: DiagramModule = {
  initialNodes: [],
  initialEdges: [],
  defaultRelationType: 'association',

  // App.tsx가 createNode(toolType, currentNodes)로 호출한다.
  createNode: ((toolType: string, currentNodes: DiagramNode[] = []) => {
    const id = `${toolType}_${Date.now()}`;

    // 노드 개수에 따라 조금씩 어긋나게 배치해서 겹치지 않게 한다.
    const offset = currentNodes.length % 6;
    const position = { x: 120 + offset * 40, y: 100 + offset * 40 };

    switch (toolType) {
      case 'actor':
      case 'actorNode':
        return {
          id,
          type: 'actorNode',
          position,
          style: { width: 90, height: 100 },
          data: { label: '새 액터' },
        };
      case 'usecase':
      case 'useCaseNode':
        return {
          id,
          type: 'useCaseNode',
          position,
          style: { width: 150, height: 75 },
          data: { label: '새 유스케이스' },
        };
      case 'boundary':
      case 'boundaryNode':
        return {
          id,
          type: 'boundaryNode',
          position,
          zIndex: -1, // 다른 노드 뒤로 보내기
          style: { width: 300, height: 400 },
          data: { title: '시스템 경계' },
        };
      case 'subsystem':
        return {
          id,
          type: 'subsystem',
          position,
          style: { width: 260, height: 180 },
          data: { label: '서브시스템' },
        };
      case 'externalSystem':
        return {
          id,
          type: 'externalSystem',
          position,
          style: { width: 130, height: 50 },
          data: { label: '외부 시스템' },
        };
      case 'note':
        return {
          id,
          type: 'note',
          position,
          style: { width: 130, height: 50 },
          data: { label: '노트 주석' },
        };
      default:
        return {
          id,
          type: 'useCaseNode',
          position,
          style: { width: 150, height: 75 },
          data: { label: '새 노드' },
        };
    }
  }) as any,

  createEdge: classDiagramActions.createEdge,
};