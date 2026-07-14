// 스프린트 번호 → 날짜 범위
function sprintRange(no) {
  const epoch = new Date('2025-10-13');
  const start = new Date(epoch);
  start.setDate(start.getDate() + (no - 107) * 21);
  const end = new Date(start);
  end.setDate(end.getDate() + 20);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

// ── UV ────────────────────────────────────────────────────────────────────
const UV_DATA = {
  'edu-channel': {
    111: 82300, 112: 86100, 113: 84500, 114: 88200,
    115: 87100, 116: 87176, 117: 87176, 118: 93638, 119: 91200,
  },
  edu: {
    111: 5800,  112: 6200,  113: 5900,  114: 6500,
    115: 6400,  116: 6909,  117: 6909,  118: 8310,  119: 8050,
  },
};

export function getUVData(service, sprintNo) {
  const key = service === 'edu' ? 'edu' : 'edu-channel';
  const { start, end } = sprintRange(sprintNo);
  return {
    service: key,
    startDate: start,
    endDate: end,
    activeUsers: UV_DATA[key][sprintNo] ?? null,
    filters: key === 'edu' ? { hostname: 'CONTAINS:edu.goorm.io' } : {},
  };
}

// ── 외부 CS ────────────────────────────────────────────────────────────────
// edu 서비스 스프린트별 집계
const EXT_CS = {
  edu: {
    111: { count:15, totalHour:68,  tagCounts:{ 단순문의:6,  기술문의:8,  오류문의:1 }, tagComboCounts:{ '기술문의 > 시험/문제':8,  '단순문의 > 채널관리':6,  '기술문의 > 문제설정':5,  '단순문의 > 내용없음':4,  '기술문의 > 채널관리':3 }, userTagMatrix:{ '수강자(ch)':{단순문의:2,기술문의:3}, 강의자:{단순문의:2,기술문의:4,오류문의:1}, '채널관리자(ch)':{단순문의:2,기술문의:1}, 잠재고객:{단순문의:1} } },
    112: { count:18, totalHour:82,  tagCounts:{ 단순문의:7,  기술문의:9,  오류문의:2 }, tagComboCounts:{ '기술문의 > 시험/문제':9,  '단순문의 > 채널관리':7,  '기술문의 > 문제설정':5,  '단순문의 > 내용없음':5,  '기술문의 > 채널관리':3 }, userTagMatrix:{ '수강자(ch)':{단순문의:3,기술문의:3}, 강의자:{단순문의:2,기술문의:5,오류문의:1}, '채널관리자(ch)':{단순문의:2,기술문의:1,오류문의:1}, 잠재고객:{단순문의:1} } },
    113: { count:16, totalHour:74,  tagCounts:{ 단순문의:6,  기술문의:9,  오류문의:1 }, tagComboCounts:{ '기술문의 > 시험/문제':9,  '단순문의 > 채널관리':6,  '기술문의 > 문제설정':5,  '단순문의 > 내용없음':4,  '기술문의 > 채널관리':3 }, userTagMatrix:{ '수강자(ch)':{단순문의:2,기술문의:3}, 강의자:{단순문의:2,기술문의:5,오류문의:1}, '채널관리자(ch)':{단순문의:2,기술문의:1}, 잠재고객:{단순문의:1} } },
    114: { count:17, totalHour:79,  tagCounts:{ 단순문의:7,  기술문의:9,  오류문의:1 }, tagComboCounts:{ '기술문의 > 시험/문제':9,  '단순문의 > 채널관리':7,  '기술문의 > 문제설정':5,  '단순문의 > 내용없음':5,  '기술문의 > 채널관리':4 }, userTagMatrix:{ '수강자(ch)':{단순문의:3,기술문의:3}, 강의자:{단순문의:2,기술문의:5,오류문의:1}, '채널관리자(ch)':{단순문의:2,기술문의:1}, 잠재고객:{단순문의:1} } },
    115: { count:16, totalHour:72,  tagCounts:{ 단순문의:6,  기술문의:9,  오류문의:1 }, tagComboCounts:{ '기술문의 > 시험/문제':9,  '단순문의 > 채널관리':6,  '기술문의 > 문제설정':5,  '단순문의 > 내용없음':4,  '기술문의 > 채널관리':3 }, userTagMatrix:{ '수강자(ch)':{단순문의:2,기술문의:3}, 강의자:{단순문의:2,기술문의:5,오류문의:1}, '채널관리자(ch)':{단순문의:2,기술문의:1}, 잠재고객:{단순문의:1} } },
    116: { count:19, totalHour:89,  tagCounts:{ 단순문의:7,  기술문의:10, 오류문의:2 }, tagComboCounts:{ '기술문의 > 시험/문제':10, '단순문의 > 채널관리':7,  '기술문의 > 문제설정':6,  '단순문의 > 내용없음':5,  '기술문의 > 채널관리':4 }, userTagMatrix:{ '수강자(ch)':{단순문의:3,기술문의:4}, 강의자:{단순문의:2,기술문의:5,오류문의:1}, '채널관리자(ch)':{단순문의:2,기술문의:1,오류문의:1}, 잠재고객:{단순문의:1} } },
    117: { count:18, totalHour:78,  tagCounts:{ 단순문의:6,  기술문의:10, 오류문의:2 }, tagComboCounts:{ '기술문의 > 시험/문제':10, '단순문의 > 채널관리':6,  '기술문의 > 문제설정':5,  '단순문의 > 내용없음':4,  '기술문의 > 채널관리':4 }, userTagMatrix:{ '수강자(ch)':{단순문의:2,기술문의:4}, 강의자:{단순문의:2,기술문의:5,오류문의:1}, '채널관리자(ch)':{단순문의:2,기술문의:1,오류문의:1}, 잠재고객:{단순문의:1} } },
    118: { count:27, totalHour:148, tagCounts:{ 단순문의:8,  기술문의:15, 오류문의:4 }, tagComboCounts:{ '기술문의 > 시험/문제':12, '단순문의 > 내용없음':8,  '기술문의 > 채널관리':3,  '기술문의 > 문제설정':2,  '단순문의 > 채널관리':2 }, userTagMatrix:{ '수강자(ch)':{단순문의:4,기술문의:5,오류문의:2}, 강의자:{단순문의:3,기술문의:8,오류문의:1}, '채널관리자(ch)':{단순문의:1,기술문의:2,오류문의:1}, 잠재고객:{단순문의:1} } },
    119: { count:46, totalHour:252, tagCounts:{ 단순문의:18, 기술문의:24, 오류문의:4 }, tagComboCounts:{ '기술문의 > 시험/문제':12, '단순문의 > 채널관리':9,  '기술문의 > 채널관리':3,  '기술문의 > 문제설정':2,  '단순문의 > 내용없음':2 }, userTagMatrix:{ '수강자(ch)':{단순문의:5,기술문의:8,오류문의:2}, 강의자:{단순문의:5,기술문의:12,오류문의:1}, '채널관리자(ch)':{단순문의:5,기술문의:4,오류문의:1}, 잠재고객:{단순문의:3} } },
  },
  devth: {
    111: { count:5,  totalHour:22,  tagCounts:{ 단순문의:2, 기술문의:3 }, tagComboCounts:{ '기술문의 > 빌드 오류':3, '단순문의 > 이용 방법':2 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:2}, 기업회원:{단순문의:1,기술문의:1} } },
    112: { count:6,  totalHour:27,  tagCounts:{ 단순문의:2, 기술문의:4 }, tagComboCounts:{ '기술문의 > 빌드 오류':4, '단순문의 > 이용 방법':2 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:2}, 기업회원:{단순문의:1,기술문의:2} } },
    113: { count:5,  totalHour:23,  tagCounts:{ 단순문의:2, 기술문의:3 }, tagComboCounts:{ '기술문의 > 빌드 오류':3, '단순문의 > 이용 방법':2 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:2}, 기업회원:{단순문의:1,기술문의:1} } },
    114: { count:6,  totalHour:28,  tagCounts:{ 단순문의:2, 기술문의:4 }, tagComboCounts:{ '기술문의 > 빌드 오류':4, '단순문의 > 이용 방법':2 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:2}, 기업회원:{단순문의:1,기술문의:2} } },
    115: { count:5,  totalHour:22,  tagCounts:{ 단순문의:2, 기술문의:3 }, tagComboCounts:{ '기술문의 > 빌드 오류':3, '단순문의 > 이용 방법':2 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:2}, 기업회원:{단순문의:1,기술문의:1} } },
    116: { count:7,  totalHour:32,  tagCounts:{ 단순문의:3, 기술문의:4 }, tagComboCounts:{ '기술문의 > 빌드 오류':4, '단순문의 > 이용 방법':2, '단순문의 > 요금제 안내':1 }, userTagMatrix:{ 개인회원:{단순문의:2,기술문의:2}, 기업회원:{단순문의:1,기술문의:2} } },
    117: { count:7,  totalHour:30,  tagCounts:{ 단순문의:2, 기술문의:5 }, tagComboCounts:{ '기술문의 > 빌드 오류':5, '단순문의 > 이용 방법':2 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:3}, 기업회원:{단순문의:1,기술문의:2} } },
    118: { count:10, totalHour:48,  tagCounts:{ 단순문의:3, 기술문의:7 }, tagComboCounts:{ '기술문의 > 빌드 오류':5, '기술문의 > 환경 설정':2, '단순문의 > 이용 방법':2, '단순문의 > 요금제 안내':1 }, userTagMatrix:{ 개인회원:{단순문의:2,기술문의:4}, 기업회원:{단순문의:1,기술문의:3} } },
    119: { count:8,  totalHour:36,  tagCounts:{ 단순문의:3, 기술문의:5 }, tagComboCounts:{ '기술문의 > 빌드 오류':5, '단순문의 > 이용 방법':2, '단순문의 > 요금제 안내':1 }, userTagMatrix:{ 개인회원:{단순문의:2,기술문의:3}, 기업회원:{단순문의:1,기술문의:2} } },
  },
  arkain: {
    111: { count:5,  totalHour:25,  tagCounts:{ 단순문의:1, 기술문의:4 }, tagComboCounts:{ '기술문의 > 컨테이너 오류':3, '기술문의 > 배포 오류':2, '단순문의 > 이용 방법':1 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:2}, 기업회원:{기술문의:2} } },
    112: { count:6,  totalHour:31,  tagCounts:{ 단순문의:1, 기술문의:5 }, tagComboCounts:{ '기술문의 > 컨테이너 오류':3, '기술문의 > 배포 오류':2, '단순문의 > 이용 방법':1 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:3}, 기업회원:{기술문의:2} } },
    113: { count:5,  totalHour:26,  tagCounts:{ 단순문의:1, 기술문의:4 }, tagComboCounts:{ '기술문의 > 컨테이너 오류':3, '기술문의 > 배포 오류':1, '단순문의 > 이용 방법':1 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:2}, 기업회원:{기술문의:2} } },
    114: { count:6,  totalHour:32,  tagCounts:{ 단순문의:1, 기술문의:5 }, tagComboCounts:{ '기술문의 > 컨테이너 오류':3, '기술문의 > 배포 오류':2, '단순문의 > 이용 방법':1 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:3}, 기업회원:{기술문의:2} } },
    115: { count:5,  totalHour:26,  tagCounts:{ 단순문의:1, 기술문의:4 }, tagComboCounts:{ '기술문의 > 컨테이너 오류':3, '기술문의 > 배포 오류':1, '단순문의 > 이용 방법':1 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:2}, 기업회원:{기술문의:2} } },
    116: { count:7,  totalHour:37,  tagCounts:{ 단순문의:1, 기술문의:6 }, tagComboCounts:{ '기술문의 > 컨테이너 오류':4, '기술문의 > 배포 오류':2, '단순문의 > 이용 방법':1 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:3}, 기업회원:{기술문의:3} } },
    117: { count:5,  totalHour:26,  tagCounts:{ 단순문의:1, 기술문의:4 }, tagComboCounts:{ '기술문의 > 컨테이너 오류':3, '기술문의 > 배포 오류':1, '단순문의 > 이용 방법':1 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:2}, 기업회원:{기술문의:2} } },
    118: { count:8,  totalHour:43,  tagCounts:{ 단순문의:2, 기술문의:6 }, tagComboCounts:{ '기술문의 > 컨테이너 오류':4, '기술문의 > 배포 오류':2, '단순문의 > 이용 방법':2 }, userTagMatrix:{ 개인회원:{단순문의:2,기술문의:3}, 기업회원:{기술문의:3} } },
    119: { count:7,  totalHour:37,  tagCounts:{ 단순문의:1, 기술문의:6 }, tagComboCounts:{ '기술문의 > 컨테이너 오류':4, '기술문의 > 배포 오류':2, '단순문의 > 이용 방법':1 }, userTagMatrix:{ 개인회원:{단순문의:1,기술문의:3}, 기업회원:{기술문의:3} } },
  },
};

