import type { Connection } from '@xyflow/react';                  // 2026-11-12 추가
import type { DiagramModule } from '../diagramModule';
import type { DiagramNode } from '../../types/diagram';
import type { DiagramRelationType } from '../toolPanelTypes';     // 2026-11-12 추가
// import { classDiagramActions } from '../class/actions';        // 2026-11-12 삭제 (이전 코드)

// 2026-11-12 추가: 유스케이스 관계선 4종을 그대로 저장하는 전용 함수
const useCaseRelationTypes = ['association', 'include', 'extend', 'generalization'];

function normalizeUseCaseRelation(type: DiagramRelationType): string {
  return useCaseRelationTypes.includes(type) ? type : 'association';
}

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

  // 이전 코드 (2026-11-12 교체됨): createEdge: classDiagramActions.createEdge,
  // 2026-11-12 수정: 클래스의 createEdge를 쓰면 include/extend가 association으로 바뀌어서 유스케이스 전용으로 분리
  createEdge: ((connection: Connection, type: DiagramRelationType) => ({
    id: crypto.randomUUID(),
    source: connection.source,
    sourceHandle: connection.sourceHandle,
    target: connection.target,
    targetHandle: connection.targetHandle,
    type: 'umlEdge',
    data: { relationType: normalizeUseCaseRelation(type) },
  })) as any,
};