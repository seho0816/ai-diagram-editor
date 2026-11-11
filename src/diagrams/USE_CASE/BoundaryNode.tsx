import { NodeResizer, type NodeProps } from '@xyflow/react';
import type { BoundaryNode as BoundaryNodeType } from './types';

function BoundaryNode({ data, selected }: NodeProps<BoundaryNodeType>) {
  return (
    <>
      {/* 선택됐을 때만 크기 조절 핸들 표시 */}
      <NodeResizer
        isVisible={selected}
        minWidth={150}
        minHeight={100}
        lineStyle={{ borderColor: '#2563eb' }}
        handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          minWidth: 150,
          minHeight: 100,
          boxSizing: 'border-box',
          border: selected ? '2px dashed #2563eb' : '2px dashed #94a3b8',
          borderRadius: '8px',
          background: selected
            ? 'rgba(37, 99, 235, 0.06)'
            : 'rgba(248, 250, 252, 0.4)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '16px',
            background: '#fff',
            padding: '0 8px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1e293b',
            maxWidth: 'calc(100% - 48px)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {data.title || '시스템 경계'}
        </div>
      </div>
    </>
  );
}

export default BoundaryNode;