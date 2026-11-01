
export type AiIssue = {
    kind: 'RULE_VIOLATION' | 'IMPROVEMENT';
    title: string;
    reason: string;
    suggestion: string;
    targetId: string;
};

export type AiAnalysisResult = {
    summary: string;
    issues: AiIssue[];
};