export function getExternalCSData(service, sprintNo) {
  const svc = EXT_CS[service] || EXT_CS.edu;
  const cur  = svc[sprintNo]       || null;
  const prev = svc[sprintNo - 1]   || null;
  if (!cur) return null;

  const avgHour = cur.count ? +(cur.totalHour / cur.count).toFixed(1) : 0;
  const prevAvgHour = prev && prev.count ? +(prev.totalHour / prev.count).toFixed(1) : null;

  const top5 = Object.entries(cur.tagComboCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([combo, count]) => {
      const prevCount = prev?.tagComboCounts?.[combo] ?? 0;
      return { combo, count, prevCount };
    });

  return {
    count: cur.count,
    totalHour: cur.totalHour,
    avgHour,
    currentSprint: sprintNo,
    tagCounts: cur.tagCounts,
    tagHours: Object.fromEntries(
      Object.keys(cur.tagCounts).map((t) => [
        t,
        +(cur.totalHour * (cur.tagCounts[t] / cur.count)).toFixed(1),
      ])
    ),
    tagComboCounts: cur.tagComboCounts,
    userTagMatrix: cur.userTagMatrix,
    top5,
    prevSprint: prev
      ? { sprintNo: sprintNo - 1, totalInquiries: prev.count, avgResolutionTime: prevAvgHour }
      : null,
  };
}

