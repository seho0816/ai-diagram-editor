
import type { Node, Edge } from '@xyflow/react';

// 클래스 노드 데이터
export type ClassNodeData = {
    className: string;
    attributes: string[];
    methods: string[];
};

// 클래스 노드
export type ClassDiagramNode = Node<
    ClassNodeData,
    'classNode'
>;

// 앞으로 다른 종류의 노드가 추가될 예정
export type DiagramNode = ClassDiagramNode;

// UML 관계 종류
export type UmlRelationType =
    | 'association'
    | 'generalization';

// UML 관계선 데이터
export type UmlEdgeData = {
    relationType: UmlRelationType;
};

// UML 관계선
export type UmlDiagramEdge = Edge<
    UmlEdgeData,
    'umlEdge'
>;

// 앞으로 다른 종류의 관계선이 추가될 예정
export type DiagramEdge = UmlDiagramEdge;
