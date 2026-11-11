import { Router } from 'express';
import { z } from 'zod';
import { buildEditPrompt, operationResponseSchema } from './prompt.mjs';
import { normalizeAiEditProposal } from './validateProposal.mjs';

const issueSchema = z.object({
  kind: z.enum(['RULE_VIOLATION', 'IMPROVEMENT']),
  title: z.string().max(200),
  reason: z.string().max(3000),
  suggestion: z.string().max(3000),
  targetId: z.string().max(120),
});

const requestSchema = z.object({
  diagramType: z.enum(['CLASS', 'FLOWCHART']),
  purpose: z.string().trim().min(1).max(2000),
  issue: issueSchema,
  nodes: z.array(z.object({
    id: z.string().min(1).max(120),
    type: z.string(),
    position: z.object({ x: z.number().finite(), y: z.number().finite() }),
    data: z.unknown(),
  })).min(1).max(200),
  edges: z.array(z.object({
    id: z.string().min(1).max(120),
    type: z.string(),
    source: z.string(),
    target: z.string(),
    data: z.unknown().optional(),
  })).max(400),
});

export function createAiEditRouter(ai, model) {
  const router = Router();
  router.post('/propose', async (req, res) => {
    const parsedRequest = requestSchema.safeParse(req.body);
    if (!parsedRequest.success) {
      return res.status(400).json({ error: '수정안 요청 데이터가 올바르지 않습니다.' });
    }

    const request = parsedRequest.data;
    const validTargetIds = new Set([
      ...request.nodes.map((node) => node.id),
      ...request.edges.map((edge) => edge.id),
      '',
    ]);
    if (!validTargetIds.has(request.issue.targetId)) {
      return res.status(400).json({ error: '분석 대상이 현재 다이어그램에 없습니다. 재분석해 주세요.' });
    }
    try {
      const response = await ai.interactions.create({
        model,
        input: buildEditPrompt(request),
        store: false,
        generation_config: {
          thinking_level: model === 'gemini-3.5-flash-lite' ? 'minimal' : 'low',
        },
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: operationResponseSchema,
        },
      });
      if (!response.output_text) throw new Error('AI가 수정안을 반환하지 않았습니다.');
      const proposal = normalizeAiEditProposal(JSON.parse(response.output_text), request);
      return res.json(proposal);
    } catch (error) {
      console.error('[AI] 수정안 생성 오류:', error);
      const status = Number(error?.status || error?.code);
      return res.status(status === 429 ? 429 : 502).json({
        error: status === 429
          ? 'Gemini 요청 한도에 도달했습니다.'
          : 'AI 수정안을 생성하지 못했습니다. 다시 시도해 주세요.',
      });
    }
  });
  return router;
}
