import { type DragEvent } from 'react';
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
  const handleAddNode = (type: string) => {
    onAddNode(type);
  };

  const onDragStart = (event: DragEvent<HTMLButtonElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '-8px 0 0 0' }}>
      {/* 유스케이스 팔레트 박스 */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#ffffff' }}>
        <div
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#eff6ff',
            borderBottom: '1px solid #cbd5e1',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
          }}
        >
          유스케이스 (Use Case) 팔레트
        </div>

        <div style={{ padding: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {/* 1. 액터 (사람 모양) */}
            <button
              type="button"
              onClick={() => handleAddNode('actor')}
              draggable
              onDragStart={(e) => onDragStart(e, 'actor')}
              title="사용자/시스템 액터"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <svg width="24" height="28" viewBox="0 0 24 32" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="3.5" />
                <path d="M12 8.5v11.5M6 13h12M12 20l-5 9.5M12 20l5 9.5" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>액터</span>
            </button>

            {/* 2. 유스케이스 */}
            <button
              type="button"
              onClick={() => handleAddNode('usecase')}
              draggable
              onDragStart={(e) => onDragStart(e, 'usecase')}
              title="유스케이스 타원"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <svg width="36" height="24" viewBox="0 0 40 24" fill="none" stroke="#1e293b" strokeWidth="2">
                <ellipse cx="20" cy="12" rx="18" ry="10" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>유스케이스</span>
            </button>

            {/* 3. 시스템 경계 */}
            <button
              type="button"
              onClick={() => handleAddNode('boundary')}
              draggable
              onDragStart={(e) => onDragStart(e, 'boundary')}
              title="시스템 경계"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <svg width="36" height="24" viewBox="0 0 32 28" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 2">
                <rect x="2" y="2" width="28" height="24" rx="2" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>시스템 경계</span>
            </button>

            {/* 4. 서브시스템 */}
            <button
              type="button"
              onClick={() => handleAddNode('subsystem')}
              draggable
              onDragStart={(e) => onDragStart(e, 'subsystem')}
              title="서브시스템 컴포넌트"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <svg width="36" height="24" viewBox="0 0 32 28" fill="none" stroke="#1e293b" strokeWidth="2">
                <rect x="2" y="2" width="28" height="24" rx="2" />
                <line x1="2" y1="8" x2="30" y2="8" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>서브시스템</span>
            </button>

            {/* 5. 외부 시스템 */}
            <button
              type="button"
              onClick={() => handleAddNode('externalSystem')}
              draggable
              onDragStart={(e) => onDragStart(e, 'externalSystem')}
              title="외부 시스템 / DB"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <svg width="36" height="24" viewBox="0 0 32 28" fill="none" stroke="#1e293b" strokeWidth="2">
                <path d="M4 6c0-2 5-3 12-3s12 1 12 3v16c0 2-5 3-12 3S4 24 4 22V6z" />
                <path d="M4 11c0 2 5 3 12 3s12-1 12-3M4 16c0 2 5 3 12 3s12-1 12-3" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>외부 시스템</span>
            </button>

            {/* 6. 노트 주석 */}
            <button
              type="button"
              onClick={() => handleAddNode('note')}
              draggable
              onDragStart={(e) => onDragStart(e, 'note')}
              title="주석 노트"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <svg width="30" height="24" viewBox="0 0 28 30" fill="none" stroke="#1e293b" strokeWidth="2">
                <path d="M3 3h16l6 6v18H3V3z" />
                <path d="M19 3v6h6" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>노트 주석</span>
            </button>
          </div>
        </div>
      </div>

      {/* 관계선 (Relations) */}
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