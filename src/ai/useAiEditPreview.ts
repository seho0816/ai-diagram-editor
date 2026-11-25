import { useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { AiIssue } from '../types/ai';
import type { DiagramEdge, DiagramNode, DiagramType } from '../types/diagram';
import { requestAiEditProposal } from '../api/aiEdits';
import { buildEditPreview } from './buildEditPreview';

type Options = {
  diagramType: DiagramType;
  purpose: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  setNodes: Dispatch<SetStateAction<DiagramNode[]>>;
  setEdges: Dispatch<SetStateAction<DiagramEdge[]>>;
};

type ClarificationState = {
  issueIndex: number;
  question: string;
  reviewed: boolean;
};

type PreviewState = {
  baseSignature: string;
  issueIndex: number;
  issueTitle: string;
  description: string;
  changes: string[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

/** AI edits are separate from domain modules and are never committed automatically. */
export function useAiEditPreview({
  diagramType, purpose, nodes, edges, setNodes, setEdges,
}: Options) {
  const signature = useMemo(() => JSON.stringify({
    diagramType,
    purpose,
    nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
    edges: edges.map(({ id, type, source, target, sourceHandle, targetHandle, data }) =>
      ({ id, type, source, target, sourceHandle, targetHandle, data })),
  }), [diagramType, purpose, nodes, edges]);

  const signatureRef = useRef(signature);
  signatureRef.current = signature;
  const requestSerial = useRef(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [clarification, setClarification] = useState<ClarificationState | null>(null);
  const activePreview = preview?.baseSignature === signature ? preview : null;

  function cancel() {
    requestSerial.current += 1;
    setLoading(false);
    setError(null);
    setPreview(null);
    setClarification(null);
  }

  async function propose(issue: AiIssue, issueIndex: number, businessRule = '') {
    const serial = ++requestSerial.current;
    const baseSignature = signatureRef.current;
    setLoading(true);
    setError(null);
    setPreview(null);
    setClarification(null);

    try {
      const response = await requestAiEditProposal({
        diagramType,
        purpose,
        businessRule: diagramType === 'USE_CASE' ? businessRule.trim() : '',
        issue,
        nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
        edges: edges.map(({ id, type, source, target, data }) => ({ id, type, source, target, data })),
      });
      if (serial !== requestSerial.current) return;
      if (signatureRef.current !== baseSignature) {
        throw new Error('분석 후 다이어그램이 변경됐습니다. 다시 수정안을 생성해 주세요.');
      }
      if (response.operations.length === 0) {
        const explanation = response.description
          .replace(/operations\s*=\s*\[\s*\]/gi, '')
          .replace(/operations(?:를|은)?\s*빈\s*배열로\s*반환(?:합니다|했습니다)?\.?/gi, '')
          .replace(/자동 수정 보류[:：]?/g, '')
          .trim();
        if (diagramType === 'USE_CASE') {
          setClarification({
            issueIndex,
            question: explanation || '이 관계가 실제로 언제 필요하고, 어떤 조건에서 진행되는지 알려주세요.',
            reviewed: Boolean(businessRule.trim()),
          });
          return;
        }
        throw new Error(explanation || '이 항목은 자동 수정할 내용을 찾지 못했습니다.');
      }
      const draft = buildEditPreview(diagramType, nodes, edges, response.operations, purpose, businessRule, issue);
      setPreview({
        baseSignature,
        issueIndex,
        issueTitle: issue.title,
        description: response.description,
        ...draft,
      });
    } catch (caught) {
      if (serial === requestSerial.current) {
        setError(caught instanceof Error ? caught.message : '수정안 생성 중 오류가 발생했습니다.');
      }
    } finally {
      if (serial === requestSerial.current) setLoading(false);
    }
  }

  function apply(): boolean {
    if (!activePreview || signatureRef.current !== activePreview.baseSignature) {
      setError('현재 다이어그램이 변경되어 이전 수정안을 적용할 수 없습니다.');
      setPreview(null);
      return false;
    }
    // React automatically batches these updates; the original graph is unchanged until here.
    setNodes(activePreview.nodes);
    setEdges(activePreview.edges);
    setPreview(null);
    setError(null);
    return true;
  }

  return {
    preview: activePreview,
    clarification,
    loading,
    error: preview && !activePreview
      ? '다이어그램이 변경되어 미리보기가 만료됐습니다. 다시 생성해 주세요.'
      : error,
    propose,
    apply,
    cancel,
  };
}