// ── 내부 CS ────────────────────────────────────────────────────────────────
const INT_TRENDS = {
  edu: [
    { sprint: '111', requests: 12, avgDays: 2.1 },
    { sprint: '112', requests: 15, avgDays: 2.4 },
    { sprint: '113', requests: 13, avgDays: 2.2 },
    { sprint: '114', requests: 16, avgDays: 2.6 },
    { sprint: '115', requests: 14, avgDays: 2.5 },
    { sprint: '116', requests: 17, avgDays: 2.8 },
    { sprint: '117', requests: 15, avgDays: 2.6 },
    { sprint: '118', requests: 21, avgDays: 3.1 },
    { sprint: '119', requests: 23, avgDays: 4.2 },
  ],
  devth: [
    { sprint: '111', requests: 3, avgDays: 2.8 },
    { sprint: '112', requests: 4, avgDays: 3.0 },
    { sprint: '113', requests: 3, avgDays: 2.9 },
    { sprint: '114', requests: 4, avgDays: 3.1 },
    { sprint: '115', requests: 3, avgDays: 2.9 },
    { sprint: '116', requests: 5, avgDays: 3.5 },
    { sprint: '117', requests: 4, avgDays: 3.2 },
    { sprint: '118', requests: 6, avgDays: 4.1 },
    { sprint: '119', requests: 5, avgDays: 3.8 },
  ],
  arkain: [
    { sprint: '111', requests: 3, avgDays: 2.9 },
    { sprint: '112', requests: 4, avgDays: 3.1 },
    { sprint: '113', requests: 3, avgDays: 3.0 },
    { sprint: '114', requests: 4, avgDays: 3.3 },
    { sprint: '115', requests: 3, avgDays: 3.1 },
    { sprint: '116', requests: 5, avgDays: 3.8 },
    { sprint: '117', requests: 4, avgDays: 3.4 },
    { sprint: '118', requests: 6, avgDays: 4.3 },
    { sprint: '119', requests: 5, avgDays: 4.0 },
  ],
};

