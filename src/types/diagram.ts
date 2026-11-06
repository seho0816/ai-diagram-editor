
import type {
    ClassDiagramNode,
    UmlDiagramEdge,
} from '../diagrams/class/types';
import type {
    FlowchartDiagramNode,
    FlowchartDiagramEdge,
} from '../diagrams/flowchart/types';

export type {
    ClassDiagramNode,
    ClassNodeData,
    UmlRelationType,
    UmlEdgeData,
    UmlDiagramEdge,
} from '../diagrams/class/types';
export type {
    FlowchartDiagramNode,
    FlowchartDiagramEdge,
    FlowchartNodeData,
    FlowchartShape,
    FlowchartEdgeData,
    FlowchartRelationType,
} from '../diagrams/flowchart/types';
export type { UseCaseRelationType } from '../diagrams/USE_CASE/types';

export type DiagramType =
    | 'CLASS'
    | 'FLOWCHART'
    | 'USE_CASE';

export type DiagramNode =
    | ClassDiagramNode
    | FlowchartDiagramNode;
export type DiagramEdge =
    | UmlDiagramEdge
    | FlowchartDiagramEdge;
