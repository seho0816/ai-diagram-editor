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

// ===== 2026-11-18 추가: 학교 도서관 템플릿 =====
const library: UseCaseTemplate = {
  id: 'library',
  label: '학교 도서관',
  nodes: [
    {
      id: 'lb-boundary',
      type: 'boundaryNode',
      position: { x: 300, y: 40 },
      zIndex: -1,
      style: { width: 270, height: 650 },
      data: { title: '도서관 시스템' },
    },
    actor('lb-student', '학생', 60, 220),
    actor('lb-librarian', '사서', 680, 330),
    useCase('lb-search', '도서 검색', 90),
    useCase('lb-borrow', '대출하기', 200),
    useCase('lb-return', '반납하기', 310),
    useCase('lb-reserve', '도서 예약', 420),
    useCase('lb-manage', '도서 관리', 530),
  ] as unknown as DiagramNode[],
  edges: [
    edge('lb-e1', 'lb-student', 'right', 'lb-search', 'left'),
    edge('lb-e2', 'lb-student', 'right', 'lb-borrow', 'left'),
    edge('lb-e3', 'lb-student', 'right', 'lb-return', 'left'),
    edge('lb-e4', 'lb-student', 'right', 'lb-reserve', 'left'),
    edge('lb-e5', 'lb-librarian', 'left', 'lb-manage', 'right'),
    edge('lb-e6', 'lb-librarian', 'left', 'lb-borrow', 'right'),
    edge('lb-e7', 'lb-borrow', 'bottom', 'lb-search', 'top', 'extend'),
  ] as unknown as DiagramEdge[],
};
// ===== 2026-11-18 추가 끝 =====

// ===== 2026-11-18 추가: 병원 예약 템플릿 =====
const hospital: UseCaseTemplate = {
  id: 'hospital',
  label: '병원 예약',
  nodes: [
    {
      id: 'hp-boundary',
      type: 'boundaryNode',
      position: { x: 300, y: 40 },
      zIndex: -1,
      style: { width: 270, height: 650 },
      data: { title: '병원 예약 시스템' },
    },
    actor('hp-patient', '환자', 60, 160),
    actor('hp-staff', '접수 직원', 60, 400),
    actor('hp-doctor', '의사', 680, 330),
    useCase('hp-reserve', '진료 예약', 90),
    useCase('hp-cancel', '예약 취소', 200),
    useCase('hp-check', '접수 확인', 310),
    useCase('hp-record', '진료 기록 작성', 420),
    useCase('hp-pay', '진료비 수납', 530),
  ] as unknown as DiagramNode[],
  edges: [
    edge('hp-e1', 'hp-patient', 'right', 'hp-reserve', 'left'),
    edge('hp-e2', 'hp-patient', 'right', 'hp-cancel', 'left'),
    edge('hp-e3', 'hp-staff', 'right', 'hp-check', 'left'),
    edge('hp-e4', 'hp-staff', 'right', 'hp-pay', 'left'),
    edge('hp-e5', 'hp-doctor', 'left', 'hp-record', 'right'),
    edge('hp-e6', 'hp-reserve', 'bottom', 'hp-check', 'top', 'include'),
    edge('hp-e7', 'hp-cancel', 'bottom', 'hp-reserve', 'top', 'extend'),
  ] as unknown as DiagramEdge[],
};
// ===== 2026-11-18 추가 끝 =====

// ===== 2026-11-18 추가: 배달앱 템플릿 =====
const deliveryApp: UseCaseTemplate = {
  id: 'delivery-app',
  label: '배달앱',
  nodes: [
    {
      id: 'dl-boundary',
      type: 'boundaryNode',
      position: { x: 300, y: 40 },
      zIndex: -1,
      style: { width: 270, height: 650 },
      data: { title: '배달앱 시스템' },
    },
    actor('dl-customer', '고객', 60, 160),
    actor('dl-store', '가게 사장', 680, 160),
    actor('dl-rider', '라이더', 680, 440),
    useCase('dl-search', '가게 검색', 90),
    useCase('dl-order', '음식 주문', 200),
    useCase('dl-pay', '결제하기', 310),
    useCase('dl-accept', '주문 접수', 420),
    useCase('dl-deliver', '배달하기', 530),
  ] as unknown as DiagramNode[],
  edges: [
    edge('dl-e1', 'dl-customer', 'right', 'dl-search', 'left'),
    edge('dl-e2', 'dl-customer', 'right', 'dl-order', 'left'),
    edge('dl-e3', 'dl-store', 'left', 'dl-accept', 'right'),
    edge('dl-e4', 'dl-rider', 'left', 'dl-deliver', 'right'),
    edge('dl-e5', 'dl-order', 'bottom', 'dl-pay', 'top', 'include'),
    edge('dl-e6', 'dl-accept', 'bottom', 'dl-deliver', 'top', 'include'),
  ] as unknown as DiagramEdge[],
};
// ===== 2026-11-18 추가 끝 =====

// ===== 2026-11-18 추가: 카페 키오스크 템플릿 =====
const cafeKiosk: UseCaseTemplate = {
  id: 'cafe-kiosk',
  label: '카페 키오스크',
  nodes: [
    {
      id: 'ck-boundary',
      type: 'boundaryNode',
      position: { x: 300, y: 40 },
      zIndex: -1,
      style: { width: 270, height: 650 },
      data: { title: '키오스크 시스템' },
    },
    actor('ck-customer', '손님', 60, 220),
    actor('ck-manager', '점장', 680, 330),
    useCase('ck-menu', '메뉴 선택', 90),
    useCase('ck-option', '옵션 선택', 200),
    useCase('ck-pay', '결제하기', 310),
    useCase('ck-point', '포인트 적립', 420),
    useCase('ck-stock', '재고 관리', 530),
  ] as unknown as DiagramNode[],
  edges: [
    edge('ck-e1', 'ck-customer', 'right', 'ck-menu', 'left'),
    edge('ck-e2', 'ck-customer', 'right', 'ck-pay', 'left'),
    edge('ck-e3', 'ck-manager', 'left', 'ck-stock', 'right'),
    edge('ck-e4', 'ck-menu', 'bottom', 'ck-pay', 'top', 'include'),
    edge('ck-e5', 'ck-option', 'bottom', 'ck-menu', 'top', 'extend'),
    edge('ck-e6', 'ck-point', 'bottom', 'ck-pay', 'top', 'extend'),
  ] as unknown as DiagramEdge[],
};
// ===== 2026-11-18 추가 끝 =====

// 2026-11-18 수정: 도서관, 병원, 배달앱, 카페 추가 (이전: [butcherShop, shoppingMall, smallShop])
export const useCaseTemplates: UseCaseTemplate[] = [
  butcherShop,
  shoppingMall,
  smallShop,
  library,
  hospital,
  deliveryApp,
  cafeKiosk,
];