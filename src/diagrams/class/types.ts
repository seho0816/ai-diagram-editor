
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
    | 'generalization';

export type UmlEdgeData = {
    relationType: UmlRelationType;
};

export type UmlDiagramEdge = Edge<
    UmlEdgeData,
    'umlEdge'
>;
