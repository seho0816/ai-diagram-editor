import { useState, type ReactNode } from 'react';
import { flowchartDiagramConfig } from './config';
import type { FlowchartShape, FlowchartRelationType } from './types';
import type { RelationToolProps } from '../toolPanelTypes';
import './FlowchartToolPanel.css';
import { useFlowchartFeatures } from './FlowchartFeatures';

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
  const [opened, setOpened] = useState({ basic: true, extended: true, relations: true, layout: true, simulation: true, validation: true, paths: true });
  const features = useFlowchartFeatures();
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
      {features && <>
        <section className="flowchart-tool-section">
          <button type="button" className="flowchart-group-heading" aria-expanded={opened.validation} onClick={() => toggle('validation')}>
            <span>구조 자동 검증 ({features.validationIssues.filter((issue) => issue.severity === 'error').length}개 오류)</span><span aria-hidden="true">{opened.validation ? '⌃' : '⌄'}</span>
          </button>
          {opened.validation && <div className="flowchart-feature-controls" aria-live="polite">
            {features.validationIssues.length === 0 ? <p className="flowchart-inspection-ok">구조 검증에서 문제가 발견되지 않았습니다.</p> :
              <ul className="flowchart-inspection-list">{features.validationIssues.map((issue, index) =>
                <li key={`${issue.code}-${issue.nodeId ?? index}`} className={`flowchart-inspection-${issue.severity}`}>
                  <strong>{issue.severity === 'error' ? '오류' : issue.severity === 'warning' ? '주의' : '안내'}</strong> {issue.message}
                </li>
              )}</ul>}
          </div>}
        </section>
        <section className="flowchart-tool-section">
          <button type="button" className="flowchart-group-heading" aria-expanded={opened.paths} onClick={() => toggle('paths')}>
            <span>시뮬레이션 경로 테스트</span><span aria-hidden="true">{opened.paths ? '⌃' : '⌄'}</span>
          </button>
          {opened.paths && <div className="flowchart-feature-controls">
            <button type="button" className="flowchart-primary-action" onClick={features.runPathTests}>전체 경로 테스트</button>
            {features.pathReport && <div role="status" className="flowchart-path-results">
              {features.pathReport.message && <p>{features.pathReport.message}</p>}
              {features.pathReport.results.length > 0 && <>
                <p>총 {features.pathReport.results.length}개 경로 · 정상 종료 {features.pathReport.results.filter((result) => result.outcome === 'passed').length}개</p>
                <ol className="flowchart-inspection-list">{features.pathReport.results.map((result, index) =>
                  <li key={index}>
                    <strong>{result.outcome === 'passed' ? '통과' : result.outcome === 'cycle' ? '순환' : result.outcome === 'dead-end' ? '중단' : '분기 누락'}</strong>
                    <span>{result.nodeIds.map((id) => features.nameOf(id)).join(' → ')}</span>
                    {result.branches.length > 0 && <small>선택: {result.branches.map((branch) => branch === 'yes' ? '예' : '아니오').join(', ')}</small>}
                  </li>
                )}</ol>
              </>}
              {features.pathReport.truncated && <p>최대 40개 경로까지만 표시했습니다.</p>}
            </div>}
          </div>}
        </section>
        <section className="flowchart-tool-section">
          <button type="button" className="flowchart-group-heading" aria-expanded={opened.layout} onClick={() => toggle('layout')}>
            <span>자동 정렬</span><span aria-hidden="true">{opened.layout ? '⌃' : '⌄'}</span>
          </button>
          {opened.layout && <div className="flowchart-feature-controls">
            <div className="flowchart-direction-controls" role="group" aria-label="자동 정렬 방향">
              <button type="button" aria-pressed={features.direction === 'vertical'} className={features.direction === 'vertical' ? 'active' : ''} onClick={() => features.setDirection('vertical')}>세로 정렬</button>
              <button type="button" aria-pressed={features.direction === 'horizontal'} className={features.direction === 'horizontal' ? 'active' : ''} onClick={() => features.setDirection('horizontal')}>가로 정렬</button>
            </div>
            <button type="button" className="flowchart-primary-action" onClick={features.arrange}>자동 정렬 실행</button>
          </div>}
        </section>
        <section className="flowchart-tool-section">
          <button type="button" className="flowchart-group-heading" aria-expanded={opened.simulation} onClick={() => toggle('simulation')}>
            <span>실행 시뮬레이션</span><span aria-hidden="true">{opened.simulation ? '⌃' : '⌄'}</span>
          </button>
          {opened.simulation && <div className="flowchart-feature-controls">
            <div className="flowchart-simulation-buttons">
              <button type="button" onClick={features.start}>시작</button>
              <button type="button" onClick={features.previous} disabled={features.history.length <= 1}>이전</button>
              <button type="button" onClick={() => features.advance()} disabled={!features.running || features.finished || features.branches.length > 0}>다음</button>
              <button type="button" onClick={features.stop} disabled={!features.running && !features.error}>종료</button>
            </div>
            <div className="flowchart-current-step">현재 단계: {features.activeNodeId ? features.nameOf(features.activeNodeId) : '미실행'}</div>
            {features.branches.length > 0 && <div className="flowchart-branch-buttons">
              {features.branches.includes('yes') && <button type="button" onClick={() => features.advance('yes')}>예</button>}
              {features.branches.includes('no') && <button type="button" onClick={() => features.advance('no')}>아니오</button>}
            </div>}
            {features.error && <p role="alert" className="flowchart-feature-error">{features.error}</p>}
            {features.finished && <p role="status" className="flowchart-feature-finished">시뮬레이션 종료</p>}
          </div>}
        </section>
      </>}
    </div>
  );
}

export default FlowchartToolPanel;
