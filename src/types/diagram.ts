
import type {
    ClassDiagramNode,
    UmlDiagramEdge,
} from '../diagrams/class/types';

export type {
    ClassDiagramNode,
    ClassNodeData,
    UmlRelationType,
    UmlEdgeData,
    UmlDiagramEdge,
} from '../diagrams/class/types';

export type DiagramType =
    | 'CLASS'
    | 'USE_CASE'
    | 'FLOWCHART';

export type DiagramNode = ClassDiagramNode;
export type DiagramEdge = UmlDiagramEdge;
