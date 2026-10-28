import type { Node, Edge } from '@xyflow/react';

// 유스케이스 노드 데이터
export type ActorNodeData = {
  label: string;
};

export type UseCaseNodeData = {
  label: string;
};

export type BoundaryNodeData = {
  title: string;
  width?: number;
  height?: number;
};

// node.type으로 구분되는 유스케이스 노드
export type ActorNode = Node<ActorNodeData, 'actorNode'>;
export type UseCaseNode = Node<UseCaseNodeData, 'useCaseNode'>;
export type BoundaryNode = Node<BoundaryNodeData, 'boundaryNode'>;

export type UseCaseDiagramNode = ActorNode | UseCaseNode | BoundaryNode;

// edge.data.relationType으로 구분되는 관계선
export type UseCaseRelationType =
  | 'association'     // 연관
  | 'include'         // 포함
  | 'extend'          // 확장
  | 'generalization'; // 일반화

export type UseCaseEdgeData = {
  relationType: UseCaseRelationType;
};

export type UseCaseDiagramEdge = Edge<UseCaseEdgeData, 'umlEdge'>;