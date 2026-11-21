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

// ===== 2026-11-18 추가: 쇼핑몰 템플릿 =====
const shoppingMall: UseCaseTemplate = {
  id: 'shopping-mall',
  label: '쇼핑몰 주문 시스템',
  nodes: [
    {
      id: 'sm-boundary',
      type: 'boundaryNode',
      position: { x: 300, y: 40 },
      zIndex: -1,
      style: { width: 270, height: 760 }, // 2026-11-18: 유스케이스 6개가 들어가도록 640 → 760
      data: { title: '쇼핑몰 시스템' },
    },
    actor('sm-customer', '고객', 60, 220),
    actor('sm-admin', '관리자', 680, 330),
    actor('sm-pg', '결제 대행사', 680, 540),
    useCase('sm-login', '회원가입/로그인', 90),
    useCase('sm-search', '상품 검색', 200),
    useCase('sm-cart', '장바구니 담기', 310),
    useCase('sm-order', '주문하기', 420),
    useCase('sm-pay', '결제하기', 530),
    useCase('sm-product', '상품 관리', 640),
  ] as unknown as DiagramNode[],
  edges: [
    edge('sm-e1', 'sm-customer', 'right', 'sm-login', 'left'),
    edge('sm-e2', 'sm-customer', 'right', 'sm-search', 'left'),
    edge('sm-e3', 'sm-customer', 'right', 'sm-cart', 'left'),
    edge('sm-e4', 'sm-customer', 'right', 'sm-order', 'left'),
    edge('sm-e5', 'sm-order', 'bottom', 'sm-pay', 'top', 'include'),
    edge('sm-e6', 'sm-pg', 'left', 'sm-pay', 'right'),
    edge('sm-e7', 'sm-admin', 'left', 'sm-product', 'right'),
  ] as unknown as DiagramEdge[],
};
// ===== 2026-11-18 추가 끝 =====

// ===== 2026-11-18 추가: 소상공인 상점 템플릿 =====
const smallShop: UseCaseTemplate = {
  id: 'small-shop',
  label: '소상공인 상점 (재고·판매)',
  nodes: [
    {
      id: 'ss-boundary',
      type: 'boundaryNode',
      position: { x: 300, y: 40 },
      zIndex: -1,
      style: { width: 270, height: 760 }, // 2026-11-18: 유스케이스 6개가 들어가도록 640 → 760
      data: { title: '상점 관리 시스템' },
    },
    actor('ss-owner', '사장', 60, 220),
    actor('ss-clerk', '직원', 60, 420),
    actor('ss-supplier', '납품업체', 680, 330),
    useCase('ss-sell', '상품 판매', 90),
    useCase('ss-pay', '결제 처리', 200),
    useCase('ss-stock', '재고 확인', 310),
    useCase('ss-order', '재고 발주', 420),
    useCase('ss-sales', '매출 조회', 530),
    useCase('ss-member', '단골 관리', 640),
  ] as unknown as DiagramNode[],
  edges: [
    edge('ss-e1', 'ss-clerk', 'right', 'ss-sell', 'left'),
    edge('ss-e2', 'ss-clerk', 'right', 'ss-stock', 'left'),
    edge('ss-e3', 'ss-sell', 'bottom', 'ss-pay', 'top', 'include'),
    edge('ss-e4', 'ss-owner', 'right', 'ss-order', 'left'),
    edge('ss-e5', 'ss-owner', 'right', 'ss-sales', 'left'),
    edge('ss-e6', 'ss-owner', 'right', 'ss-member', 'left'),
    edge('ss-e7', 'ss-supplier', 'left', 'ss-order', 'right'),
    edge('ss-e8', 'ss-stock', 'bottom', 'ss-order', 'top', 'extend'),
  ] as unknown as DiagramEdge[],
};
// ===== 2026-11-18 추가 끝 =====

// 2026-11-18 수정: 파일 맨 아래로 옮기고 쇼핑몰, 소상공인 상점 추가 (이전: [butcherShop])
export const useCaseTemplates: UseCaseTemplate[] = [butcherShop, shoppingMall, smallShop];