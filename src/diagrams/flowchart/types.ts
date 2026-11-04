import type { Node, Edge } from '@xyflow/react';

export type FlowchartShape =
    | 'startEnd'
    | 'process'
    | 'decision'
    | 'inputOutput';

export type FlowchartNodeData = {
    label: string;
    shape: FlowchartShape;
};

export type FlowchartDiagramNode = Node<
    FlowchartNodeData,
    'flowchartNode'
>;

export type FlowchartRelationType = 'flow' | 'yes' | 'no';

export type FlowchartEdgeData = {
    relationType: FlowchartRelationType;
};

export type FlowchartDiagramEdge = Edge<
    FlowchartEdgeData,
    'flowchartEdge'
>;
