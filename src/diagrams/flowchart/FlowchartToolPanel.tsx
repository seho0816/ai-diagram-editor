import { useState, type ReactNode } from 'react';
import { flowchartDiagramConfig } from './config';
import type { FlowchartShape, FlowchartRelationType } from './types';
import type { RelationToolProps } from '../toolPanelTypes';
import './FlowchartToolPanel.css';

type Props = RelationToolProps & {
  onAddNode: (toolType: string) => void;
};

function ShapePreview({ shape }: { shape: FlowchartShape }) {
  const fill = '#eff6ff';
  const stroke = '#2563eb';
  let content: ReactNode;
  switch (shape) {
    case 'startEnd': content = <rect x="5" y="11" width="66" height="26" rx="13" fill={fill} stroke={stroke} strokeWidth="1.8" />; break;
    case 'process': content = <rect x="5" y="11" width="66" height="26" rx="2" fill={fill} stroke={stroke} strokeWidth="1.8" />; break;
    case 'decision': content = <polygon points="38,3 72,24 38,45 4,24" fill="#fffbeb" stroke="#d97706" strokeWidth="1.8" />; break;
    case 'inputOutput': content = <polygon points="17,10 72,10 59,38 4,38" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.8" />; break;
    case 'document': content = <path d="M5 8 H71 V36 Q54 27 38 36 Q22 43 5 36 Z" fill={fill} stroke={stroke} strokeWidth="1.8" />; break;
    case 'database': content = <><path d="M10 13 V34 C10 45 66 45 66 34 V13" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1.8"/><ellipse cx="38" cy="13" rx="28" ry="8" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1.8"/></>; break;
    case 'predefined': content = <><rect x="5" y="10" width="66" height="28" fill={fill} stroke={stroke} strokeWidth="1.8"/><path d="M16 10 V38 M60 10 V38" stroke={stroke} strokeWidth="1.5"/></>; break;
    case 'connector': content = <circle cx="38" cy="24" r="18" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.8" />; break;
    case 'offPage': content = <polygon points="10,5 66,5 66,29 38,45 10,29" fill="#ecfeff" stroke="#0891b2" strokeWidth="1.8" />; break;
    case 'delay': content = <path d="M9 9 H49 C78 9 78 39 49 39 H9 Z" fill="#fff1f2" stroke="#e11d48" strokeWidth="1.8" />; break;
    case 'manualInput': content = <polygon points="5,18 71,7 71,39 5,39" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1.8" />; break;
    case 'display': content = <polygon points="15,9 59,9 72,24 59,39 15,39 4,24" fill={fill} stroke={stroke} strokeWidth="1.8" />; break;
  }
  return <svg className="flowchart-tool-preview" viewBox="0 0 76 48" aria-hidden="true">{content}</svg>;
}

function RelationPreview({ relation }: { relation: FlowchartRelationType }) {
  const color = relation === 'yes' ? '#16a34a' : relation === 'no' ? '#dc2626' : '#475569';
  const dash = relation === 'yes' ? '7 4' : relation === 'no' ? '12 4' : undefined;
  const label = relation === 'yes' ? '예' : relation === 'no' ? '아니오' : '';
  return (
    <svg className="flowchart-relation-preview" viewBox="0 0 130 36" aria-hidden="true">
      <path d="M5 18 H119" fill="none" stroke={color} strokeWidth="2.2" strokeDasharray={dash}/>
      <path d="M116 12 L124 18 L116 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      {label && <><rect x={label === '예' ? 55 : 43} y="5" width={label === '예' ? 23 : 47} height="25" rx="4" fill="#fff" stroke={color} strokeWidth="1"/><text x="66.5" y="22" textAnchor="middle" fill={color} fontSize="13" fontWeight="700">{label}</text></>}
    </svg>
  );
}

function FlowchartToolPanel({ onAddNode, relationType, onSelectRelationType, onApplyRelationToSelected, hasSelectedEdge }: Props) {
  const [opened, setOpened] = useState({ basic: true, extended: true, relations: true });
  const toggle = (key: keyof typeof opened) => setOpened((old) => ({ ...old, [key]: !old[key] }));
  return (
    <div className="flowchart-tool-panel">
      {(['basic', 'extended'] as const).map((group) => (
        <section className="flowchart-tool-section" key={group}>
          <button type="button" className="flowchart-group-heading" aria-expanded={opened[group]} onClick={() => toggle(group)}>
            <span>{group === 'basic' ? '기본 도형' : '확장 도형'}</span><span aria-hidden="true">{opened[group] ? '⌃' : '⌄'}</span>
          </button>
          {opened[group] && <div className="flowchart-tool-grid">
            {flowchartDiagramConfig.tools.nodes.filter((item) => item.group === group).map((tool) => (
              <button key={tool.type} type="button" className="flowchart-shape-tool" onClick={() => onAddNode(tool.type)} title={`${tool.label} 추가`}>
                <ShapePreview shape={tool.type}/><span>{tool.label}</span>
              </button>
            ))}
          </div>}
        </section>
      ))}
      <section className="flowchart-tool-section">
        <button type="button" className="flowchart-group-heading" aria-expanded={opened.relations} onClick={() => toggle('relations')}>
          <span>연결선</span><span aria-hidden="true">{opened.relations ? '⌃' : '⌄'}</span>
        </button>
        {opened.relations && <div className="flowchart-relation-section">
          <div className="flowchart-relation-grid">
            {flowchartDiagramConfig.tools.relations.map((tool) => (
              <button key={tool.type} type="button" className={`flowchart-relation-tool ${relationType === tool.type ? 'active' : ''}`} onClick={() => onSelectRelationType(tool.type)} aria-pressed={relationType === tool.type}>
                <RelationPreview relation={tool.type}/><span>{tool.label}</span>
              </button>
            ))}
          </div>
          <button type="button" className="sidebar-action-button" onClick={onApplyRelationToSelected} disabled={!hasSelectedEdge}>선택한 연결선 종류 변경</button>
        </div>}
      </section>
    </div>
  );
}

export default FlowchartToolPanel;
