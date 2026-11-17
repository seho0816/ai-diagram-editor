import { useFlowchartFeatures } from './FlowchartFeatures';
import './FlowchartSimulationPanel.css';

export default function FlowchartSimulationPanel() {
  const sim = useFlowchartFeatures();
  if (!sim?.running) return null;
  return (
    <section className="flowchart-simulation-overlay" aria-label="플로우차트 실행 시뮬레이션 진행 상황">
      <header><strong>▶ 플로우차트 시뮬레이션</strong><button type="button" onClick={sim.stop} aria-label="시뮬레이션 닫기">✕</button></header>
      <div className="flowchart-simulation-history">
        {sim.history.map((id, index) => <div key={`${index}-${id}`} className={index === sim.history.length - 1 ? 'current' : ''}>
          <span>{index + 1}</span>{sim.nameOf(id)}{index === sim.history.length - 1 ? ' (현재)' : ''}
        </div>)}
      </div>
      <p>현재 단계: <strong>{sim.activeNodeId ? sim.nameOf(sim.activeNodeId) : '-'}</strong></p>
      {sim.finished && <p role="status" className="sim-success">시뮬레이션이 종료되었습니다.</p>}
      {sim.error && <p role="alert" className="sim-error">{sim.error}</p>}
      {sim.branches.length > 0 && <div className="sim-branch-row">
        {sim.branches.includes('yes') && <button type="button" className="sim-yes" onClick={() => sim.advance('yes')}>예</button>}
        {sim.branches.includes('no') && <button type="button" className="sim-no" onClick={() => sim.advance('no')}>아니오</button>}
      </div>}
      <div className="sim-navigation">
        <button type="button" onClick={sim.previous} disabled={sim.history.length <= 1}>이전</button>
        <button type="button" onClick={() => sim.advance()} disabled={sim.finished || sim.branches.length > 0}>다음 단계</button>
      </div>
    </section>
  );
}
