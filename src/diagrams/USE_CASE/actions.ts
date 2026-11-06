import type { DiagramModule } from '../diagramModule';
import { classDiagramActions } from '../class/actions';

// 기존 App.tsx에는 USE_CASE 초기화·노드 생성·관계선 생성 구현이 없었음.
// 이번 단계에서는 기존 fallback을 유지하며 새로운 유스케이스 기능을 추가하지 않음.
// 팀원은 이 파일을 확장하면서 공통 App.tsx를 수정하지 않도록 한다.
export const useCaseDiagramActions: DiagramModule = {
  initialNodes: classDiagramActions.initialNodes,
  initialEdges: classDiagramActions.initialEdges,
  defaultRelationType: 'association',
  createNode: () => null,
  createEdge: classDiagramActions.createEdge,
};
