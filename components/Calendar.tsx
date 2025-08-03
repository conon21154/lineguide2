import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react'
import { WorkOrder, OperationTeam, WorkOrderStatus } from '@/types'

interface CalendarProps {
  workOrders: WorkOrder[]
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
}

interface DateDetailModalProps {
  date: Date
  dayData: {
    total: number
    pending: number
    inProgress: number
    completed: number
    teams: Set<OperationTeam>
    orders: WorkOrder[]
  }
  onClose: () => void
}

const DateDetailModal = ({ date, dayData, onClose }: DateDetailModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일 작업 현황
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{dayData.total}건</div>
              <div className="text-sm text-gray-500">총 작업지시</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Array.from(dayData.teams).length}팀</div>
              <div className="text-sm text-gray-500">참여 운용팀</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">상태별 현황</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                  <span className="text-sm font-medium">대기</span>
                </div>
                <span className="text-sm font-semibold">{dayData.pending}건</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                  <span className="text-sm font-medium">진행중</span>
                </div>
                <span className="text-sm font-semibold">{dayData.inProgress}건</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                  <span className="text-sm font-medium">완료</span>
                </div>
                <span className="text-sm font-semibold">{dayData.completed}건</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">참여 운용팀</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from(dayData.teams).map(team => (
                <span key={team} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {team}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Calendar({ workOrders: filteredWorkOrders, selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showDateDetail, setShowDateDetail] = useState<Date | null>(null)

  // 작업 요청일 파싱 함수 (예: "08월06일(수) 내" -> Date)
  const parseRequestDate = (requestDate: string): Date | null => {
    try {
      // "08월06일(수) 내" 형식에서 월과 일 추출
      const match = requestDate.match(/(\d{1,2})월(\d{1,2})일/)
      if (match) {
        const month = parseInt(match[1]) - 1 // JavaScript Date는 0부터 시작
        const day = parseInt(match[2])
        const year = currentMonth.getFullYear()
        return new Date(year, month, day)
      }
      return null
    } catch {
      return null
    }
  }

  // 전체 작업지시를 가져와서 필터링 없이 캘린더에 표시하기 위해 localStorage에서 직접 가져오기
  const allWorkOrders = useMemo(() => {
    try {
      const stored = localStorage.getItem('lineguide_work_orders')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }, [])

  // 각 날짜별 작업 분석 (상태별로 분류)
  const workOrdersByDate = useMemo(() => {
    const dateMap = new Map<string, {
      total: number
      pending: number
      inProgress: number
      completed: number
      teams: Set<OperationTeam>
      orders: WorkOrder[]
    }>()
    
    allWorkOrders.forEach((order: WorkOrder) => {
      const parsedDate = parseRequestDate(order.requestDate)
      if (parsedDate) {
        const dateKey = parsedDate.toISOString().split('T')[0]
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, {
            total: 0,
            pending: 0,
            inProgress: 0,
            completed: 0,
            teams: new Set(),
            orders: []
          })
        }
        const dayData = dateMap.get(dateKey)!
        dayData.total++
        dayData.teams.add(order.operationTeam)
        dayData.orders.push(order)
        
        switch (order.status) {
          case 'pending':
            dayData.pending++
            break
          case 'in_progress':
            dayData.inProgress++
            break
          case 'completed':
            dayData.completed++
            break
        }
      }
    })
    
    return dateMap
  }, [allWorkOrders, currentMonth])

  // 캘린더 날짜 생성
  const generateCalendarDates = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // 주 시작을 일요일로
    
    const dates = []
    const current = new Date(startDate)
    
    // 6주치 날짜 생성 (42일)
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  const calendarDates = generateCalendarDates()
  const currentYear = currentMonth.getFullYear()
  const currentMonthIndex = currentMonth.getMonth()

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentYear, currentMonthIndex - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentYear, currentMonthIndex + 1, 1))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonthIndex
  }

  const getWorkOrdersForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    return workOrdersByDate.get(dateKey) || {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      teams: new Set(),
      orders: []
    }
  }

  const hasWorkOrders = (date: Date) => {
    return getWorkOrdersForDate(date).total > 0
  }

  // 날짜의 주요 상태 결정 (가장 많은 상태를 기준으로)
  const getPrimaryStatus = (dayData: ReturnType<typeof getWorkOrdersForDate>): WorkOrderStatus => {
    if (dayData.completed >= dayData.inProgress && dayData.completed >= dayData.pending) {
      return 'completed'
    }
    if (dayData.inProgress >= dayData.pending) {
      return 'in_progress'
    }
    return 'pending'
  }

  // 상태별 색상 정의
  const getStatusColor = (status: WorkOrderStatus, isSelected: boolean = false) => {
    if (isSelected) return 'bg-blue-500 text-white'
    
    switch (status) {
      case 'completed':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'border-transparent'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentYear}년 {currentMonthIndex + 1}월
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            className={`p-3 text-center text-sm font-medium ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 날짜 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDates.map((date, index) => {
          const dayData = getWorkOrdersForDate(date)
          const hasWork = hasWorkOrders(date)
          const isCurrentMonthDate = isCurrentMonth(date)
          const primaryStatus = hasWork ? getPrimaryStatus(dayData) : null
          const isDateSelected = isSelected(date)
          
          return (
            <div key={index} className="relative">
              <button
                onClick={() => onDateSelect(date)}
                onDoubleClick={() => hasWork && setShowDateDetail(date)}
                className={`
                  relative p-2 h-16 w-full text-sm rounded-md transition-all duration-200 border
                  ${isDateSelected 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : hasWork && isCurrentMonthDate && primaryStatus
                      ? getStatusColor(primaryStatus) + ' hover:opacity-80'
                      : isCurrentMonthDate
                        ? 'hover:bg-gray-50 border-transparent'
                        : 'text-gray-400 border-transparent'
                  }
                  ${isToday(date) && !isDateSelected ? 'ring-2 ring-blue-300' : ''}
                `}
              >
                <div className="flex flex-col items-center h-full justify-center">
                  <span className={`font-medium ${
                    isDateSelected ? 'text-white' :
                    index % 7 === 0 && isCurrentMonthDate ? 'text-red-600' : 
                    index % 7 === 6 && isCurrentMonthDate ? 'text-blue-600' : ''
                  }`}>
                    {date.getDate()}
                  </span>
                  
                  {hasWork && isCurrentMonthDate && (
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full ${
                        isDateSelected ? 'bg-white' : 
                        primaryStatus === 'completed' ? 'bg-red-500' :
                        primaryStatus === 'in_progress' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                  )}
                </div>
              </button>
              
              {/* 작업이 있는 날짜에 더블클릭 힌트 */}
              {hasWork && isCurrentMonthDate && (
                <button
                  onClick={() => setShowDateDetail(date)}
                  className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold ${
                    primaryStatus === 'completed' ? 'bg-red-500 text-white' :
                    primaryStatus === 'in_progress' ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-white'
                  } hover:scale-110 transition-transform`}
                  title="클릭하여 상세 정보 보기"
                >
                  {dayData.total}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* 선택된 날짜 정보 */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">
            {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
          </h3>
          <div className="space-y-2">
            {(() => {
              const dayData = getWorkOrdersForDate(selectedDate)
              return (
                <>
                  <div className="text-sm text-gray-600">
                    작업지시 총 {dayData.total}건 ({Array.from(dayData.teams).length}개 팀)
                  </div>
                  {dayData.total > 0 && (
                    <div className="flex space-x-4 text-xs">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />
                        대기: {dayData.pending}건
                      </span>
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                        진행중: {dayData.inProgress}건
                      </span>
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                        완료: {dayData.completed}건
                      </span>
                    </div>
                  )}
                  {dayData.teams.size > 0 && (
                    <div className="text-xs text-gray-500">
                      운용팀: {Array.from(dayData.teams).join(', ')}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}
      
      {/* 범례 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">상태별 색상 안내</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2" />
            <span>대기 중인 작업</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded mr-2" />
            <span>진행 중인 작업</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2" />
            <span>완료된 작업</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          * 날짜 배경색은 해당 날짜의 주요 작업 상태를 나타냅니다
        </div>
      </div>
      
      {/* 날짜 상세 모달 */}
      {showDateDetail && (
        <DateDetailModal
          date={showDateDetail}
          dayData={getWorkOrdersForDate(showDateDetail)}
          onClose={() => setShowDateDetail(null)}
        />
      )}
    </div>
  )
}