const INT_TYPE_DIST = {
  edu: [
    { type: '기타',             count: 6 },
    { type: '데이터 수정',      count: 5 },
    { type: '오픈 제보/피드백', count: 4 },
    { type: '채널 생성',        count: 4 },
    { type: '강의 복사',        count: 4 },
  ],
  devth: [
    { type: '기능 개선 요청', count: 3 },
    { type: '버그 수정 요청', count: 2 },
  ],
  arkain: [
    { type: '기능 개선 요청', count: 3 },
    { type: '버그 수정 요청', count: 2 },
  ],
};

export function getInternalCSData(service, sprintNo) {
  const trends = INT_TRENDS[service] || INT_TRENDS.edu;
  const cur = trends.find((t) => t.sprint === String(sprintNo)) || trends[trends.length - 1];
  return {
    totalRequests: cur.requests,
    avgDays: cur.avgDays,
    sprintTrends: trends,
    typeDist: INT_TYPE_DIST[service] || INT_TYPE_DIST.edu,
  };
}

// ── AI VoC 인사이트 ────────────────────────────────────────────────────────
const VOC_INSIGHTS = {
  'edu_118_119': {
    insights: [
      {
        tag: '기술문의',
        title: '기술문의량은 동일하지만, 처리시간이 크게 증가한 원인',
        points: [
          '이전 스프린트(S118)에서는 시험/문제 기능 사용법 안내 중심의 단순 기술 문의가 주를 이루었습니다.',
          '이번 스프린트(S119)에서는 채널 관리 및 문제 설정 관련 복잡한 이슈가 새롭게 등장하며 심층 분석이 필요한 문의가 증가했습니다.',
          'S118이 기능 안내 중심이었다면, S119는 복잡한 운영 이슈 대응 중심으로 이동한 구간으로 볼 수 있습니다.',
        ],
      },
      {
        tag: '단순문의',
        title: '단순문의 건수가 125% 급증한 원인',
        points: [
          '신규 채널 개설 이벤트 이후 처음 플랫폼을 접하는 강의자·채널관리자의 유입이 크게 늘었습니다.',
          '내용 없이 제목만 작성된 문의(내용없음)가 8건에서 2건으로 감소했지만, 채널관리 관련 단순 안내 문의가 대폭 증가했습니다.',
          '신규 사용자 온보딩 가이드 강화와 FAQ 보완이 필요한 시점입니다.',
        ],
      },
    ],
  },
};

export function getVoCInsight(service, prevSprint, curSprint) {
  const key = `${service}_${prevSprint}_${curSprint}`;
  if (VOC_INSIGHTS[key]) return VOC_INSIGHTS[key];
  // 기본 fallback
  return {
    insights: [
      {
        tag: '기술문의',
        title: `S${prevSprint} → S${curSprint} 기술문의 변화 분석`,
        points: [
          '이전 스프린트 대비 기술문의 패턴에 변화가 감지되었습니다.',
          '상세 분석을 위해 GEMINI_API_KEY를 설정하면 AI 인사이트가 자동 생성됩니다.',
        ],
      },
    ],
  };
}
