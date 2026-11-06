import { classDiagramConfig } from './class/config';
import { flowchartDiagramConfig } from './flowchart/config';

// 현재 DiagramCanvas에서 사용하던 노드/관계선 등록을 이 파일로 옮김.
// 다이어그램별 노드·관계선 컴포넌트는 각 담당 config.ts에서 등록한다.
export const nodeTypes = {
  ...classDiagramConfig.nodeTypes,
  ...flowchartDiagramConfig.nodeTypes,
};

export const edgeTypes = {
  ...classDiagramConfig.edgeTypes,
  ...flowchartDiagramConfig.edgeTypes,
};

// =====================================================================
// 작성일: 2026-11-07 02:00 이규찬 수정
// 설명: 기존 다이어그램별 설정(Class, Flowchart, UseCase)을 통합하면서,
//       USE_CASE의 액터와 유스케이스 커스텀 노드를 직접 매핑하여 등록하도록 수정된 버전입니다.
// =====================================================================
import { useCaseDiagramConfig } from './USE_CASE/config';
import ActorNode from './USE_CASE/ActorNode';     // 액터(졸라맨) 컴포넌트
import UseCaseNode from './USE_CASE/UseCaseNode'; // 유스케이스(타원) 컴포넌트

// 다이어그램별 노드·관계선 컴포넌트 통합 등록  actor: ActorNode, usecase: UseCaseNode, 추가 
export const updatedNodeTypes = {
  ...nodeTypes,
  ...useCaseDiagramConfig.nodeTypes,
  actor: ActorNode,
  usecase: UseCaseNode,
};

export const updatedEdgeTypes = {
  ...edgeTypes,
  ...useCaseDiagramConfig.edgeTypes,
};