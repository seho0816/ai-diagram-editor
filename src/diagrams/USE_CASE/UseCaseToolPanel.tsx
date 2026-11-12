import type { ReactNode } from 'react';
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

const nodeTools: { type: string; label: string; title: string; icon: ReactNode }[] = [
  {
    type: 'actor',
    label: '액터',
    title: '사용자/시스템 액터',
    icon: (
      <svg width="24" height="28" viewBox="0 0 24 32" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3.5" />
        <path d="M12 8.5v11.5M6 13h12M12 20l-5 9.5M12 20l5 9.5" />
      </svg>
    ),
  },
  {
    type: 'usecase',
    label: '유스케이스',
    title: '유스케이스 타원',
    icon: (
      <svg width="36" height="24" viewBox="0 0 40 24" fill="none" stroke="#1e293b" strokeWidth="2">
        <ellipse cx="20" cy="12" rx="18" ry="10" />
      </svg>
    ),
  },
  {
    type: 'boundary',
    label: '시스템 경계',
    title: '시스템 경계',
    icon: (
      <svg width="36" height="24" viewBox="0 0 32 28" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 2">
        <rect x="2" y="2" width="28" height="24" rx="2" />
      </svg>
    ),
  },
  {
    type: 'subsystem',
    label: '서브시스템',
    title: '서브시스템 컴포넌트',
    icon: (
      <svg width="36" height="24" viewBox="0 0 32 28" fill="none" stroke="#1e293b" strokeWidth="2">
        <rect x="2" y="2" width="28" height="24" rx="2" />
        <line x1="2" y1="8" x2="30" y2="8" />
      </svg>
    ),
  },
  {
    type: 'externalSystem',
    label: '외부 시스템',
    title: '외부 시스템 / DB',
    icon: (
      <svg width="36" height="24" viewBox="0 0 32 28" fill="none" stroke="#1e293b" strokeWidth="2">
        <path d="M4 6c0-2 5-3 12-3s12 1 12 3v16c0 2-5 3-12 3S4 24 4 22V6z" />
        <path d="M4 11c0 2 5 3 12 3s12-1 12-3M4 16c0 2 5 3 12 3s12-1 12-3" />
      </svg>
    ),
  },
  {
    type: 'note',
    label: '노트 주석',
    title: '주석 노트',
    icon: (
      <svg width="30" height="24" viewBox="0 0 28 30" fill="none" stroke="#1e293b" strokeWidth="2">
        <path d="M3 3h16l6 6v18H3V3z" />
        <path d="M19 3v6h6" />
      </svg>
    ),
  },
];

function UseCaseToolPanel({
  onAddNode,
  relationType,
  onSelectRelationType,
  onApplyRelationToSelected,
  hasSelectedEdge,
}: Props) {
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
            {nodeTools.map((tool) => (
              <button
                key={tool.type}
                type="button"
                onClick={() => onAddNode(tool.type)}
                title={tool.title}
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
                {tool.icon}
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{tool.label}</span>
              </button>
            ))}
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