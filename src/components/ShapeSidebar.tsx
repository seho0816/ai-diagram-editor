import { useState } from 'react';
import DiagramToolGroup from './DiagramToolGroup';
import { classDiagramConfig } from '../diagrams/class/config';
import { useCaseDiagramConfig } from '../diagrams/USE_CASE/config';

import type { DiagramType, UmlRelationType } from '../types/diagram';

export interface ShapeSidebarProps {
  diagramType?: DiagramType;
  onAddClass: () => void;
  onAddActor?: () => void;
  onAddUseCase?: () => void;
  onAddBoundary?: () => void;
  relationType: UmlRelationType;
  onSelectRelationType: (type: any) => void;
  onApplyRelationToSelected: () => void;
  onDeleteSelected: () => void;
  hasSelectedEdge: boolean;
  hasSelection: boolean;
}

function ShapeSidebar({
  diagramType = 'class',
  onAddClass,
  onAddActor,
  onAddUseCase,
  onAddBoundary,
  relationType,
  onSelectRelationType,
  onApplyRelationToSelected,
  onDeleteSelected,
  hasSelectedEdge,
  hasSelection,
}: ShapeSidebarProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(
    String(diagramType)
  );

  const toggleGroup = (groupKey: string) => {
    setExpandedGroup((current) => (current === groupKey ? null : groupKey));
  };

  return (
    <aside className="shape-sidebar">
      <h3 style={{ margin: '12px 16px', fontSize: '16px', fontWeight: 600 }}>
        다이어그램 도구
      </h3>

      {/* 1. 클래스 다이어그램 */}
      <DiagramToolGroup
        title="클래스"
        isOpen={expandedGroup === 'class' || expandedGroup === 'CLASS'}
        onToggle={() => toggleGroup('class')}
      >
        <div className="tool-section">
          <h4>도형</h4>
          <button type="button" className="class-tool" onClick={onAddClass}>
            <div style={{ fontWeight: 'bold' }}>ClassName</div>
            <div style={{ fontSize: '11px', color: '#666' }}>+ attributes</div>
            <div style={{ fontSize: '11px', color: '#666' }}>+ methods()</div>
          </button>
        </div>

        <div className="tool-section">
          <h4>관계선</h4>
          {classDiagramConfig.tools.relations.map((tool) => (
            <button
              key={tool.type}
              type="button"
              className={`relation-tool ${
                relationType === tool.type ? 'active' : ''
              }`}
              onClick={() => onSelectRelationType(tool.type)}
            >
              <span className="relation-symbol">
                {tool.type === 'association' ? '────' : '──▷'}
              </span>
              {tool.label}
            </button>
          ))}
        </div>
      </DiagramToolGroup>

      {/* 2. 유스케이스 다이어그램 (draw.io 라이브러리 스타일) */}
      <DiagramToolGroup
        title="유스케이스"
        isOpen={expandedGroup === 'usecase' || expandedGroup === 'USE_CASE'}
        onToggle={() => toggleGroup('usecase')}
      >
        <div className="tool-section">
          <h4>요소 라이브러리</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              padding: '4px 0',
            }}
          >
            {/* 1. 액터 카드 */}
            <button
              type="button"
              className="shape-card-btn"
              onClick={onAddActor}
              title="사용자/시스템 액터"
            >
              <svg width="24" height="28" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="6" r="4" />
                <path d="M12 10v10M6 14h12M7 28l5-8 5 8" />
              </svg>
              <span>액터</span>
            </button>

            {/* 2. 유스케이스 카드 */}
            <button
              type="button"
              className="shape-card-btn"
              onClick={onAddUseCase}
              title="유스케이스 타원"
            >
              <svg width="32" height="20" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="20" cy="12" rx="18" ry="10" />
              </svg>
              <span>유스케이스</span>
            </button>

            {/* 3. 시스템 경계 카드 */}
            <button
              type="button"
              className="shape-card-btn"
              onClick={onAddBoundary}
              title="시스템 경계 (System Boundary)"
            >
              <svg width="28" height="24" viewBox="0 0 32 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2">
                <rect x="2" y="2" width="28" height="24" rx="2" />
              </svg>
              <span>시스템 경계</span>
            </button>

            {/* 4. 서브시스템 박스 */}
            <button
              type="button"
              className="shape-card-btn"
              onClick={onAddBoundary}
              title="서브시스템 컴포넌트"
            >
              <svg width="28" height="24" viewBox="0 0 32 28" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="28" height="24" rx="2" />
                <line x1="2" y1="8" x2="30" y2="8" />
              </svg>
              <span>서브시스템</span>
            </button>

            {/* 5. 외부 시스템 (액터) */}
            <button
              type="button"
              className="shape-card-btn"
              onClick={onAddActor}
              title="외부 시스템 / 데이터베이스"
            >
              <svg width="28" height="24" viewBox="0 0 32 28" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6c0-2 5-3 12-3s12 1 12 3v16c0 2-5 3-12 3S4 24 4 22V6z" />
                <path d="M4 11c0 2 5 3 12 3s12-1 12-3M4 16c0 2 5 3 12 3s12-1 12-3" />
              </svg>
              <span>외부 시스템</span>
            </button>

            {/* 6. 메모 / 주석 노트 */}
            <button
              type="button"
              className="shape-card-btn"
              onClick={onAddUseCase}
              title="주석 노트"
            >
              <svg width="24" height="26" viewBox="0 0 28 30" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h16l6 6v18H3V3z" />
                <path d="M19 3v6h6" />
              </svg>
              <span>노트 주석</span>
            </button>
          </div>
        </div>

        <div className="tool-section">
          <h4>관계선 (Relations)</h4>
          {useCaseDiagramConfig.tools.relations.map((tool) => (
            <button
              key={tool.type}
              type="button"
              className={`relation-tool ${
                relationType === tool.type ? 'active' : ''
              }`}
              onClick={() => onSelectRelationType(tool.type)}
            >
              <span className="relation-symbol">
                {tool.type === 'association'
                  ? '────'
                  : tool.type === 'generalization'
                  ? '──▷'
                  : ' - -▷'}
              </span>
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
            선택한 관계선 종류 변경
          </button>
        </div>
      </DiagramToolGroup>

      {/* 공통 편집 */}
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