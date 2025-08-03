import * as XLSX from 'xlsx';
import { ExcelParseResult, OperationTeam, ExtractedWorkOrderData, WorkOrder } from '@/types';

const OPERATION_TEAMS: OperationTeam[] = [
  '울산T',
  '동부산T',
  '중부산T',
  '서부산T',
  '김해T',
  '진주T',
  '통영T',
  '창원T',
  '지하철T'
];

function normalizeOperationTeam(value: string): OperationTeam {
  const normalized = value.trim();
  
  // 직접 매치 - 원본 값 우선 유지
  if (OPERATION_TEAMS.includes(normalized as OperationTeam)) {
    return normalized as OperationTeam;
  }
  
  // 부분 매치 - 새로운 팀 구조에 맞게 매핑
  if (normalized.includes('울산')) {
    return '울산T';
  }
  if (normalized.includes('동부산')) {
    return '동부산T';
  }
  if (normalized.includes('중부산')) {
    return '중부산T';
  }
  if (normalized.includes('서부산')) {
    return '서부산T';
  }
  if (normalized.includes('김해')) {
    return '김해T';
  }
  if (normalized.includes('진주')) {
    return '진주T';
  }
  if (normalized.includes('통영')) {
    return '통영T';
  }
  if (normalized.includes('창원')) {
    return '창원T';
  }
  if (normalized.includes('지하철')) {
    return '지하철T';
  }
  
  // 기존 운용팀 번호를 새로운 팀으로 매핑 (임시)
  if (normalized.includes('운용1') || normalized.includes('1팀')) {
    return '울산T';
  }
  if (normalized.includes('운용2') || normalized.includes('2팀')) {
    return '동부산T';
  }
  if (normalized.includes('운용3') || normalized.includes('3팀')) {
    return '중부산T';
  }
  if (normalized.includes('운용4') || normalized.includes('4팀')) {
    return '서부산T';
  }
  if (normalized.includes('운용5') || normalized.includes('5팀')) {
    return '김해T';
  }
  
  // 기본값을 첫 번째 팀으로 설정
  return '울산T';
}

// 병합된 헤더 정보를 처리하는 함수 - 2~3행의 병합된 헤더 구조 분석
function processMergedHeaders(jsonData: unknown[][]): { [key: string]: number } {
  const headerMapping: { [key: string]: number } = {};
  
  console.log('🔍 실제 엑셀 파일 헤더 구조 분석:');
  
  // 15개 필수 필드의 헤더 텍스트 패턴 정의
  const headerPatterns = {
    '관리번호': [
      '관리번호', '관리', '번호'
    ],
    '작업요청일': [
      '작업요청일', '요청일', '작업일', '요청', '일정', '날짜', '예정일', '작업 요청일'
    ],
    'DU측_운용팀': [
      'DU측 운용팀', 'DU측', 'DU 운용팀', 'DU운용팀'
    ],
    'RU측_운용팀': [
      'RU측 운용팀', 'RU측', 'RU 운용팀', 'RU운용팀'
    ],
    '대표_RU_ID': [
      '대표 RU_ID', 'RU_ID', 'RU ID', 'RUID', '대표RU'
    ],
    '대표_RU_명': [
      '대표 RU_명', 'RU_명', 'RU 명', 'RU명', '대표RU명'
    ],
    '5G_Co_Site_수량': [
      '5G CO-SITE 수량', '5G CO-', 'Co-Site', '수량', 'CO-SITE', 'SITE 수량'
    ],
    '5G_집중국명': [
      '5G 집중국명', '집중국명', '집중국', '국명'
    ],
    '회선번호': [
      '회선번호', '회선', '번호'
    ],
    '선번장': [
      '선번장', 'LTE MUX', 'LTE', 'MUX'
    ],
    '종류': [
      'MUX 종류', '종류', '타입', 'Type'
    ],
    '서비스_구분': [
      '서비스 구분', '서비스구분', '서비스', '구분'
    ],
    'DU_ID': [
      'DU ID', 'DUID', 'DU_ID', 'DU-ID'
    ],
    'DU_명': [
      'DU 명', 'DU명', 'DU_명', 'DU-명'
    ],
    '채널카드': [
      '채널카드', '채널', '카드', 'CH', 'CARD'
    ],
    '포트_A': [
      '포트', 'PORT', '포트A', 'A', 'Port A'
    ]
  };
  
  
  // 2행과 3행에서 병합된 헤더 텍스트 분석
  if (jsonData.length >= 3) {
    const row2 = jsonData[1] || []; // 2행 (상위 헤더)
    const row3 = jsonData[2] || []; // 3행 (하위 헤더)
    
    console.log('📋 1행:', jsonData[0]?.slice(0, 20).join(' | ') || 'N/A');
    console.log('📋 2행:', row2.slice(0, 20).join(' | '));
    console.log('📋 3행:', row3.slice(0, 20).join(' | ') || 'N/A');
    
    
    // 최대 컬럼 수까지 검사
    const maxCols = Math.max(row2.length, 30);
    
    for (let colIndex = 0; colIndex < maxCols; colIndex++) {
      const header2 = String(row2[colIndex] || '').trim();
      const header3 = String(row3[colIndex] || '').trim();
      const combinedHeader = header2 + ' ' + header3; // 2행과 3행 헤더 결합
      
      // 각 필수 필드와 매칭 시도
      for (const [fieldName, patterns] of Object.entries(headerPatterns)) {
        if (headerMapping[fieldName] === undefined) {
          // 패턴 매칭 - 대소문자 무시, 부분 매칭
          const isMatch = patterns.some(pattern => {
            const patternLower = pattern.toLowerCase();
            const header2Lower = header2.toLowerCase();
            const header3Lower = header3.toLowerCase();
            const combinedLower = combinedHeader.toLowerCase();
            
            return header2Lower.includes(patternLower) || 
                   header3Lower.includes(patternLower) || 
                   combinedLower.includes(patternLower);
          });
          
          if (isMatch) {
            headerMapping[fieldName] = colIndex;
            console.log(`✅ ${fieldName} -> 컬럼 ${colIndex} (${header2} ${header3})`);
            break;
          }
        }
      }
    }
  }
  
  console.log('📊 최종 헤더 매핑 결과:', headerMapping);
  
  // 매핑되지 않은 필드 확인 및 경고
  const unmappedFields = Object.keys(headerPatterns).filter(field => headerMapping[field] === undefined);
  if (unmappedFields.length > 0) {
    console.log('⚠️ 매핑되지 않은 필드:', unmappedFields);
    
    // 기본 순서대로 매핑 (fallback)
    let fallbackIndex = 0;
    for (const field of unmappedFields) {
      headerMapping[field] = fallbackIndex++;
    }
  }
  
  return headerMapping;
}

