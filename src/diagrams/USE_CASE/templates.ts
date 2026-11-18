import type { DiagramNode, DiagramEdge } from '../../types/diagram';

// 2026-11-12 추가: 유스케이스 사례 템플릿 (유스케이스 폴더 안에서만 관리)
export type UseCaseTemplate = {
  id: string;
  label: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

type Relation = 'association' | 'include' | 'extend' | 'generalization';

const edge = (
  id: string,
  source: string,
  sourceHandle: string,
  target: string,
  targetHandle: string,
  relationType: Relation = 'association'
) => ({
  id,
  source,
  sourceHandle,
  target,
  targetHandle,
  type: 'umlEdge',
  data: { relationType },
});

const actor = (id: string, label: string, x: number, y: number) => ({
  id,
  type: 'actorNode',
  position: { x, y },
  style: { width: 90, height: 100 },
  data: { label },
});

const useCase = (id: string, label: string, y: number) => ({
  id,
  type: 'useCaseNode',
  position: { x: 360, y },
  style: { width: 150, height: 75 },
  data: { label },
});

const butcherShop: UseCaseTemplate = {
  id: 'butcher-shop',
  label: '고깃집 주문 시스템',
  nodes: [
    {
      id: 'bs-boundary',
      type: 'boundaryNode',
      position: { x: 300, y: 40 },
      zIndex: -1,
      style: { width: 270, height: 640 },
      data: { title: '고깃집 주문 시스템' },
    },
    actor('bs-customer', '손님', 60, 150),
    actor('bs-staff', '직원', 60, 330),
    actor('bs-owner', '사장', 680, 400),
    useCase('bs-reserve', '예약하기', 90),
    useCase('bs-order', '주문하기', 200),
    useCase('bs-pay', '결제하기', 310),
    useCase('bs-menu', '메뉴 관리', 420),
    useCase('bs-sales', '매출 확인', 530),
  ] as unknown as DiagramNode[],
  edges: [
    edge('bs-e1', 'bs-customer', 'right', 'bs-reserve', 'left'),
    edge('bs-e2', 'bs-customer', 'right', 'bs-order', 'left'),
    edge('bs-e3', 'bs-staff', 'right', 'bs-order', 'left'),
    edge('bs-e4', 'bs-staff', 'right', 'bs-pay', 'left'),
    edge('bs-e5', 'bs-order', 'bottom', 'bs-pay', 'top', 'include'),
    edge('bs-e6', 'bs-owner', 'left', 'bs-menu', 'right'),
    edge('bs-e7', 'bs-owner', 'left', 'bs-sales', 'right'),
  ] as unknown as DiagramEdge[],
};

export const useCaseTemplates: UseCaseTemplate[] = [butcherShop];