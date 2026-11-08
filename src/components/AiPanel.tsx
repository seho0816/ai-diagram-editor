import type { AiAnalysisResult, AiIssue } from '../types/ai';
import './AiPanelEdits.css';

type EditPreviewSummary = {
  issueIndex: number;
  issueTitle: string;
  description: string;
  changes: string[];
};

type Props = {
  purpose: string;
  onPurposeChange: (value: string) => void;
  result: AiAnalysisResult | null;
  loading: boolean;
  error: string | null;
  onAnalyze: () => void;
  onClose: () => void;
  diagramType: 'CLASS' | 'FLOWCHART' | 'USE_CASE';
  editPreview: EditPreviewSummary | null;
  editLoading: boolean;
  editError: string | null;
  isPreviewVisible: boolean;
  onProposeEdit: (issue: AiIssue, index: number) => void;
  onShowPreview: (index: number) => void;
  onShowOriginal: () => void;
  onApplyEdit: () => void;
  onCancelEdit: () => void;
};

function AiPanel({
  purpose, onPurposeChange, result, loading, error, onAnalyze, onClose,
  diagramType, editPreview, editLoading, editError,
  isPreviewVisible, onProposeEdit, onShowPreview, onShowOriginal,
  onApplyEdit, onCancelEdit,
}: Props) {
  return (
    <aside className="ai-panel">
      <div className="ai-panel-header">
        <h3>AI 분석</h3>
        <button type="button" onClick={onClose}>닫기</button>
      </div>

      <label htmlFor="diagram-purpose">설계 목적</label>
      <textarea
        id="diagram-purpose"
        rows={3}
        value={purpose}
        onChange={(event) => onPurposeChange(event.target.value)}
        placeholder="예: 쇼핑몰 주문 관리 시스템"
        disabled={Boolean(editPreview) || editLoading}
      />
      <button
        type="button"
        className="ai-analyze-button"
        onClick={onAnalyze}
        disabled={loading || editLoading || Boolean(editPreview) || !purpose.trim()}
      >
        {loading ? '분석 중...' : 'AI 분석 실행'}
      </button>

      <div className="ai-results" aria-live="polite">
        {loading && <p>다이어그램을 분석하고 있습니다.</p>}
        {error && <p className="ai-error" role="alert">{error}</p>}
        {editLoading && <p>AI가 선택한 항목의 수정안을 만들고 있습니다.</p>}
        {editError && <p className="ai-error" role="alert">{editError}</p>}

        {!loading && result && (
          <>
            <h4>종합 평가</h4>
            <p>{result.summary}</p>
            <h4>분석 항목</h4>
            {result.issues.length === 0 && <p>주요 개선 사항을 발견하지 못했습니다.</p>}
            {result.issues.map((issue, index) => (
              <div className="ai-issue" key={`${index}-${issue.targetId}`}>
                <span className="ai-issue-kind">
                  {issue.kind === 'RULE_VIOLATION' ? '규칙 오류' : '개선 권고'}
                </span>
                <h5>{issue.title}</h5>
                {issue.targetId && <small>대상: {issue.targetId}</small>}
                <p>{issue.reason}</p>
                <strong>개선 방법</strong>
                <p>{issue.suggestion}</p>
                <div className="ai-issue-buttons">
                  <button
                    type="button"
                    className="ai-edit-propose-button"
                    onClick={() => onProposeEdit(issue, index)}
                    disabled={loading || editLoading || Boolean(editPreview) || diagramType === 'USE_CASE'}
                    title={diagramType === 'USE_CASE'
                      ? '유스케이스 편집기 자동 수정 연결 후 지원됩니다.' : undefined}
                  >
                    {diagramType === 'USE_CASE' ? '자동 수정 준비 중' : '수정안 만들기'}
                  </button>
                  <button
                    type="button"
                    className="ai-edit-preview-button"
                    disabled={loading || editLoading || editPreview?.issueIndex !== index}
                    onClick={() => isPreviewVisible ? onShowOriginal() : onShowPreview(index)}
                  >
                    {isPreviewVisible && editPreview?.issueIndex === index ? '원본 보기' : '미리보기'}
                  </button>
                </div>
                {editPreview?.issueIndex === index && (
                  <section className="ai-edit-preview" aria-label="AI 수정 미리보기">
                    <h4>{isPreviewVisible ? '수정 미리보기' : '수정안 준비 완료'}</h4>
                    <p><strong>{editPreview.issueTitle}</strong></p>
                    <p>{editPreview.description}</p>
                    <ul>
                      {editPreview.changes.map((item, changeIndex) => (
                        <li key={changeIndex}>{item}</li>
                      ))}
                    </ul>
                    <p className="ai-edit-warning">
                      {isPreviewVisible
                        ? '오른쪽은 수정안 미리보기입니다. 승인 전까지 원본은 바뀌지 않습니다.'
                        : '오른쪽은 분석 당시 원본입니다. 위의 미리보기 버튼으로 변경안을 확인하세요.'}
                    </p>
                    <div className="ai-edit-actions">
                      {isPreviewVisible && (
                        <button type="button" onClick={onApplyEdit}>수정 적용</button>
                      )}
                      <button type="button" onClick={onCancelEdit}>수정안 취소</button>
                    </div>
                  </section>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}

export default AiPanel;
