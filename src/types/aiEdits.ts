import type { DiagramType } from './diagram';
import type { AiIssue } from './ai';

/** Structured operations suggested by the model. Never apply without preview + approval. */
export type AiEditKind = 'ADD_NODE' | 'UPDATE_NODE' | 'ADD_EDGE' | 'UPDATE_EDGE';

export type AiEditOperation = {
  kind: AiEditKind;
  targetId: string;
  tempId: string;
  source: string;
  target: string;
  className: string;
  attributes: string[];
  removeAttributes: string[];
  methods: string[];
  label: string;
  shape: string;
  relationType: string;
  sourceMultiplicity: string;
  targetMultiplicity: string;
};

export type AiEditProposal = {
  description: string;
  operations: AiEditOperation[];
};

export type AiEditRequest = {
  diagramType: DiagramType;
  purpose: string;
  issue: AiIssue;
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
    data?: unknown;
  }>;
};
