import { flowchartDiagramConfig } from './config';
import type { RelationToolProps } from '../toolPanelTypes';

type Props = RelationToolProps & {
  onAddNode: (toolType: string) => void;
};

function FlowchartToolPanel({
  onAddNode,
  relationType,
  onSelectRelationType,
  onApplyRelationToSelected,
  hasSelectedEdge,
}: Props) {
  return (
    <>
          <div className="tool-section">
            <h4>도형</h4>
            {flowchartDiagramConfig.tools.nodes.map((tool) => (
              <button
                key={tool.type}
                type="button"
                className="relation-tool"
                onClick={() => onAddNode(tool.type)}
              >
                {tool.label}
              </button>
            ))}
          </div>
          <div className="tool-section">
            <h4>연결선 종류</h4>
            {flowchartDiagramConfig.tools.relations.map((tool) => (
              <button
                key={tool.type}
                type="button"
                className={`relation-tool ${
                  relationType === tool.type ? 'active' : ''
                }`}
                onClick={() => onSelectRelationType(tool.type)}
              >
                {tool.label}
              </button>
            ))}
            <button
              type="button"
              className="sidebar-action-button"
              style={{ marginTop: '8px' }}
              onClick={onApplyRelationToSelected}
              disabled={!hasSelectedEdge}
            >
              선택한 연결선 종류 변경
            </button>
          </div>
    </>
  );
}

export default FlowchartToolPanel;
