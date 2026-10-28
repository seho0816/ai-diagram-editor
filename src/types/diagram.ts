import type {
    ClassDiagramNode,
    UmlDiagramEdge,
    UmlRelationType as ClassRelationType,
} from '../diagrams/class/types';

import type {
    ActorNode,
    UseCaseNode,
    BoundaryNode,
    UseCaseRelationType,
} from '../diagrams/USE_CASE/types';

export type {
    ClassDiagramNode,
    ClassNodeData,
    UmlEdgeData,
    UmlDiagramEdge,
} from '../diagrams/class/types';

export type {
    ActorNode,
    UseCaseNode,
    BoundaryNode,
    ActorNodeData,
    UseCaseNodeData,
    BoundaryNodeData,
} from '../diagrams/USE_CASE/types';

export type DiagramType =
    | 'CLASS'
    | 'USE_CASE'
    | 'FLOWCHART';

// 관계선 타입 통합 (기존 연관/상속 + 유스케이스 포함/확장)
export type UmlRelationType =
    | ClassRelationType
    | UseCaseRelationType;

// 전체 노드 및 엣지 타입 통합
export type DiagramNode =
    | ClassDiagramNode
    | ActorNode
    | UseCaseNode
    | BoundaryNode;

export type DiagramEdge = UmlDiagramEdge;