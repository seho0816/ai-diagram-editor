
import type { DiagramType } from '../types/diagram';
import type { AiAnalysisResult } from '../types/ai';

type AnalyzeRequest = {
    diagramType: DiagramType;
    purpose: string;
    nodes: Array<{
        id: string;
        type?: string;
        position: { x: number; y: number };
        data: unknown;
    }>;
    edges: Array<{
        id: string;
        type?: string;
        source: string;
        target: string;
        sourceHandle?: string | null;
        targetHandle?: string | null;
        data?: unknown;
    }>;
};

export async function analyzeDiagram(
    request: AnalyzeRequest
): Promise<AiAnalysisResult> {
    const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            typeof result.error === 'string'
                ? result.error
                : 'AI 분석 요청에 실패했습니다.'
        );
    }

    if (
        typeof result.summary !== 'string' ||
        !Array.isArray(result.issues)
    ) {
        throw new Error('AI 응답 형식이 올바르지 않습니다.');
    }

    return result as AiAnalysisResult;
}
