//import { useState } from 'react'; 추가 2026-11-07 01:05 이규찬
import { useState } from 'react';
import type { ReactNode } from 'react';
import type { DiagramNode } from '../types/diagram';
import { renderClassEditForm } from './class/editFormRenderer';
import { renderFlowchartEditForm } from './flowchart/editFormRenderer';

export type NodeEditFormRenderer = (
  node: DiagramNode,
  onSave: (updatedNode: DiagramNode) => void,
  onCancel: () => void
) => ReactNode;

// 편집 폼의 등록 위치를 공통 모달에서 분리한다.
// 기존 프로젝트에서 실제 연결된 classNode, flowchartNode만 유지한다.
const editFormRegistry: Partial<Record<NonNullable<DiagramNode['type']>, NodeEditFormRenderer>> = {
  classNode: renderClassEditForm,
  flowchartNode: renderFlowchartEditForm,
};

export function renderNodeEditForm(
  node: DiagramNode,
  onSave: (updatedNode: DiagramNode) => void,
  onCancel: () => void
): ReactNode {
  const renderer = node.type ? editFormRegistry[node.type] : undefined;

  return renderer
    ? renderer(node, onSave, onCancel)
    : <p>지원하지 않는 노드 유형입니다.</p>;
}

// =====================================================================
// 작성일: 2026-11-07 02:00 이규찬 수정
// 설명: 기존 원본 구조와 함수를 그대로 보존한 채, 하단에 새로 추가된 노드 타입들과 
//       기존 노드 타입들의 편집 폼 매핑 및 정밀 디스패처를 안전하게 주입합니다.
// =====================================================================

const createStrictEditForm = (title: string) => {
  const FormComponent: NodeEditFormRenderer = (node, onSave, onCancel) => {
    const [label, setLabel] = useState((node as any).data?.label || '');

    return (
      <div style={{ 
        padding: '20px', 
        width: '320px', 
        maxWidth: '100%', 
        background: '#fff', 
        borderRadius: '8px', 
        boxSizing: 'border-box',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', color: '#000' }}>
          {title} 편집
        </h3>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#333' }}>
            이름 / 내용 (Label)
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            autoFocus
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: '6px 12px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({
                ...node,
                data: {
                  ...(node.data as any),
                  label: label,
                },
              } as any);
            }}
            style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            저장
          </button>
        </div>
      </div>
    );
  };
  return FormComponent;
};

const strictActorForm = createStrictEditForm('액터');
const strictUseCaseForm = createStrictEditForm('유스케이스');
const strictBoundaryForm = createStrictEditForm('시스템 경계');
const strictSubsystemForm = createStrictEditForm('서브시스템');
const strictExternalSystemForm = createStrictEditForm('외부 시스템');
const strictNoteForm = createStrictEditForm('노트 주석');

const strictDispatcher: NodeEditFormRenderer = (node, onSave, onCancel) => {
  const rawNode = node as any;
  const label = (rawNode.data?.label || '').toLowerCase();
  const type = (rawNode.type || '').toLowerCase();
  const id = (rawNode.id || '').toLowerCase();
  const nodeCategory = (rawNode.data?.category || rawNode.data?.type || '').toLowerCase();

  const combinedStr = `${type} ${id} ${label} ${nodeCategory}`;

  if (combinedStr.includes('sub') || combinedStr.includes('서브')) {
    return strictSubsystemForm(node, onSave, onCancel);
  }
  if (combinedStr.includes('external') || combinedStr.includes('ext') || combinedStr.includes('외부') || combinedStr.includes('db')) {
    return strictExternalSystemForm(node, onSave, onCancel);
  }
  if (combinedStr.includes('note') || combinedStr.includes('annotation') || combinedStr.includes('comment') || combinedStr.includes('노트') || combinedStr.includes('주석')) {
    return strictNoteForm(node, onSave, onCancel);
  }
  if (combinedStr.includes('boundary') || combinedStr.includes('경계')) {
    return strictBoundaryForm(node, onSave, onCancel);
  }
  if (combinedStr.includes('actor') || combinedStr.includes('액터')) {
    return strictActorForm(node, onSave, onCancel);
  }
  
  return strictUseCaseForm(node, onSave, onCancel);
};

const targetKeys = [
  'actorNode', 'useCaseNode', 'boundaryNode',
  'actor', 'Actor', 'usecase', 'useCase', 
  'systemBoundary', 'system-boundary', 'system_boundary', 'boundary', 'Boundary',
  'subsystem', 'subSystem', 'sub_system',
  'externalSystem', 'external-system', 'external_system', 'external',
  'note', 'annotation', 'comment', 'text'
];

targetKeys.forEach((key) => {
  (editFormRegistry as any)[key] = strictDispatcher;
});