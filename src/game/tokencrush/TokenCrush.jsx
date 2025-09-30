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
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);

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

  const checkMatches = (currentBoard) => {
    const allMatches = [];
    const processed = new Set();
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!currentBoard[row][col] || processed.has(`${row}-${col}`)) continue;
        
        const token = currentBoard[row][col].token;
        
        let horizontalMatch = [];
        if (col <= GRID_SIZE - 3) {
          if (currentBoard[row][col + 1]?.token === token && 
              currentBoard[row][col + 2]?.token === token) {
            horizontalMatch = [
              {row, col},
              {row, col: col + 1},
              {row, col: col + 2}
            ];
          }
        }
        
        let verticalMatch = [];
        if (row <= GRID_SIZE - 3) {
          if (currentBoard[row + 1]?.[col]?.token === token && 
              currentBoard[row + 2]?.[col]?.token === token) {
            verticalMatch = [
              {row, col},
              {row: row + 1, col},
              {row: row + 2, col}
            ];
          }
        }
        
        if (horizontalMatch.length > 0 && verticalMatch.length > 0) {
          const combined = [...horizontalMatch, ...verticalMatch];
          const unique = Array.from(
            new Set(combined.map(c => `${c.row}-${c.col}`))
          ).map(str => {
            const [r, c] = str.split('-').map(Number);
            return {row: r, col: c};
          });
          
          allMatches.push({
            cells: unique,
            type: 'TL',
            count: unique.length
          });
          
          unique.forEach(c => processed.add(`${c.row}-${c.col}`));
        }
      }
    }
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        if (!currentBoard[row][col] || processed.has(`${row}-${col}`)) continue;
        
        const token = currentBoard[row][col].token;
        if (!currentBoard[row][col + 1] || !currentBoard[row][col + 2]) continue;
        
        if (token === currentBoard[row][col + 1].token && 
            token === currentBoard[row][col + 2].token) {
          let matchLength = 3;
          while (col + matchLength < GRID_SIZE && 
                 currentBoard[row][col + matchLength] &&
                 currentBoard[row][col + matchLength].token === token &&
                 !processed.has(`${row}-${col + matchLength}`)) {
            matchLength++;
          }
          
          const cells = [];
          for (let i = 0; i < matchLength; i++) {
            cells.push({row, col: col + i});
            processed.add(`${row}-${col + i}`);
          }
          
          const type = matchLength >= 5 ? 'LINE5' : matchLength === 4 ? 'FOUR' : 'THREE';
          allMatches.push({cells, type, count: matchLength});
          col += matchLength - 1;
        }
      }
    }

    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        if (!currentBoard[row][col] || processed.has(`${row}-${col}`)) continue;
        
        const token = currentBoard[row][col].token;
        if (!currentBoard[row + 1]?.[col] || !currentBoard[row + 2]?.[col]) continue;
        
        if (token === currentBoard[row + 1][col].token && 
            token === currentBoard[row + 2][col].token) {
          let matchLength = 3;
          while (row + matchLength < GRID_SIZE && 
                 currentBoard[row + matchLength]?.[col] &&
                 currentBoard[row + matchLength][col].token === token &&
                 !processed.has(`${row + matchLength}-${col}`)) {
            matchLength++;
          }
          
          const cells = [];
          for (let i = 0; i < matchLength; i++) {
            cells.push({row: row + i, col});
            processed.add(`${row + i}-${col}`);
          }
          
          const type = matchLength >= 5 ? 'LINE5' : matchLength === 4 ? 'FOUR' : 'THREE';
          allMatches.push({cells, type, count: matchLength});
          row += matchLength - 1;
        }
      }
    }

    return allMatches;
  };

  const hasPossibleMoves = (currentBoard) => {
    if (!currentBoard || currentBoard.length === 0) return false;
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 1; col++) {
        if (!currentBoard[row] || !currentBoard[row][col] || !currentBoard[row][col + 1]) continue;
        
        const testBoard = currentBoard.map(r => [...r]);
        [testBoard[row][col], testBoard[row][col + 1]] = 
        [testBoard[row][col + 1], testBoard[row][col]];
        
        if (checkMatches(testBoard).length > 0) {
          return true;
        }
      }
    }
    
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 1; row++) {
        if (!currentBoard[row] || !currentBoard[row][col] || !currentBoard[row + 1] || !currentBoard[row + 1][col]) continue;
        
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

  const shuffleBoard = (currentBoard) => {
    const newBoard = [];
    const allTokens = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (currentBoard[row] && currentBoard[row][col]) {
          allTokens.push(currentBoard[row][col].token);
        }
      }
    }
    
    for (let i = allTokens.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTokens[i], allTokens[j]] = [allTokens[j], allTokens[i]];
    }
    
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

  const processMatches = async (currentBoard, currentCombo = 0) => {
    setIsAnimating(true);
    
    const matches = checkMatches(currentBoard);
    if (matches.length === 0) {
      setCombo(0);
      setShowCombo(false);
      
      if (!hasPossibleMoves(currentBoard)) {
        setShowShuffleNotice(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setShowShuffleNotice(false);
        
        const shuffled = shuffleBoard(currentBoard);
        setBoard(shuffled);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setIsAnimating(false);
        return processMatches(shuffled, 0);
      }
      
      setIsAnimating(false);
      return currentBoard;
    }

    const newCombo = currentCombo + 1;
    setCombo(newCombo);
    
    let totalScore = 0;
    const allCells = [];
    
    matches.forEach(match => {
      const basePoints = match.type === 'LINE5' ? 15 : 
                        match.type === 'TL' ? 13 :
                        match.type === 'FOUR' ? 12 : 10;
      const matchScore = match.count * basePoints;
      totalScore += matchScore;
      allCells.push(...match.cells);
    });
    
    const comboMultiplier = Math.pow(1.1, newCombo - 1);
    const finalScore = Math.floor(totalScore * comboMultiplier);
    
    console.log(`콤보: ${newCombo}, 기본점수: ${totalScore}, 배율: ${comboMultiplier.toFixed(2)}x, 최종점수: ${finalScore}`);
    
    if (newCombo > 1) {
      setShowCombo(true);
    }
    
    setMatchingCells(allCells.map(c => ({ ...c, phase: 'blinking' })));
    await new Promise(resolve => setTimeout(resolve, 400));
    
    setMatchingCells(allCells.map(c => ({ ...c, phase: 'exploding' })));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setScore(prev => prev + finalScore);
    
    const newBoard = currentBoard.map(row => [...row]);
    allCells.forEach(({ row, col }) => {
      newBoard[row][col] = null;
    });
    
    setMatchingCells([]);
    setBoard(newBoard);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { newBoard: filledBoard, falling } = fillEmpty(newBoard);
    setFallingCells(falling);
    setBoard(filledBoard);
    await new Promise(resolve => setTimeout(resolve, 600));
    setFallingCells([]);
    
    return processMatches(filledBoard, newCombo);
  };

  const swapTokens = async (row1, col1, row2, col2) => {
    if (isAnimating || timeLeft <= 0) return;

    setSwappingCells([{row: row1, col: col1}, {row: row2, col: col2}]);
    
    const newBoard = board.map(row => [...row]);
    [newBoard[row1][col1], newBoard[row2][col2]] = 
    [newBoard[row2][col2], newBoard[row1][col1]];

    await new Promise(resolve => setTimeout(resolve, 300));
    setBoard(newBoard);
    setSwappingCells([]);

    const matches = checkMatches(newBoard);
    
    if (matches.length > 0) {
      const finalBoard = await processMatches(newBoard, 0);
      setBoard(finalBoard);
    } else {
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

  const handleDragStart = (row, col, e) => {
    if (isAnimating || timeLeft <= 0) return;
    
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

  const handleDragMove = (e) => {
    if (!dragStart || isAnimating || timeLeft <= 0) return;
    
    const touch = e.touches ? e.touches[0] : e;
    
    const offsetX = touch.clientX - dragStart.startX;
    const offsetY = touch.clientY - dragStart.startY;
    setDragOffset({ x: offsetX, y: offsetY });
    
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.dataset.row !== undefined) {
      const row = parseInt(element.dataset.row);
      const col = parseInt(element.dataset.col);
      
      const rowDiff = Math.abs(row - dragStart.row);
      const colDiff = Math.abs(col - dragStart.col);
      
      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        setDragCurrent({ row, col });
      } else if (row === dragStart.row && col === dragStart.col) {
        setDragCurrent(null);
      }
    }
  };

  const handleDragEnd = () => {
    if (!dragStart) {
      return;
    }

    if (dragCurrent && !isAnimating && timeLeft > 0) {
      const rowDiff = dragCurrent.row - dragStart.row;
      const colDiff = dragCurrent.col - dragStart.col;

      if ((Math.abs(rowDiff) === 1 && colDiff === 0) || 
          (Math.abs(colDiff) === 1 && rowDiff === 0)) {
        swapTokens(dragStart.row, dragStart.col, dragCurrent.row, dragCurrent.col);
      }
    }

    setDragStart(null);
    setDragCurrent(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const startGame = async () => {
    let initialBoard = createBoard();
    setBoard(initialBoard);
    setGameStarted(true);
    setScore(0);
    setTimeLeft(60);
    
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
    initialBoard = await processMatches(initialBoard, 0);
    setBoard(initialBoard);
  };

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
    setCombo(0);
    setShowCombo(false);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden pt-16">
      <style>{`
        @keyframes explode {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes fall {
          0% { transform: translateY(-20px); opacity: 0.5; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes swap {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.85); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .exploding { animation: explode 0.5s ease-out forwards; }
        .blinking { animation: blink 0.4s ease-in-out 2; }
        .falling { animation: fall 0.6s ease-out; }
        .swapping { animation: swap 0.3s ease-in-out; }
        .idle-pulse { animation: pulse 2s ease-in-out infinite; }
        .dragging { transition: none !important; z-index: 50; pointer-events: none; }
        .game-board { touch-action: none; -webkit-user-select: none; user-select: none; }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
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

            <div className="flex-1 flex items-start justify-center min-h-0 relative">
              {showShuffleNotice && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 px-8 py-6 rounded-2xl shadow-2xl border-2 border-white/30 animate-pulse">
                    <p className="text-white text-2xl font-bold text-center">
                      🔀 보드 섞는 중...
                    </p>
                  </div>
                </div>
              )}
              
              {showCombo && combo > 1 && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-40 animate-fadeIn">
                  <div className="px-6 py-3">
                    <p className="text-7xl font-black text-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent" style={{ fontWeight: 900, WebkitTextStroke: '2px rgba(255,165,0,0.3)' }}>
                      {combo} COMBO!
                    </p>
                    <p className="text-2xl font-black text-center text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] mt-1">
                      {Math.floor(Math.pow(1.1, combo - 1) * 100)}% 점수!
                    </p>
                  </div>
                </div>
              )}
              
              <div 
                className="gap-1 bg-gray-900/50 p-2 rounded-lg w-full max-w-[min(100vw-1rem,100vh-8rem)] game-board"
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