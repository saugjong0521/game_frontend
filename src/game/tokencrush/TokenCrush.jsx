import React, { useState } from 'react';

const GRID_SIZE = 8;
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
  const [moves, setMoves] = useState(30);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [matchingCells, setMatchingCells] = useState([]);
  const [swappingCells, setSwappingCells] = useState([]);
  const [fallingCells, setFallingCells] = useState([]);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
        const token = currentBoard[row][col].token;
        if (token === currentBoard[row][col + 1].token && 
            token === currentBoard[row][col + 2].token) {
          let matchLength = 3;
          while (col + matchLength < GRID_SIZE && 
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
        const token = currentBoard[row][col].token;
        if (token === currentBoard[row + 1][col].token && 
            token === currentBoard[row + 2][col].token) {
          let matchLength = 3;
          while (row + matchLength < GRID_SIZE && 
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

  // 빈 공간 채우기
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
    if (isAnimating || moves <= 0) return;

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
      setMoves(prev => prev - 1);
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
    if (isAnimating || moves <= 0) return;

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
    if (isAnimating || moves <= 0) return;
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
    if (!dragStart || isAnimating || moves <= 0) return;
    
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

    if (dragCurrent && !isAnimating && moves > 0) {
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
    setMoves(30);
    
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
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4">
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
      
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-8 idle-pulse">
          Token Crush
        </h1>

        {!gameStarted ? (
          <div className="flex justify-center">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-purple-500/30">
            <div className="flex justify-between mb-6 text-white">
              <div className="text-center">
                <div className="text-gray-400 text-sm">Score</div>
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-sm">Moves</div>
                <div className="text-2xl font-bold text-green-400">{moves}</div>
              </div>
              <button
                onClick={restartGame}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Restart
              </button>
            </div>

            {moves === 0 && (
              <div className="mb-4 bg-purple-900/50 border-2 border-purple-500 rounded-lg p-4 text-center">
                <h2 className="text-2xl font-bold text-purple-400 mb-2">Game Over!</h2>
                <p className="text-white mb-4">Final Score: {score}</p>
                <button
                  onClick={restartGame}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Play Again
                </button>
              </div>
            )}

            <div 
              className="grid grid-cols-8 gap-1 bg-gray-900/50 p-2 rounded-lg"
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
                      disabled={isAnimating || moves <= 0}
                      style={isDragging ? {
                        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.2)`,
                        opacity: 0.9
                      } : {}}
                      className={`
                        aspect-square rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm
                        ${cell ? TOKEN_COLORS[cell.token] : 'bg-gray-700'}
                        ${isSelected && !isDragging ? 'ring-4 ring-white scale-110' : ''}
                        ${isDragTarget && dragStart ? 'ring-4 ring-yellow-400 scale-110' : ''}
                        ${isDragging ? 'dragging ring-4 ring-cyan-400' : ''}
                        ${!isAnimating && moves > 0 ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}
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

            <div className="mt-6 text-center text-gray-400 text-sm">
              Click two adjacent tokens to swap them, or drag to move. Match 3 or more to score!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenCrush;