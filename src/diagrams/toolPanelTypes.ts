import type {
  UmlRelationType,
  FlowchartRelationType,
  UseCaseRelationType,
} from '../types/diagram';

// 공통 사이드바에서 사용하는 기존 관계선 타입을 하나로 표현한다.
export type DiagramRelationType =
  | UmlRelationType
  | FlowchartRelationType
  | UseCaseRelationType;

export interface RelationToolProps {
  relationType: DiagramRelationType;
  onSelectRelationType: (type: DiagramRelationType) => void;
  onApplyRelationToSelected: () => void;
  hasSelectedEdge: boolean;
}
