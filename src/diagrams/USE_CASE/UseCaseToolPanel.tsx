import { useState } from 'react'; // 2026-11-18 추가 (템플릿 접기)
import type { ReactNode } from 'react';
import type { UseCaseRelationType, DiagramNode, DiagramEdge } from '../../types/diagram'; // 2026-11-12 수정: DiagramNode, DiagramEdge 추가
import type { RelationToolProps } from '../toolPanelTypes';
import { useCaseTemplates } from './templates'; // 기존
// ===== 2026-11-18 추가 =====
import { autoLayoutUseCase } from './autoLayout';
// ===== 2026-11-18 추가 끝 =====

type Props = RelationToolProps & {
  onAddNode: (toolType: string) => void;
  // 2026-11-12 추가: 템플릿 불러오기 (유스케이스 모드일 때만 활성화)
  onLoadTemplate?: (nodes: DiagramNode[], edges: DiagramEdge[]) => void;
  canLoadTemplate?: boolean;
  // ===== 2026-11-18 추가: 자동 정렬 =====
  onAutoLayout?: (layout: typeof autoLayoutUseCase) => void;
  canAutoLayout?: boolean;
  // ===== 2026-11-18 추가 끝 =====
  // ===== 2026-11-18 추가: 관계선 방향 반전 =====
  onReverseEdge?: () => void;
  // ===== 2026-11-18 추가 끝 =====
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

// ===== 2026-11-18 추가: 사이드바 스타일 (발표용 진한 블루 포인트) =====
const sectionTitleStyle = {
  margin: '0 0 8px 0',
  fontSize: '14px',
  fontWeight: 800,
  color: '#1d4ed8',
};

const actionButtonStyle = {
  fontWeight: 700,
  color: '#0f172a',
  border: '1.5px solid #93c5fd',
  borderRadius: '8px',
};
// ===== 2026-11-18 추가 끝 =====

function UseCaseToolPanel({
  onAddNode,
  relationType,
  onSelectRelationType,
  onApplyRelationToSelected,
  hasSelectedEdge,
  onLoadTemplate, // 2026-11-12 추가
  canLoadTemplate = false, // 2026-11-12 추가
  onAutoLayout, // 2026-11-18 추가
  canAutoLayout = false, // 2026-11-18 추가
  onReverseEdge, // 2026-11-18 추가 (관계선 방향 반전)
}: Props) {
  const [templatesOpen, setTemplatesOpen] = useState(false); // 2026-11-18 추가 (템플릿 접기, 기본 접힘)
  const [hoveredTool, setHoveredTool] = useState<string | null>(null); // 2026-11-18 추가 (팔레트 hover)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '-8px 0 0 0' }}>
      {/* 유스케이스 팔레트 박스 */}
      <div style={{ border: '1.5px solid #93c5fd', borderRadius: '8px', overflow: 'hidden', background: '#ffffff' }}> {/* 2026-11-18 스타일 */}
        <div
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#dbeafe', // 2026-11-18 스타일
            borderBottom: '1.5px solid #93c5fd', // 2026-11-18 스타일
            fontSize: '14px',
            fontWeight: 800, // 2026-11-18 스타일
            color: '#1d4ed8', // 2026-11-18 스타일
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
                onMouseEnter={() => setHoveredTool(tool.type)} // 2026-11-18 추가
                onMouseLeave={() => setHoveredTool(null)} // 2026-11-18 추가
                title={tool.title}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  background: hoveredTool === tool.type ? '#dbeafe' : '#f8fafc', // 2026-11-18 스타일
                  border: hoveredTool === tool.type ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1', // 2026-11-18 스타일
                  borderRadius: '8px', // 2026-11-18 스타일
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background 0.12s, border-color 0.12s', // 2026-11-18 추가
                }}
              >
                {tool.icon}
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{tool.label}</span> {/* 2026-11-18 스타일 */}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 2026-11-18 추가: 자동 정렬 ===== */}
      {onAutoLayout && (
        <div className="tool-section" style={{ marginTop: '4px' }}>
          <h4 style={sectionTitleStyle}>자동 정렬</h4>
          <button
            type="button"
            className="sidebar-action-button"
            style={actionButtonStyle}
            disabled={!canAutoLayout}
            title={canAutoLayout ? '액터는 양옆, 유스케이스는 세로로 정렬합니다' : '상단에서 유스케이스를 선택하세요'}
            onClick={() => onAutoLayout(autoLayoutUseCase)}
          >
            자동 정렬 실행
          </button>
        </div>
      )}
      {/* ===== 2026-11-18 추가 끝 ===== */}

      {/* 2026-11-12 추가: 사례 템플릿 (2026-11-18 수정: 접었다 펴기) */}
      {onLoadTemplate && (
        <div className="tool-section" style={{ marginTop: '4px' }}>
          <h4
            style={{ ...sectionTitleStyle, cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setTemplatesOpen((open) => !open)}
            title="클릭해서 펼치거나 접습니다"
          >
            {templatesOpen ? '▼' : '▶'} 사례 템플릿 ({useCaseTemplates.length})
          </h4>
          {templatesOpen &&
            useCaseTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                className="sidebar-action-button"
                style={{ ...actionButtonStyle, marginBottom: '6px' }}
                disabled={!canLoadTemplate}
                title={canLoadTemplate ? '현재 캔버스를 이 사례로 바꿉니다' : '상단에서 유스케이스를 선택하세요'}
                onClick={() => {
                  if (window.confirm('현재 캔버스 내용이 사라집니다. 불러올까요?')) {
                    onLoadTemplate(template.nodes, template.edges);
                  }
                }}
              >
                {template.label}
              </button>
            ))}
        </div>
      )}

      {/* 관계선 (Relations) */}
      <div className="tool-section" style={{ marginTop: '4px' }}>
        <h4 style={sectionTitleStyle}>관계선 (Relations)</h4> {/* 2026-11-18 스타일 */}
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
          style={{ ...actionButtonStyle, marginTop: '8px' }} // 2026-11-18 스타일
          onClick={onApplyRelationToSelected}
          disabled={!hasSelectedEdge}
        >
          선택한 관계선 종류 변경
        </button>

        {/* ===== 2026-11-18 추가: 관계선 방향 반전 ===== */}
        {onReverseEdge && (
          <button
            type="button"
            className="sidebar-action-button"
            style={{ ...actionButtonStyle, marginTop: '6px' }}
            onClick={onReverseEdge}
            disabled={!hasSelectedEdge}
            title="선택한 관계선의 시작과 끝을 바꿉니다"
          >
            선택한 관계선 방향 반전
          </button>
        )}
        {/* ===== 2026-11-18 추가 끝 ===== */}
      </div>
    </div>
  );
}

export default UseCaseToolPanel;