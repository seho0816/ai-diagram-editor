
import type { AiAnalysisResult } from '../types/ai';

type Props = {
    purpose: string;
    onPurposeChange: (value: string) => void;
    result: AiAnalysisResult | null;
    loading: boolean;
    error: string | null;
    onAnalyze: () => void;
    onClose: () => void;
};

function AiPanel({
                     purpose,
                     onPurposeChange,
                     result,
                     loading,
                     error,
                     onAnalyze,
                     onClose,
                 }: Props) {
    return (
        <aside className="ai-panel">
            <div className="ai-panel-header">
                <h3>AI 분석</h3>
                <button type="button" onClick={onClose}>
                    닫기
                </button>
            </div>

            <label htmlFor="diagram-purpose">설계 목적</label>
            <textarea
                id="diagram-purpose"
                rows={3}
                value={purpose}
                onChange={(e) => onPurposeChange(e.target.value)}
                placeholder="예: 쇼핑몰 주문 관리 시스템"
            />

            <button
                className="ai-analyze-button"
                onClick={onAnalyze}
                disabled={loading || !purpose.trim()}
            >
                {loading ? '분석 중...' : 'AI 분석 실행'}
            </button>

            <div className="ai-results" aria-live="polite">
                {loading && <p>다이어그램을 분석하고 있습니다.</p>}

                {error && (
                    <p className="ai-error" role="alert">
                        {error}
                    </p>
                )}

                {!loading && result && (
                    <>
                        <h4>종합 평가</h4>
                        <p>{result.summary}</p>

                        <h4>분석 항목</h4>

                        {result.issues.length === 0 && (
                            <p>주요 개선 사항을 발견하지 못했습니다.</p>
                        )}

                        {result.issues.map((issue, index) => (
                            <div className="ai-issue" key={index}>
                <span className="ai-issue-kind">
                  {issue.kind === 'RULE_VIOLATION'
                      ? '규칙 오류'
                      : '개선 권고'}
                </span>

                                <h5>{issue.title}</h5>

                                {issue.targetId && (
                                    <small>대상: {issue.targetId}</small>
                                )}

                                <p>{issue.reason}</p>

                                <strong>개선 방법</strong>
                                <p>{issue.suggestion}</p>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </aside>
    );
}

export default AiPanel;