// 셀 값을 안전하게 문자열로 변환하고 빈 값은 N/A로 처리
function safeStringValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  return String(value).trim();
}

// 16개 항목 추출하여 DU측과 RU측 작업을 별도로 생성하는 함수
function extractWorkOrders(row: unknown[], headerMapping: { [key: string]: number }): ExtractedWorkOrderData[] {
  // 회선번호는 원본 숫자 형태로 보존 (과학적 표기법 방지)
  const rawLineNumber = row[headerMapping['회선번호']];
  const lineNumberStr = rawLineNumber !== undefined && rawLineNumber !== null ? 
    String(rawLineNumber) : 'N/A';
  
  const baseData = {
    관리번호: safeStringValue(row[headerMapping['관리번호']]),
    작업요청일: safeStringValue(row[headerMapping['작업요청일']]),
    대표_RU_ID: safeStringValue(row[headerMapping['대표_RU_ID']]),
    대표_RU_명: safeStringValue(row[headerMapping['대표_RU_명']]),
    "5G_Co_Site_수량": safeStringValue(row[headerMapping['5G_Co_Site_수량']]),
    "5G_집중국명": safeStringValue(row[headerMapping['5G_집중국명']]),
    회선번호: lineNumberStr,
    선번장: safeStringValue(row[headerMapping['선번장']]),
    종류: safeStringValue(row[headerMapping['종류']]),
    서비스_구분: safeStringValue(row[headerMapping['서비스_구분']]),
    DU_ID: safeStringValue(row[headerMapping['DU_ID']]),
    DU_명: safeStringValue(row[headerMapping['DU_명']]),
    채널카드: safeStringValue(row[headerMapping['채널카드']]),
    포트_A: safeStringValue(row[headerMapping['포트_A']])
  };
  
  const duTeam = normalizeOperationTeam(safeStringValue(row[headerMapping['DU측_운용팀']]));
  const ruTeam = normalizeOperationTeam(safeStringValue(row[headerMapping['RU측_운용팀']]));
  
  const result: ExtractedWorkOrderData[] = [];
  
  // DU측 작업 생성
  result.push({
    ...baseData,
    작업구분: 'DU측',
    DU측_운용팀: duTeam,
    RU측_운용팀: ruTeam
  });
  
  // RU측 작업 생성 (DU측과 RU측이 다른 팀인 경우에만)
  if (duTeam !== ruTeam) {
    result.push({
      ...baseData,
      작업구분: 'RU측',
      DU측_운용팀: duTeam,
      RU측_운용팀: ruTeam
    });
  }
  
  return result;
}

