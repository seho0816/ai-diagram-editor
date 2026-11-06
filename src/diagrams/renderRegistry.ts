import { classDiagramConfig } from './class/config';
import { flowchartDiagramConfig } from './flowchart/config';

// 현재 DiagramCanvas에서 사용하던 노드/관계선 등록을 이 파일로 옮김.
// 다이어그램별 노드·관계선 컴포넌트는 각 담당 config.ts에서 등록한다.
export const nodeTypes = {
  ...classDiagramConfig.nodeTypes,
  ...flowchartDiagramConfig.nodeTypes,
};

export const edgeTypes = {
  ...classDiagramConfig.edgeTypes,
  ...flowchartDiagramConfig.edgeTypes,
};
