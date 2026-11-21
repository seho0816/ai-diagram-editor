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
        lineStyle={{ borderColor: '#1d4ed8' }} // 2026-11-18 스타일
        handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          minWidth: 150,
          minHeight: 100,
          boxSizing: 'border-box',
          border: selected ? '3px dashed #1d4ed8' : '2.5px dashed #1d4ed8', // 2026-11-18 스타일
          borderRadius: '10px', // 2026-11-18 스타일
          background: selected
            ? 'rgba(29, 78, 216, 0.08)' // 2026-11-18 스타일
            : 'rgba(248, 250, 252, 0.6)', // 2026-11-18 스타일
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-14px', // 2026-11-18 스타일
            left: '16px',
            background: '#fff',
            padding: '0 10px', // 2026-11-18 스타일
            fontSize: '15px', // 2026-11-18 스타일
            fontWeight: 800, // 2026-11-18 스타일
            color: '#1d4ed8', // 2026-11-18 스타일
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