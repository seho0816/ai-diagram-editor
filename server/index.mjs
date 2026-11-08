import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { buildAnalysisPrompt } from './analysis/prompts.mjs';
import { createAiEditRouter } from './aiEdits/router.mjs';

const app = express();
const PORT = Number(process.env.PORT || 3001);
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

app.use(express.json({ limit: '100kb' }));
app.use('/api/ai', createAiEditRouter(ai, MODEL));
// Gemini에게 요청할 분석 결과 JSON 형식
const responseSchema = {
    type: 'object',
    properties: {
        summary: { type: 'string' },
        issues: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    kind: {
                        type: 'string',
                        enum: ['RULE_VIOLATION', 'IMPROVEMENT'],
                    },
                    title: { type: 'string' },
                    reason: { type: 'string' },
                    suggestion: { type: 'string' },
                    targetId: { type: 'string' },
                },
                required: [
                    'kind',
                    'title',
                    'reason',
                    'suggestion',
                    'targetId',
                ],
                additionalProperties: false,
            },
        },
    },
    required: ['summary', 'issues'],
    additionalProperties: false,
};
// 실제 응답 데이터 검증
const resultSchema = z.object({
    summary: z.string(),
    issues: z.array(
        z.object({
            kind: z.enum(['RULE_VIOLATION', 'IMPROVEMENT']),
            title: z.string(),
            reason: z.string(),
            suggestion: z.string(),
            targetId: z.string(),
        })
    ),
});

// 서버 연결 테스트
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// 다이어그램 AI 분석
app.post('/api/ai/analyze', async (req, res) => {
    const { diagramType, purpose, nodes, edges } = req.body ?? {};
    if (
        !['CLASS', 'USE_CASE', 'FLOWCHART'].includes(diagramType) ||
        typeof purpose !== 'string' ||
        !purpose.trim() ||
        purpose.length > 2000 ||
        !Array.isArray(nodes) ||
        nodes.length === 0 ||
        nodes.length > 200 ||
        !Array.isArray(edges) ||
        edges.length > 400
    ) {
        return res.status(400).json({
            error: '다이어그램 분석 요청 데이터가 올바르지 않습니다.',
        });
    }
    try {
        const diagram = {
            diagramType,
            purpose,
            nodes,
            edges,
        };

        const prompt = buildAnalysisPrompt(diagram);
        const startedAt = performance.now();

        console.log(`[AI] 분석 시작 - ${MODEL}`);
        const response = await ai.interactions.create({
            model: MODEL,
            input: prompt,

            // 대화 기록 저장이 필요 없는 단발성 분석
            store: false,

            // 추론 시간 단축
            generation_config: {
                thinking_level:
                    MODEL === 'gemini-3.5-flash-lite'
                        ? 'minimal'
                        : 'low',
            },
            response_format: {
                type: 'text',
                mime_type: 'application/json',
                schema: responseSchema,
            },
        });

        console.log(
            `[AI] Gemini 응답: ${(
                (performance.now() - startedAt) / 1000
            ).toFixed(2)}초`
        );

        if (!response.output_text) {
            throw new Error('Gemini가 분석 결과를 반환하지 않았습니다.');
        }
        const parsed = resultSchema.parse(
            JSON.parse(response.output_text)
        );

        // AI가 존재하지 않는 ID를 만들었는지 검사
        const validIds = new Set([
            ...nodes.map((node) => node.id),
            ...edges.map((edge) => edge.id),
        ]);
        const result = {
            ...parsed,
            issues: parsed.issues.slice(0, 5).map((issue) => ({
                ...issue,
                targetId: validIds.has(issue.targetId)
                    ? issue.targetId
                    : '',
            })),
        };

        return res.json(result);
    } catch (error) {
        console.error('AI 분석 오류:', error.message);

        const status = Number(error.status || error.code);
        if (status === 429) {
            return res.status(429).json({
                error: 'Gemini 무료 사용량 제한에 도달했습니다.',
            });
        }

        return res.status(502).json({
            error: 'Gemini 분석 요청을 처리하지 못했습니다.',
        });
    }
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`AI 서버 실행: http://localhost:${PORT}`);
});
