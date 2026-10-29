import type { Node, Edge } from '@xyflow/react';

// 다이어그램 종류 (대소문자 및 문자열 모두 허용)
export type DiagramType = 'class' | 'usecase' | 'sequence' | 'CLASS' | 'USE_CASE' | 'FLOWCHART' | string;

// 노드 데이터 인터페이스
export interface ClassDiagramNodeData {
  className: string;
  attributes: string[];
  methods: string[];
  [key: string]: unknown;
}

export interface ActorNodeData {
  label: string;
  [key: string]: unknown;
}

export interface UseCaseNodeData {
  label: string;
  [key: string]: unknown;
}

export interface BoundaryNodeData {
  title: string;
  width: number;
  height: number;
  [key: string]: unknown;
}

// 각 노드 및 에지 타입
export type ClassDiagramNode = Node<ClassDiagramNodeData, 'classNode'>;
export type ActorNode = Node<ActorNodeData, 'actorNode'>;
export type UseCaseNode = Node<UseCaseNodeData, 'useCaseNode'>;
export type BoundaryNode = Node<BoundaryNodeData, 'boundaryNode'>;

export type DiagramNode =
  | ClassDiagramNode
  | ActorNode
  | UseCaseNode
  | BoundaryNode;

export type UmlRelationType =
  | 'association'
  | 'generalization'
  | 'dependency'
  | 'include'
  | 'extend'
  | string;

export interface UmlEdgeData {
  relationType: UmlRelationType;
  [key: string]: unknown;
}

export type DiagramEdge = Edge<UmlEdgeData, 'umlEdge'>;