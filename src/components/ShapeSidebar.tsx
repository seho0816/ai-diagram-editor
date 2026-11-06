import { useState } from 'react';
import DiagramToolGroup from './DiagramToolGroup';
import ClassToolPanel from '../diagrams/class/ClassToolPanel';
import UseCaseToolPanel from '../diagrams/USE_CASE/UseCaseToolPanel';
import FlowchartToolPanel from '../diagrams/flowchart/FlowchartToolPanel';
import type { DiagramRelationType } from '../diagrams/toolPanelTypes';
import type { DiagramType } from '../types/diagram';

export interface ShapeSidebarProps {
  diagramType?: DiagramType;
  onAddNode: (diagramType: DiagramType, toolType: string) => void;
  relationType: DiagramRelationType;
  onSelectRelationType: (type: DiagramRelationType) => void;
  onApplyRelationToSelected: () => void;
  onDeleteSelected: () => void;
  hasSelectedEdge: boolean;
  hasSelection: boolean;
}

function ShapeSidebar({
  diagramType = 'CLASS',
  onAddNode,
  relationType,
  onSelectRelationType,
  onApplyRelationToSelected,
  onDeleteSelected,
  hasSelectedEdge,
  hasSelection,
}: ShapeSidebarProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(String(diagramType));
  const toggleGroup = (groupKey: string) => {
    setExpandedGroup((current) => (current === groupKey ? null : groupKey));
  };

  return (
    <aside className="shape-sidebar">
      <h3 style={{ margin: '12px 16px', fontSize: '16px', fontWeight: 600 }}>
        다이어그램 도구
      </h3>

      {diagramType !== 'FLOWCHART' ? (
        <>
          <DiagramToolGroup
            title="클래스"
            isOpen={expandedGroup === 'class' || expandedGroup === 'CLASS'}
            onToggle={() => toggleGroup('CLASS')}
          >
            <ClassToolPanel
              onAddNode={(toolType) => onAddNode('CLASS', toolType)}
              relationType={relationType}
              onSelectRelationType={onSelectRelationType}
            />
          </DiagramToolGroup>

          <DiagramToolGroup
            title="유스케이스"
            isOpen={expandedGroup === 'usecase' || expandedGroup === 'USE_CASE'}
            onToggle={() => toggleGroup('USE_CASE')}
          >
            <UseCaseToolPanel
              onAddNode={(toolType) => onAddNode('USE_CASE', toolType)}
              relationType={relationType}
              onSelectRelationType={onSelectRelationType}
              onApplyRelationToSelected={onApplyRelationToSelected}
              hasSelectedEdge={hasSelectedEdge}
            />
          </DiagramToolGroup>
        </>
      ) : (
        <DiagramToolGroup
          title="플로우차트"
          isOpen
          onToggle={() => toggleGroup('FLOWCHART')}
        >
          <FlowchartToolPanel
            onAddNode={(toolType) => onAddNode('FLOWCHART', toolType)}
            relationType={relationType}
            onSelectRelationType={onSelectRelationType}
            onApplyRelationToSelected={onApplyRelationToSelected}
            hasSelectedEdge={hasSelectedEdge}
          />
        </DiagramToolGroup>
      )}

      <div className="tool-section sidebar-edit-section" style={{ marginTop: '16px' }}>
        <h4>공통 편집</h4>
        <button
          type="button"
          className="sidebar-action-button delete-tool"
          onClick={onDeleteSelected}
          disabled={!hasSelection}
        >
          선택한 요소 삭제
        </button>
      </div>
    </aside>
  );
}

export default ShapeSidebar;
