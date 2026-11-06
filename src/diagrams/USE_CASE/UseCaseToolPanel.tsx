import { useState, type DragEvent } from 'react';
import type { UseCaseRelationType } from '../../types/diagram';
import type { RelationToolProps } from '../toolPanelTypes';

type Props = RelationToolProps & {
  onAddNode: (toolType: string) => void;
};

const useCaseRelations: { type: UseCaseRelationType; label: string }[] = [
  { type: 'association', label: '연관 관계' },
  { type: 'include', label: '포함 관계 (<<include>>)' },
  { type: 'extend', label: '확장 관계 (<<extend>>)' },
  { type: 'generalization', label: '일반화 관계' },
];

function UseCaseToolPanel({
  onAddNode,
  relationType,
  onSelectRelationType,
  onApplyRelationToSelected,
  hasSelectedEdge,
}: Props) {
  const [openSection, setOpenSection] = useState<'class' | 'usecase' | 'flowchart' | null>('usecase');

  const toggleSection = (section: 'class' | 'usecase' | 'flowchart') => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const handleAddNode = (type: string) => {
    onAddNode(type);
  };

  const onDragStart = (event: DragEvent<HTMLButtonElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '-8px 0 0 0' }}>
      {/* 1. 클래스 (Class) */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#ffffff' }}>
        <button
          type="button"
          onClick={() => toggleSection('class')}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: openSection === 'class' ? '#eff6ff' : '#f8fafc',
            border: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
            cursor: 'pointer',
          }}
        >
          <span>{openSection === 'class' ? '▼' : '▶'} 클래스 (Class)</span>
          <span>{openSection === 'class' ? '▲' : '▼'}</span>
        </button>

        {openSection === 'class' && (
          <div style={{ padding: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                type="button"
                className="shape-card-btn"
                onClick={() => handleAddNode('boundary')}
                draggable
                onDragStart={(e) => onDragStart(e, 'boundary')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                </svg>
                <span>클래스 상자</span>
              </button>

              <button
                type="button"
                className="shape-card-btn"
                onClick={() => handleAddNode('usecase')}
                draggable
                onDragStart={(e) => onDragStart(e, 'usecase')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="8" strokeDasharray="2 2" />
                </svg>
                <span>인터페이스</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. 유스케이스 (Use Case) */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#ffffff' }}>
        <button
          type="button"
          onClick={() => toggleSection('usecase')}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: openSection === 'usecase' ? '#eff6ff' : '#f8fafc',
            border: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
            cursor: 'pointer',
          }}
        >
          <span>{openSection === 'usecase' ? '▼' : '▶'} 유스케이스 (Use Case)</span>
          <span>{openSection === 'usecase' ? '▲' : '▼'}</span>
        </button>

        {openSection === 'usecase' && (
          <div style={{ padding: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                type="button"
                className="shape-card-btn"
                onClick={() => handleAddNode('actor')}
                draggable
                onDragStart={(e) => onDragStart(e, 'actor')}
                title="사용자/시스템 액터"
              >
                <svg width="24" height="28" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="6" r="4" />
                  <path d="M12 10v10M6 14h12M7 28l5-8 5 8" />
                </svg>
                <span>액터</span>
              </button>

              <button
                type="button"
                className="shape-card-btn"
                onClick={() => handleAddNode('usecase')}
                draggable
                onDragStart={(e) => onDragStart(e, 'usecase')}
                title="유스케이스 타원"
              >
                <svg width="32" height="20" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="20" cy="12" rx="18" ry="10" />
                </svg>
                <span>유스케이스</span>
              </button>

              <button
                type="button"
                className="shape-card-btn"
                onClick={() => handleAddNode('boundary')}
                draggable
                onDragStart={(e) => onDragStart(e, 'boundary')}
                title="시스템 경계"
              >
                <svg width="28" height="24" viewBox="0 0 32 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2">
                  <rect x="2" y="2" width="28" height="24" rx="2" />
                </svg>
                <span>시스템 경계</span>
              </button>

              {/* 🛠️ 수정됨: subsystem 타입으로 정확히 분리 */}
              <button
                type="button"
                className="shape-card-btn"
                onClick={() => handleAddNode('subsystem')}
                draggable
                onDragStart={(e) => onDragStart(e, 'subsystem')}
                title="서브시스템 컴포넌트"
              >
                <svg width="28" height="24" viewBox="0 0 32 28" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="28" height="24" rx="2" />
                  <line x1="2" y1="8" x2="30" y2="8" />
                </svg>
                <span>서브시스템</span>
              </button>

              {/* 🛠️ 수정됨: externalSystem 타입으로 정확히 분리 */}
              <button
                type="button"
                className="shape-card-btn"
                onClick={() => handleAddNode('externalSystem')}
                draggable
                onDragStart={(e) => onDragStart(e, 'externalSystem')}
                title="외부 시스템 / DB"
              >
                <svg width="28" height="24" viewBox="0 0 32 28" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6c0-2 5-3 12-3s12 1 12 3v16c0 2-5 3-12 3S4 24 4 22V6z" />
                  <path d="M4 11c0 2 5 3 12 3s12-1 12-3M4 16c0 2 5 3 12 3s12-1 12-3" />
                </svg>
                <span>외부 시스템</span>
              </button>

              {/* 🛠️ 수정됨: note 타입으로 정확히 분리 */}
              <button
                type="button"
                className="shape-card-btn"
                onClick={() => handleAddNode('note')}
                draggable
                onDragStart={(e) => onDragStart(e, 'note')}
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
        )}
      </div>

      {/* 3. 플로우차트 (Flowchart) */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#ffffff' }}>
        <button
          type="button"
          onClick={() => toggleSection('flowchart')}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: openSection === 'flowchart' ? '#eff6ff' : '#f8fafc',
            border: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
            cursor: 'pointer',
          }}
        >
          <span>{openSection === 'flowchart' ? '▼' : '▶'} 플로우차트 (Flowchart)</span>
          <span>{openSection === 'flowchart' ? '▲' : '▼'}</span>
        </button>

        {openSection === 'flowchart' && (
          <div style={{ padding: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                type="button"
                className="shape-card-btn"
                onClick={() => handleAddNode('usecase')}
                draggable
                onDragStart={(e) => onDragStart(e, 'usecase')}
              >
                <svg width="28" height="20" viewBox="0 0 32 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="28" height="16" rx="8" />
                </svg>
                <span>시작 / 종료</span>
              </button>

              <button
                type="button"
                className="shape-card-btn"
                onClick={() => handleAddNode('boundary')}
                draggable
                onDragStart={(e) => onDragStart(e, 'boundary')}
              >
                <svg width="28" height="20" viewBox="0 0 32 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="28" height="16" />
                </svg>
                <span>처리 (Process)</span>
              </button>

              <button
                type="button"
                className="shape-card-btn"
                onClick={() => handleAddNode('usecase')}
                draggable
                onDragStart={(e) => onDragStart(e, 'usecase')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12,2 22,12 12,22 2,12" />
                </svg>
                <span>조건 (Decision)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. 관계선 (Relations) */}
      <div className="tool-section" style={{ marginTop: '4px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#475569' }}>관계선 (Relations)</h4>
        {useCaseRelations.map((tool) => (
          <button
            key={tool.type}
            type="button"
            className={`relation-tool ${relationType === tool.type ? 'active' : ''}`}
            onClick={() => onSelectRelationType(tool.type)}
          >
            <span className="relation-symbol">
              {tool.type === 'association'
                ? '────'
                : tool.type === 'generalization'
                ? '──▷'
                : ' - - -►'}
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
    </div>
  );
}

export default UseCaseToolPanel;