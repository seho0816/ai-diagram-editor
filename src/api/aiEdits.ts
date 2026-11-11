import type { AiEditProposal, AiEditRequest } from '../types/aiEdits';

export async function requestAiEditProposal(
  request: AiEditRequest
): Promise<AiEditProposal> {
  let response: Response;
  try {
    response = await fetch('/api/ai/propose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error('AI 서버에 연결할 수 없습니다. Express 서버를 확인해 주세요.');
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body &&
      typeof body.error === 'string' ? body.error : 'AI 수정안을 생성하지 못했습니다.';
    throw new Error(message);
  }
  if (!body || typeof body !== 'object' ||
    !('description' in body) || typeof body.description !== 'string' ||
    !('operations' in body) || !Array.isArray(body.operations)) {
    throw new Error('AI 수정안 응답 형식이 올바르지 않습니다.');
  }
  return body as AiEditProposal;
}