export function parseExcelFile(file: File): Promise<ExcelParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellStyles: true });
        
        if (workbook.SheetNames.length === 0) {
          resolve({
            success: false,
            data: [],
            errors: ['Excel 파일에 시트가 없습니다.']
          });
          return;
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: true  // 과학적 표기법 방지를 위해 raw 데이터 사용
        }) as unknown[][];
        
        // 병합된 셀 정보 처리
        const headerMapping = processMergedHeaders(jsonData);
        
        if (jsonData.length < 4) {
          resolve({
            success: false,
            data: [],
            errors: ['Excel 파일이 올바른 형식이 아닙니다. 최소 4행이 필요합니다. (헤더 3행 + 데이터 1행)']
          });
          return;
        }
        
        
        const parsedData = [];
        const errors: string[] = [];
        
        // 데이터는 4행부터 시작 (0-based index 3)
        
        for (let i = 3; i < jsonData.length; i++) { // 4행부터 (0-based index 3)
          const row = jsonData[i];
          
          // 빈 행 체크 - 모든 셀이 비어있거나 공백인 경우 건너뜀
          if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
            continue;
          }
          
          // 불필요한 데이터 필터링 - 감사 인사말 등
          const rowText = row.join(' ').toLowerCase().trim();
          
          // 빈 행이거나 의미없는 텍스트만 있는 행 제외
          if (rowText.includes('감사합니다') || 
              rowText.includes('수고하십시오') ||
              rowText.includes('수고하세요') ||
              rowText.includes('고생하셨습니다') ||
              rowText.includes('안녕히') ||
              rowText.includes('헤더') ||
              rowText.includes('제목') ||
              rowText.includes('ㅎㅎ') ||
              rowText.includes('^^') ||
              rowText.includes('수고') ||
              rowText.includes('안녕') ||
              rowText.includes('잘') ||
              rowText.includes('다음') ||
              rowText === '' ||
              row.every(cell => {
                const cellText = String(cell || '').trim().toLowerCase();
                return cellText === '' || 
                       cellText.length < 2 ||
                       /^[^가-힣a-zA-Z0-9_-]+$/.test(cellText); // 특수문자만 있는 경우
              })) {
            continue;
          }
          
          try {
            const workOrders = extractWorkOrders(row, headerMapping);
            
            // 각 작업지시(DU측/RU측)에 대해 유효성 검증
            for (const workOrder of workOrders) {
              const hasValidData = workOrder.관리번호 !== 'N/A' || 
                                   workOrder.DU_ID !== 'N/A' || 
                                   workOrder.작업요청일 !== 'N/A';
              
              if (hasValidData) {
                parsedData.push(workOrder);
              }
            }
          } catch (error) {
            errors.push((i + 1) + '행: 데이터 파싱 오류 - ' + error);
          }
        }
        
        
        resolve({
          success: errors.length === 0 || parsedData.length > 0,
          data: parsedData,
          errors
        });
        
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: ['Excel 파일 파싱 오류: ' + error]
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['파일을 읽을 수 없습니다.']
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// 한국어 필드명을 영어 필드명으로 변환하는 함수
export function convertToWorkOrderFormat(extractedData: ExtractedWorkOrderData[]): Omit<WorkOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>[] {
  return extractedData.map(item => ({
    managementNumber: `${item.관리번호}_${item.작업구분}`, // 관리번호에 작업구분 추가
    requestDate: item.작업요청일,
    operationTeam: item.작업구분 === 'DU측' ? item.DU측_운용팀 : item.RU측_운용팀, // 작업구분에 따라 담당팀 결정
    representativeRuId: item.대표_RU_ID,
    coSiteCount5G: item['5G_Co_Site_수량'],
    concentratorName5G: item['5G_집중국명'],
    equipmentType: '5G 장비', // 기본값
    equipmentName: item.대표_RU_명,
    category: `${item.종류} (${item.작업구분})`, // 종류에 작업구분 추가
    serviceType: item.서비스_구분,
    duId: item.DU_ID,
    duName: item.DU_명,
    channelCard: item.채널카드,
    port: item.포트_A,
    lineNumber: item.선번장,
    notes: `작업구분: ${item.작업구분}, 회선번호: ${item.회선번호}, DU측: ${item.DU측_운용팀}, RU측: ${item.RU측_운용팀}` // 회선번호 추가
  }));
}