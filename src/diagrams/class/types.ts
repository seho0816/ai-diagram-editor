
import type { Node, Edge } from '@xyflow/react';

export type ClassNodeData = {
    className: string;
    attributes: string[];
    methods: string[];
};

export type ClassDiagramNode = Node<
    ClassNodeData,
    'classNode'
>;


export type UmlRelationType =
    | 'association'
    | 'generalization'
    | 'aggregation'
    | 'composition'
    | 'dependency';

export type UmlEdgeData = {
    relationType: UmlRelationType;

    // 시작 클래스 가까이에 표시할 다중성
    sourceMultiplicity?: string;

    // 도착 클래스 가까이에 표시할 다중성
    targetMultiplicity?: string;
};

export type UmlDiagramEdge = Edge<
    UmlEdgeData,
    'umlEdge'
>;
