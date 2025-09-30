import React, { useState } from 'react';

const GRID_SIZE = 7;
const TOKENS = ['BTC', 'ETH', 'BNB', 'SOL', 'USDT'];
const TOKEN_COLORS = {
  BTC: 'bg-orange-500',
  ETH: 'bg-blue-500',
  BNB: 'bg-yellow-500',
  SOL: 'bg-purple-500',
  USDT: 'bg-green-500'
};

const TokenCrush = () => {
  const [board, setBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [matchingCells, setMatchingCells] = useState([]);
  const [swappingCells, setSwappingCells] = useState([]);
  const [fallingCells, setFallingCells] = useState([]);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showShuffleNotice, setShowShuffleNotice] = useState(false);

  // 초기 보드 생성
  const createBoard = () => {
    const newBoard = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      newBoard[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        newBoard[row][col] = {
          token: TOKENS[Math.floor(Math.random() * TOKENS.length)],
          id: `${row}-${col}-${Date.now()}`
        };
      }
    }
    return newBoard;
  };

  // 3개 이상 매칭 체크
  const checkMatches = (currentBoard) => {
    const matches = [];
    
    // 가로 체크
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        // null 체크 추가
        if (!currentBoard[row][col] || !currentBoard[row][col + 1] || !currentBoard[row][col + 2]) continue;
        
        const token = currentBoard[row][col].token;
        if (token === currentBoard[row][col + 1].token && 
            token === currentBoard[row][col + 2].token) {
          let matchLength = 3;
          while (col + matchLength < GRID_SIZE && 
                 currentBoard[row][col + matchLength] &&
                 currentBoard[row][col + matchLength].token === token) {
            matchLength++;
          }
          for (let i = 0; i < matchLength; i++) {
            matches.push({ row, col: col + i });
          }
          col += matchLength - 1;
        }
      }
    }

    // 세로 체크
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        // null 체크 추가
        if (!currentBoard[row][col] || !currentBoard[row + 1][col] || !currentBoard[row + 2][col]) continue;
        
        const token = currentBoard[row][col].token;
        if (token === currentBoard[row + 1][col].token && 
            token === currentBoard[row + 2][col].token) {
          let matchLength = 3;
          while (row + matchLength < GRID_SIZE && 
                 currentBoard[row + matchLength][col] &&
                 currentBoard[row + matchLength][col].token === token) {
            matchLength++;
          }
          for (let i = 0; i < matchLength; i++) {
            matches.push({ row: row + i, col });
          }
          row += matchLength - 1;
        }
      }
    }

    return matches;
  };

  // 가능한 매칭이 있는지 체크
  const hasPossibleMoves = (currentBoard) => {
    // 보드가 비어있으면 false
    if (!currentBoard || currentBoard.length === 0) return false;
    
    // 가로 스왑 체크
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 1; col++) {
        if (!currentBoard[row] || !currentBoard[row][col] || !currentBoard[row][col + 1]) continue;
        
        // 오른쪽과 스왑
        const testBoard = currentBoard.map(r => [...r]);
        [testBoard[row][col], testBoard[row][col + 1]] = 
        [testBoard[row][col + 1], testBoard[row][col]];
        
        if (checkMatches(testBoard).length > 0) {
          return true;
        }
      }
    }
    
    // 세로 스왑 체크
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 1; row++) {
        if (!currentBoard[row] || !currentBoard[row][col] || !currentBoard[row + 1] || !currentBoard[row + 1][col]) continue;
        
        // 아래와 스왑
        const testBoard = currentBoard.map(r => [...r]);
        [testBoard[row][col], testBoard[row + 1][col]] = 
        [testBoard[row + 1][col], testBoard[row][col]];
        
        if (checkMatches(testBoard).length > 0) {
          return true;
        }
      }
    }
    
    return false;
  };

  // 보드 섞기 (가능한 매칭이 없을 때)
  const shuffleBoard = (currentBoard) => {
    const newBoard = [];
    const allTokens = [];
    
    // 현재 보드의 모든 토큰 수집
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (currentBoard[row] && currentBoard[row][col]) {
          allTokens.push(currentBoard[row][col].token);
        }
      }
    }
    
    // Fisher-Yates 셔플
    for (let i = allTokens.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTokens[i], allTokens[j]] = [allTokens[j], allTokens[i]];
    }
    
    // 새 보드에 재배치
    let tokenIndex = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      newBoard[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        newBoard[row][col] = {
          token: allTokens[tokenIndex++],
          id: `${row}-${col}-${Date.now()}-${Math.random()}`
        };
      }
    }
    
    return newBoard;
  };
  const fillEmpty = (currentBoard) => {
    const newBoard = currentBoard.map(row => [...row]);
    const falling = [];

    for (let col = 0; col < GRID_SIZE; col++) {
      let emptySpaces = 0;
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          newBoard[row + emptySpaces][col] = newBoard[row][col];
          newBoard[row][col] = null;
          falling.push({ row: row + emptySpaces, col });
        }
      }

      for (let row = 0; row < emptySpaces; row++) {
        newBoard[row][col] = {
          token: TOKENS[Math.floor(Math.random() * TOKENS.length)],
          id: `${row}-${col}-${Date.now()}-${Math.random()}`
        };
        falling.push({ row, col });
      }
    }

    return { newBoard, falling };
  };

  // 재귀적으로 매칭 체크 및 제거
  const processMatches = async (currentBoard) => {
    setIsAnimating(true);
    
    const matches = checkMatches(currentBoard);
    if (matches.length === 0) {
      // 가능한 매칭이 없으면 보드 섞기
      if (!hasPossibleMoves(currentBoard)) {
        // 1초간 알림 표시
        setShowShuffleNotice(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setShowShuffleNotice(false);
        
        // 보드 섞기
        const shuffled = shuffleBoard(currentBoard);
        setBoard(shuffled);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 섞은 후 다시 체크 - 재귀적으로 처리
        setIsAnimating(false);
        return processMatches(shuffled);
      }
      
      setIsAnimating(false);
      return currentBoard;
    }

    // 1. 매칭된 셀 표시 (깜빡이는 효과)
    const uniqueMatches = Array.from(
      new Set(matches.map(m => `${m.row}-${m.col}`))
    ).map(str => {
      const [row, col] = str.split('-').map(Number);
      return { row, col };
    });
    
    setMatchingCells(uniqueMatches.map(m => ({ ...m, phase: 'blinking' })));
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // 2. 터지는 효과
    setMatchingCells(uniqueMatches.map(m => ({ ...m, phase: 'exploding' })));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 3. 매칭된 토큰 제거
    const newBoard = currentBoard.map(row => [...row]);
    setScore(prev => prev + uniqueMatches.length * 10);
    uniqueMatches.forEach(({ row, col }) => {
      newBoard[row][col] = null;
    });
    
    setMatchingCells([]);
    setBoard(newBoard);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 4. 빈 공간 채우기 (토큰 떨어지기)
    const { newBoard: filledBoard, falling } = fillEmpty(newBoard);
    setFallingCells(falling);
    setBoard(filledBoard);
    await new Promise(resolve => setTimeout(resolve, 600));
    setFallingCells([]);
    
    // 5. 다시 매칭 체크
    return processMatches(filledBoard);
  };

  // 토큰 스왑
  const swapTokens = async (row1, col1, row2, col2) => {
    if (isAnimating || timeLeft <= 0) return;

    // 스왑 애니메이션 표시
    setSwappingCells([{row: row1, col: col1}, {row: row2, col: col2}]);
    
    const newBoard = board.map(row => [...row]);
    [newBoard[row1][col1], newBoard[row2][col2]] = 
    [newBoard[row2][col2], newBoard[row1][col1]];

    await new Promise(resolve => setTimeout(resolve, 300));
    setBoard(newBoard);
    setSwappingCells([]);

    const matches = checkMatches(newBoard);
    
    if (matches.length > 0) {
      const finalBoard = await processMatches(newBoard);
      setBoard(finalBoard);
    } else {
      // 매칭 실패시 다시 되돌리기
      await new Promise(resolve => setTimeout(resolve, 100));
      setSwappingCells([{row: row1, col: col1}, {row: row2, col: col2}]);
      await new Promise(resolve => setTimeout(resolve, 300));
      [newBoard[row1][col1], newBoard[row2][col2]] = 
      [newBoard[row2][col2], newBoard[row1][col1]];
      setBoard(newBoard);
      setSwappingCells([]);
    }

    setSelectedCell(null);
  };

  // 셀 클릭 핸들러
  const handleCellClick = (row, col) => {
    if (isAnimating || timeLeft <= 0) return;

    if (!selectedCell) {
      setSelectedCell({ row, col });
    } else {
      const rowDiff = Math.abs(selectedCell.row - row);
      const colDiff = Math.abs(selectedCell.col - col);

      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        swapTokens(selectedCell.row, selectedCell.col, row, col);
      } else {
        setSelectedCell({ row, col });
      }
    }
  };

  // 드래그 시작
  const handleDragStart = (row, col, e) => {
    if (isAnimating || timeLeft <= 0) return;
    e.preventDefault();
    
    const touch = e.touches ? e.touches[0] : e;
    
    setDragStart({ 
      row, 
      col, 
      startX: touch.clientX,
      startY: touch.clientY
    });
    setSelectedCell({ row, col });
    setDragOffset({ x: 0, y: 0 });
  };

  // 드래그 중
  const handleDragMove = (e) => {
    if (!dragStart || isAnimating || timeLeft <= 0) return;
    
    const touch = e.touches ? e.touches[0] : e;
    
    // 드래그 오프셋 계산
    const offsetX = touch.clientX - dragStart.startX;
    const offsetY = touch.clientY - dragStart.startY;
    setDragOffset({ x: offsetX, y: offsetY });
    
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.dataset.row !== undefined) {
      const row = parseInt(element.dataset.row);
      const col = parseInt(element.dataset.col);
      
      // 인접한 셀만 하이라이트
      const rowDiff = Math.abs(row - dragStart.row);
      const colDiff = Math.abs(col - dragStart.col);
      
      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        setDragCurrent({ row, col });
      } else if (row === dragStart.row && col === dragStart.col) {
        setDragCurrent(null);
      }
    }
  };

  // 드래그 종료
  const handleDragEnd = () => {
    if (!dragStart) {
      return;
    }

    if (dragCurrent && !isAnimating && timeLeft > 0) {
      const rowDiff = dragCurrent.row - dragStart.row;
      const colDiff = dragCurrent.col - dragStart.col;

      // 상하좌우로만 1칸 이동 가능
      if ((Math.abs(rowDiff) === 1 && colDiff === 0) || 
          (Math.abs(colDiff) === 1 && rowDiff === 0)) {
        swapTokens(dragStart.row, dragStart.col, dragCurrent.row, dragCurrent.col);
      }
    }

    setDragStart(null);
    setDragCurrent(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // 게임 시작
  const startGame = async () => {
    let initialBoard = createBoard();
    setBoard(initialBoard);
    setGameStarted(true);
    setScore(0);
    setTimeLeft(60);
    
    // 타이머 시작
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    initialBoard = await processMatches(initialBoard);
    setBoard(initialBoard);
  };

  // 게임 재시작
  const restartGame = () => {
    setGameStarted(false);
    setSelectedCell(null);
    setMatchingCells([]);
    setSwappingCells([]);
    setFallingCells([]);
    setDragStart(null);
    setDragCurrent(null);
    setDragOffset({ x: 0, y: 0 });
    setShowShuffleNotice(false);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden pt-16">
      <style>{`
        @keyframes explode {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.3);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }
        
        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        
        @keyframes fall {
          0% {
            transform: translateY(-20px);
            opacity: 0.5;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes swap {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.85);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .exploding {
          animation: explode 0.5s ease-out forwards;
        }
        
        .blinking {
          animation: blink 0.4s ease-in-out 2;
        }
        
        .falling {
          animation: fall 0.6s ease-out;
        }
        
        .swapping {
          animation: swap 0.3s ease-in-out;
        }
        
        .idle-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .dragging {
          transition: none !important;
          z-index: 50;
          pointer-events: none;
        }
      `}</style>
      
      <div className="w-full h-full flex flex-col p-2">
        {!gameStarted ? (
          <div className="flex flex-col items-center gap-8 mt-20">
            <h1 className="text-5xl sm:text-6xl font-bold text-white text-center idle-pulse">
              Token Crush
            </h1>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
            {/* 타이머 프로그레스 바 */}
            <div className="mb-2 flex-shrink-0">
              <div className="flex justify-between items-center mb-1">
                <div className="text-white text-lg font-bold">Score: <span className="text-yellow-400">{score}</span></div>
                <div className="text-white text-lg font-bold">{timeLeft}s</div>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000"
                  style={{ width: `${(timeLeft / 60) * 100}%` }}
                ></div>
              </div>
            </div>

            {timeLeft === 0 && (
              <div className="mb-2 bg-purple-900/50 border-2 border-purple-500 rounded-lg p-3 text-center flex-shrink-0">
                <h2 className="text-xl font-bold text-purple-400 mb-1">Game Over!</h2>
                <p className="text-white mb-2">Final Score: {score}</p>
                <button
                  onClick={restartGame}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Play Again
                </button>
              </div>
            )}

            {/* 게임 보드 */}
            <div className="flex-1 flex items-start justify-center min-h-0 relative">
              {/* 섞기 알림 모달 */}
              {showShuffleNotice && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 px-8 py-6 rounded-2xl shadow-2xl border-2 border-white/30 animate-pulse">
                    <p className="text-white text-2xl font-bold text-center">
                      🔀 보드 섞는 중...
                    </p>
                  </div>
                </div>
              )}
              
              <div 
                className="gap-1 bg-gray-900/50 p-2 rounded-lg w-full max-w-[min(100vw-1rem,100vh-8rem)]"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                  aspectRatio: '1/1'
                }}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const matchingCell = matchingCells.find(m => m.row === rowIndex && m.col === colIndex);
                    const isSwapping = swappingCells.some(s => s.row === rowIndex && s.col === colIndex);
                    const isFalling = fallingCells.some(f => f.row === rowIndex && f.col === colIndex);
                    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                    const isDragTarget = dragCurrent?.row === rowIndex && dragCurrent?.col === colIndex;
                    const isDragging = dragStart?.row === rowIndex && dragStart?.col === colIndex;
                    
                    return (
                      <button
                        key={cell?.id || `${rowIndex}-${colIndex}`}
                        data-row={rowIndex}
                        data-col={colIndex}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        onMouseDown={(e) => handleDragStart(rowIndex, colIndex, e)}
                        onTouchStart={(e) => handleDragStart(rowIndex, colIndex, e)}
                        disabled={isAnimating || timeLeft <= 0}
                        style={isDragging ? {
                          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.2)`,
                          opacity: 0.9
                        } : {}}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm
                          ${cell ? TOKEN_COLORS[cell.token] : 'bg-gray-700'}
                          ${isSelected && !isDragging ? 'ring-2 ring-white scale-110' : ''}
                          ${isDragTarget && dragStart ? 'ring-2 ring-yellow-400 scale-110' : ''}
                          ${isDragging ? 'dragging ring-2 ring-cyan-400' : ''}
                          ${!isAnimating && timeLeft > 0 ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}
                          shadow-lg
                          ${isDragging ? '' : 'transition-all duration-200 ease-out'}
                          ${matchingCell?.phase === 'blinking' ? 'blinking' : ''}
                          ${matchingCell?.phase === 'exploding' ? 'exploding' : ''}
                          ${isSwapping ? 'swapping' : ''}
                          ${isFalling ? 'falling' : ''}
                        `}
                      >
                        {cell?.token}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenCrush;