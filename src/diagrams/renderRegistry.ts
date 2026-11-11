import { classDiagramConfig } from './class/config';
import { flowchartDiagramConfig } from './flowchart/config';
import { useCaseDiagramConfig } from './USE_CASE/config';
import ActorNode from './USE_CASE/ActorNode';     // 액터(졸라맨) 컴포넌트
import UseCaseNode from './USE_CASE/UseCaseNode'; // 유스케이스(타원) 컴포넌트

// 다이어그램별 노드·관계선 컴포넌트 통합 등록
// 다이어그램별 컴포넌트는 각 담당 config.ts에서 등록하고,
// USE_CASE의 액터/유스케이스 노드는 아래에서 직접 매핑해 확실히 등록한다.
export const nodeTypes = {
  ...classDiagramConfig.nodeTypes,
  ...flowchartDiagramConfig.nodeTypes,
  ...useCaseDiagramConfig.nodeTypes,
  actor: ActorNode,
  usecase: UseCaseNode,
};

export const edgeTypes = {
  ...classDiagramConfig.edgeTypes,
  ...flowchartDiagramConfig.edgeTypes,
  ...useCaseDiagramConfig.edgeTypes,
};

// 기존 코드에서 updatedNodeTypes / updatedEdgeTypes를 import하던 곳이 있어도
// 깨지지 않도록 같은 객체를 별칭으로 남겨둠 (모두 교체한 뒤 삭제해도 됨)
export const updatedNodeTypes = nodeTypes;
export const updatedEdgeTypes = edgeTypes;