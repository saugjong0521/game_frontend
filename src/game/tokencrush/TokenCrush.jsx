import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    TokenCrushSetting,
    TokenCrushAnimation,
    TokenCrushEngine
} from '@/game/tokencrush';
import './tokenCrushAnimate.css';

const TokenCrush = () => {
    const [board, setBoard] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TokenCrushSetting.time.initial);
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
    const [isGameOver, setIsGameOver] = useState(false);
    const [hintCells, setHintCells] = useState([]);

    const lastMoveTimeRef = useRef(Date.now());
    const hintTimerRef = useRef(null);
    const boardRef = useRef(board);

    useEffect(() => {
        boardRef.current = board;
    }, [board]);

    const showHint = useCallback(() => {
        const currentBoard = boardRef.current;
        if (isAnimating || isGameOver || !gameStarted || timeLeft <= 0 || !currentBoard.length) {
            return;
        }
        const hint = TokenCrushEngine.findHint(currentBoard);
        if (hint) {
            setHintCells(hint);
        }
    }, [isAnimating, isGameOver, gameStarted, timeLeft]);

    const resetHintTimer = () => {
        lastMoveTimeRef.current = Date.now();
        setHintCells([]);
        if (hintTimerRef.current) {
            clearTimeout(hintTimerRef.current);
        }
        if (!isAnimating && !isGameOver && gameStarted && timeLeft > 0) {
            hintTimerRef.current = setTimeout(() => {
                showHint();
            }, 5000);
        }
    };

    useEffect(() => {
        if (gameStarted && !isAnimating && !isGameOver) {
            resetHintTimer();
        } else {
            if (hintTimerRef.current) {
                clearTimeout(hintTimerRef.current);
            }
            setHintCells([]);
        }
        return () => {
            if (hintTimerRef.current) {
                clearTimeout(hintTimerRef.current);
            }
        };
    }, [gameStarted, isAnimating, isGameOver]);

    const processMatches = async (currentBoard, currentCombo = 0, swappedCell = null) => {
        if (isGameOver) return currentBoard;

        setIsAnimating(true);

        const matches = TokenCrushEngine.checkMatches(currentBoard);
        if (matches.length === 0) {
            setCombo(0);
            setShowCombo(false);

            if (!TokenCrushEngine.hasPossibleMoves(currentBoard)) {
                setShowShuffleNotice(true);
                await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.shuffle));
                setShowShuffleNotice(false);

                const shuffled = TokenCrushEngine.shuffleBoard(currentBoard);
                setBoard(shuffled);
                await new Promise(resolve => setTimeout(resolve, 300));

                setIsAnimating(false);
                return processMatches(shuffled, 0, null);
            }

            setIsAnimating(false);
            return currentBoard;
        }

        const newCombo = currentCombo + 1;
        setCombo(newCombo);

        if (newCombo >= TokenCrushSetting.combo.startIndex && !isGameOver) {
            const timeBonus = Math.floor(Math.pow(TokenCrushSetting.combo.timeMultiplier, newCombo - TokenCrushSetting.combo.startIndex));
            setTimeLeft(prev => {
                if (prev <= 0) return 0;
                return Math.min(prev + timeBonus, TokenCrushSetting.time.max);
            });
        }

        const { finalScore, allCells } = TokenCrushEngine.calculateScore(matches, newCombo);

        if (newCombo >= TokenCrushSetting.combo.startIndex) {
            setShowCombo(true);
        }

        setMatchingCells(allCells.map(c => ({ ...c, phase: 'blinking' })));
        await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.blink));

        setMatchingCells(allCells.map(c => ({ ...c, phase: 'exploding' })));
        await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.explode));

        setScore(prev => prev + finalScore);

        const newBoard = currentBoard.map(row => [...row]);
        
        matches.forEach(match => {
            if ((match.type === 'LINE5' || match.type === 'TL' || match.type === 'FOUR')) {
                let specialBlockRow, specialBlockCol;
                
                if (swappedCell && match.cells.some(c => c.row === swappedCell.row && c.col === swappedCell.col)) {
                    specialBlockRow = swappedCell.row;
                    specialBlockCol = swappedCell.col;
                } else if (match.centerCell) {
                    specialBlockRow = match.centerCell.row;
                    specialBlockCol = match.centerCell.col;
                }

                const specialBlockInfo = TokenCrushEngine.createSpecialBlock(match.type, match.direction);
                
                if (specialBlockInfo && newBoard[specialBlockRow]?.[specialBlockCol]) {
                    newBoard[specialBlockRow][specialBlockCol] = {
                        token: null,
                        special: specialBlockInfo.special,
                        id: `special-${specialBlockRow}-${specialBlockCol}-${Date.now()}`
                    };
                    
                    allCells.forEach(({ row: r, col: c }) => {
                        if (r !== specialBlockRow || c !== specialBlockCol) {
                            newBoard[r][c] = null;
                        }
                    });
                    return;
                }
            }
        });

        allCells.forEach(({ row, col }) => {
            if (newBoard[row]?.[col] && !newBoard[row][col].special) {
                newBoard[row][col] = null;
            }
        });

        setMatchingCells([]);
        setBoard(newBoard);
        await new Promise(resolve => setTimeout(resolve, 100));

        const { newBoard: filledBoard, falling } = TokenCrushEngine.fillEmpty(newBoard);
        setFallingCells(falling);
        setBoard(filledBoard);
        await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.fall));
        setFallingCells([]);

        return processMatches(filledBoard, newCombo, null);
    };

    const activateSpecialBlock = async (boardState, row, col, special) => {
        console.log(`💥 특수 블록 활성화: ${special} at (${row}, ${col})`);

        const targets = TokenCrushEngine.getSpecialBlockTargets(row, col, special, TokenCrushSetting.board.gridSize);
        const cellsToRemove = [];
        const chainActivations = [];

        // 실제로 블록이 있는 셀만 제거 대상에 추가
        targets.forEach(t => {
            const targetCell = boardState[t.row]?.[t.col];
            
            if (targetCell) { // null이 아닌 경우만 (이미 제거된 셀 제외)
                cellsToRemove.push(t);
                
                if (TokenCrushEngine.isSpecialBlock(targetCell) && !(t.row === row && t.col === col)) {
                    chainActivations.push({ row: t.row, col: t.col, special: targetCell.special });
                    console.log(`🔗 연쇄 활성화 추가: ${targetCell.special} at (${t.row}, ${t.col})`);
                }
            } else {
                console.log(`⚠️ (${t.row}, ${t.col})는 이미 비어있음 - 점수 계산 제외`);
            }
        });

        // 현재 특수 블록 애니메이션
        setMatchingCells(cellsToRemove.map(c => ({ ...c, phase: 'blinking' })));
        await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.blink));

        setMatchingCells(cellsToRemove.map(c => ({ ...c, phase: 'exploding' })));
        await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.explode));

        // 특수 블록 점수 계산 (실제 제거된 셀 수만 계산)
        const specialScore = cellsToRemove.length * (TokenCrushSetting.score.points.SPECIAL || 20);
        
        console.log(`💰 특수 블록 점수: ${cellsToRemove.length}칸 × ${TokenCrushSetting.score.points.SPECIAL || 20}점 = ${specialScore}점`);
        setScore(prev => prev + specialScore);

        // 제거 (특수 블록 제외하고 먼저 제거)
        const updatedBoard = boardState.map(row => [...row]);
        cellsToRemove.forEach(({ row, col }) => {
            // 연쇄될 특수 블록이 아니면 바로 제거
            const isChainTarget = chainActivations.some(c => c.row === row && c.col === col);
            if (!isChainTarget) {
                updatedBoard[row][col] = null;
            }
        });

        setMatchingCells([]);
        setBoard(updatedBoard);
        await new Promise(resolve => setTimeout(resolve, 100));

        // 연쇄 활성화 (특수 블록들이 아직 남아있는 상태에서 발동)
        let finalBoard = updatedBoard;
        for (const chain of chainActivations) {
            console.log(`⛓️ 연쇄 실행: ${chain.special} at (${chain.row}, ${chain.col})`);
            finalBoard = await activateSpecialBlock(finalBoard, chain.row, chain.col, chain.special);
        }

        return finalBoard;
    };

    const swapTokens = async (row1, col1, row2, col2) => {
        if (isAnimating || isGameOver) return;

        resetHintTimer();

        const cell1 = board[row1][col1];
        const cell2 = board[row2][col2];
        
        if (TokenCrushEngine.isSpecialBlock(cell1) || TokenCrushEngine.isSpecialBlock(cell2)) {
            setSwappingCells([{ row: row1, col: col1 }, { row: row2, col: col2 }]);

            let newBoard = board.map(row => [...row]);
            [newBoard[row1][col1], newBoard[row2][col2]] =
                [newBoard[row2][col2], newBoard[row1][col1]];

            await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.swap));
            setBoard(newBoard);
            setSwappingCells([]);

            if (TokenCrushEngine.isSpecialBlock(cell1)) {
                newBoard = await activateSpecialBlock(newBoard, row2, col2, cell1.special);
            }
            if (TokenCrushEngine.isSpecialBlock(cell2)) {
                newBoard = await activateSpecialBlock(newBoard, row1, col1, cell2.special);
            }

            const { newBoard: filledBoard, falling } = TokenCrushEngine.fillEmpty(newBoard);
            setFallingCells(falling);
            setBoard(filledBoard);
            await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.fall));
            setFallingCells([]);

            const finalBoard = await processMatches(filledBoard, 0, null);
            setBoard(finalBoard);
            setSelectedCell(null);
            return;
        }

        setSwappingCells([{ row: row1, col: col1 }, { row: row2, col: col2 }]);

        const newBoard = board.map(row => [...row]);
        [newBoard[row1][col1], newBoard[row2][col2]] =
            [newBoard[row2][col2], newBoard[row1][col1]];

        await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.swap));
        setBoard(newBoard);
        setSwappingCells([]);

        const matches = TokenCrushEngine.checkMatches(newBoard);

        if (matches.length > 0) {
            const finalBoard = await processMatches(newBoard, 0, { row: row2, col: col2 });
            setBoard(finalBoard);
        } else {
            await new Promise(resolve => setTimeout(resolve, 100));
            setSwappingCells([{ row: row1, col: col1 }, { row: row2, col: col2 }]);
            await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.swap));
            [newBoard[row1][col1], newBoard[row2][col2]] =
                [newBoard[row2][col2], newBoard[row1][col1]];
            setBoard(newBoard);
            setSwappingCells([]);
        }

        setSelectedCell(null);
    };

    const handleCellClick = (row, col) => {
        if (isAnimating || isGameOver) return;
        resetHintTimer();

        if (!selectedCell) {
            setSelectedCell({ row, col });
        } else {
            if (TokenCrushEngine.isAdjacentCells(selectedCell, { row, col })) {
                swapTokens(selectedCell.row, selectedCell.col, row, col);
            } else {
                setSelectedCell({ row, col });
            }
        }
    };

    const handleDragStart = (row, col, e) => {
        if (isAnimating || isGameOver) return;
        const touch = e.touches ? e.touches[0] : e;
        setDragStart({
            row, col,
            startX: touch.clientX,
            startY: touch.clientY
        });
        setSelectedCell({ row, col });
        setDragOffset({ x: 0, y: 0 });
    };

    const handleDragMove = (e) => {
        if (!dragStart || isAnimating || isGameOver) return;
        const touch = e.touches ? e.touches[0] : e;
        const offsetX = touch.clientX - dragStart.startX;
        const offsetY = touch.clientY - dragStart.startY;
        setDragOffset({ x: offsetX, y: offsetY });

        const cellSize = document.querySelector('[data-row]')?.offsetWidth || 50;
        const threshold = cellSize * 0.3;
        const absX = Math.abs(offsetX);
        const absY = Math.abs(offsetY);

        if (absX > threshold || absY > threshold) {
            if (absX > absY) {
                const targetCol = dragStart.col + (offsetX > 0 ? 1 : -1);
                if (targetCol >= 0 && targetCol < TokenCrushSetting.board.gridSize) {
                    setDragCurrent({ row: dragStart.row, col: targetCol });
                } else {
                    setDragCurrent(null);
                }
            } else {
                const targetRow = dragStart.row + (offsetY > 0 ? 1 : -1);
                if (targetRow >= 0 && targetRow < TokenCrushSetting.board.gridSize) {
                    setDragCurrent({ row: targetRow, col: dragStart.col });
                } else {
                    setDragCurrent(null);
                }
            }
        } else {
            setDragCurrent(null);
        }
    };

    const handleDragEnd = () => {
        if (!dragStart) return;

        if (!dragCurrent || (dragCurrent.row === dragStart.row && dragCurrent.col === dragStart.col)) {
            setDragStart(null);
            setDragCurrent(null);
            setDragOffset({ x: 0, y: 0 });
            setSelectedCell(null);
            return;
        }

        if (!isAnimating && !isGameOver) {
            if (TokenCrushEngine.isAdjacentCells(dragStart, dragCurrent)) {
                swapTokens(dragStart.row, dragStart.col, dragCurrent.row, dragCurrent.col);
            }
        }

        setDragStart(null);
        setDragCurrent(null);
        setDragOffset({ x: 0, y: 0 });
    };

    const startGame = async () => {
        let initialBoard = TokenCrushEngine.createBoard();
        setBoard(initialBoard);
        setGameStarted(true);
        setScore(0);
        setTimeLeft(TokenCrushSetting.time.initial);
        setIsGameOver(false);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setTimeout(() => setIsGameOver(true), 100);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        await new Promise(resolve => setTimeout(resolve, 500));
        initialBoard = await processMatches(initialBoard, 0, null);
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
        setIsGameOver(false);
        setHintCells([]);
    };

    return (
        <TokenCrushAnimation>
            <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden pt-16">
                <div className="w-full h-full flex flex-col p-2">
                    {!gameStarted ? (
                        <div className="flex flex-col items-center gap-8 mt-20">
                            <h1 className="text-5xl sm:text-6xl font-bold text-white text-center idle-pulse">
                                Token Crush
                            </h1>
                            <button onClick={startGame} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg">
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
                                    <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000" style={{ width: `${(timeLeft / TokenCrushSetting.time.initial) * 100}%` }}></div>
                                </div>
                            </div>

                            {isGameOver && (
                                <div className="mb-2 bg-purple-900/50 border-2 border-purple-500 rounded-lg p-3 text-center flex-shrink-0 animate-fadeIn">
                                    <h2 className="text-xl font-bold text-purple-400 mb-1">Game Over!</h2>
                                    <p className="text-white mb-2">Final Score: {score}</p>
                                    <button onClick={restartGame} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg">
                                        Play Again
                                    </button>
                                </div>
                            )}

                            <div className="flex-1 flex items-start justify-center min-h-0 relative">
                                {showShuffleNotice && (
                                    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                                        <div className="bg-gradient-to-br from-purple-600 to-pink-600 px-8 py-6 rounded-2xl shadow-2xl border-2 border-white/30 animate-pulse">
                                            <p className="text-white text-2xl font-bold text-center">🔀 보드 섞는 중...</p>
                                        </div>
                                    </div>
                                )}

                                {showCombo && combo >= TokenCrushSetting.combo.startIndex && (
                                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-40 animate-fadeIn">
                                        <div className="px-6 py-3">
                                            <p className="text-7xl font-black text-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent" style={{ fontWeight: 900, WebkitTextStroke: '2px rgba(255,165,0,0.3)' }}>
                                                {combo} COMBO!
                                            </p>
                                            <p className="text-2xl font-black text-center text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] mt-1">
                                                {Math.floor(Math.pow(TokenCrushSetting.combo.scoreMultiplier, combo - 1) * 100)}% 점수!
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div
                                    className="gap-1 bg-gray-900/50 p-2 rounded-lg w-full max-w-[min(100vw-1rem,100vh-8rem)] game-board"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${TokenCrushSetting.board.gridSize}, minmax(0, 1fr))`,
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
                                            const isHint = hintCells.some(h => h.row === rowIndex && h.col === colIndex);
                                            const isSpecial = cell?.special;

                                            let cellColor = cell ? TokenCrushSetting.tokens.colors[cell.token] : 'bg-gray-700';
                                            if (isSpecial) {
                                                cellColor = TokenCrushSetting.specialBlockColors[cell.special] || 'bg-gradient-to-br from-gray-600 to-gray-800';
                                            }

                                            const cellClasses = [
                                                'aspect-square rounded-lg flex items-center justify-center',
                                                'text-white font-bold text-xs sm:text-sm shadow-lg relative',
                                                cellColor,
                                                isSelected && !isDragging && 'ring-2 ring-white scale-110',
                                                isDragTarget && dragStart && 'ring-2 ring-yellow-400 scale-110',
                                                isDragging && 'dragging ring-2 ring-cyan-400',
                                                isHint && 'hint',
                                                !isAnimating && !isGameOver ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed',
                                                !isDragging && !matchingCell && !isSwapping && !isFalling && 'transition-all duration-300 ease-out',
                                                matchingCell?.phase === 'blinking' && 'blinking',
                                                matchingCell?.phase === 'exploding' && 'exploding',
                                                isSwapping && 'swapping',
                                                isFalling && 'falling',
                                                isSpecial && 'ring-4 ring-yellow-400/70 animate-pulse'
                                            ].filter(Boolean).join(' ');

                                            let specialIcon = '';
                                            if (cell?.special === 'LINE_H') specialIcon = '━';
                                            else if (cell?.special === 'LINE_V') specialIcon = '┃';
                                            else if (cell?.special === TokenCrushSetting.specialBlocks.BOMB) specialIcon = '💣';
                                            else if (cell?.special === TokenCrushSetting.specialBlocks.MEGA) specialIcon = '⭐';

                                            return (
                                                <button
                                                    key={cell?.id || `${rowIndex}-${colIndex}`}
                                                    data-row={rowIndex}
                                                    data-col={colIndex}
                                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                                    onMouseDown={(e) => handleDragStart(rowIndex, colIndex, e)}
                                                    onTouchStart={(e) => handleDragStart(rowIndex, colIndex, e)}
                                                    disabled={isAnimating || isGameOver}
                                                    style={isDragging ? {
                                                        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.2)`,
                                                        opacity: 0.9
                                                    } : {}}
                                                    className={cellClasses}
                                                >
                                                    {isSpecial ? (
                                                        <span className="text-4xl">{specialIcon}</span>
                                                    ) : (
                                                        cell?.token
                                                    )}
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
        </TokenCrushAnimation>
    );
};

export default TokenCrush;