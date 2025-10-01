import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    TokenCrushSetting,
    TokenCrushAnimation
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

    // board 상태가 변경될 때마다 ref 업데이트
    useEffect(() => {
        boardRef.current = board;
    }, [board]);

    // hintCells 상태 변경 추적
    useEffect(() => {
        console.log('💡 hintCells 상태 변경됨:', hintCells);
    }, [hintCells]);

    // 힌트 표시
    const showHint = useCallback(() => {
        const currentBoard = boardRef.current;
        console.log('🔍 힌트 함수 실행됨');
        console.log('현재 상태:', { isAnimating, isGameOver, gameStarted, timeLeft, boardLength: currentBoard.length });
        console.log('현재 hintCells:', hintCells);

        if (isAnimating || isGameOver || !gameStarted || timeLeft <= 0 || !currentBoard.length) {
            console.log('❌ 힌트 표시 조건 불만족');
            return;
        }

        // 가능한 매치를 찾아서 힌트로 표시
        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            for (let col = 0; col < TokenCrushSetting.board.gridSize - 1; col++) {
                if (!currentBoard[row] || !currentBoard[row][col] || !currentBoard[row][col + 1]) continue;

                const testBoard = currentBoard.map(r => [...r]);
                [testBoard[row][col], testBoard[row][col + 1]] =
                    [testBoard[row][col + 1], testBoard[row][col]];

                if (checkMatches(testBoard).length > 0) {
                    const newHintCells = [
                        { row, col },
                        { row, col: col + 1 }
                    ];
                    console.log('✨ 힌트 발견! 가로:', { row, col }, '→', { row, col: col + 1 });
                    console.log('setHintCells 호출:', newHintCells);
                    setHintCells(newHintCells);
                    return;
                }
            }
        }

        for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
            for (let row = 0; row < TokenCrushSetting.board.gridSize - 1; row++) {
                if (!currentBoard[row] || !currentBoard[row][col] || !currentBoard[row + 1] || !currentBoard[row + 1][col]) continue;

                const testBoard = currentBoard.map(r => [...r]);
                [testBoard[row][col], testBoard[row + 1][col]] =
                    [testBoard[row + 1][col], testBoard[row][col]];

                if (checkMatches(testBoard).length > 0) {
                    const newHintCells = [
                        { row, col },
                        { row: row + 1, col }
                    ];
                    console.log('✨ 힌트 발견! 세로:', { row, col }, '→', { row: row + 1, col });
                    console.log('setHintCells 호출:', newHintCells);
                    setHintCells(newHintCells);
                    return;
                }
            }
        }

        console.log('⚠️ 힌트를 찾지 못함');
    }, [isAnimating, isGameOver, gameStarted, timeLeft, hintCells]);

    // 힌트 타이머 초기화
    const resetHintTimer = () => {
        console.log('⏰ 힌트 타이머 리셋됨');
        lastMoveTimeRef.current = Date.now();
        setHintCells([]);

        if (hintTimerRef.current) {
            clearTimeout(hintTimerRef.current);
        }

        if (!isAnimating && !isGameOver && gameStarted && timeLeft > 0) {
            console.log('⏳ 5초 후 힌트 타이머 시작');
            hintTimerRef.current = setTimeout(() => {
                showHint();
            }, 5000);
        } else {
            console.log('❌ 힌트 타이머 시작 조건 불만족:', { isAnimating, isGameOver, gameStarted, timeLeft });
        }
    };

    // 게임 시작/종료/애니메이션 상태 변경 시 타이머 관리
    useEffect(() => {
        if (gameStarted && !isAnimating && !isGameOver) {
            console.log('🎮 게임 상태 변경 - 힌트 타이머 리셋');
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

    const createBoard = () => {
        const newBoard = [];
        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            newBoard[row] = [];
            for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
                newBoard[row][col] = {
                    token: TokenCrushSetting.tokens.types[Math.floor(Math.random() * TokenCrushSetting.tokens.types.length)],
                    id: `${row}-${col}-${Date.now()}`
                };
            }
        }
        return newBoard;
    };

    const checkMatches = (currentBoard) => {
        const allMatches = [];
        const processed = new Set();

        // 각 셀에서 교차점(십자가) 패턴 먼저 찾기
        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
                if (!currentBoard[row][col] || processed.has(`${row}-${col}`)) continue;

                const token = currentBoard[row][col].token;

                // 가로 방향으로 연속된 길이 찾기
                let horizontalLength = 1;
                let horizontalStart = col;
                // 왼쪽으로 확장
                while (horizontalStart > 0 && currentBoard[row][horizontalStart - 1]?.token === token) {
                    horizontalStart--;
                    horizontalLength++;
                }
                // 오른쪽으로 확장
                let horizontalEnd = col;
                while (horizontalEnd < TokenCrushSetting.board.gridSize - 1 && currentBoard[row][horizontalEnd + 1]?.token === token) {
                    horizontalEnd++;
                    horizontalLength++;
                }

                // 세로 방향으로 연속된 길이 찾기
                let verticalLength = 1;
                let verticalStart = row;
                // 위로 확장
                while (verticalStart > 0 && currentBoard[verticalStart - 1]?.[col]?.token === token) {
                    verticalStart--;
                    verticalLength++;
                }
                // 아래로 확장
                let verticalEnd = row;
                while (verticalEnd < TokenCrushSetting.board.gridSize - 1 && currentBoard[verticalEnd + 1]?.[col]?.token === token) {
                    verticalEnd++;
                    verticalLength++;
                }

                // 교차점 패턴 체크 (가로 3개 이상 AND 세로 3개 이상)
                if (horizontalLength >= 3 && verticalLength >= 3) {
                    const cells = [];
                    // 가로 라인 추가
                    for (let c = horizontalStart; c <= horizontalEnd; c++) {
                        cells.push({ row, col: c });
                        processed.add(`${row}-${c}`);
                    }
                    // 세로 라인 추가 (중심점 제외)
                    for (let r = verticalStart; r <= verticalEnd; r++) {
                        if (r !== row) {
                            cells.push({ row: r, col });
                            processed.add(`${r}-${col}`);
                        }
                    }

                    allMatches.push({
                        cells,
                        type: 'TL',
                        count: cells.length
                    });
                }
            }
        }

        // 가로 라인 체크
        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            for (let col = 0; col < TokenCrushSetting.board.gridSize - 2; col++) {
                if (!currentBoard[row][col] || processed.has(`${row}-${col}`)) continue;

                const token = currentBoard[row][col].token;
                if (!currentBoard[row][col + 1] || !currentBoard[row][col + 2]) continue;

                if (token === currentBoard[row][col + 1].token &&
                    token === currentBoard[row][col + 2].token) {
                    let matchLength = 3;
                    while (col + matchLength < TokenCrushSetting.board.gridSize &&
                        currentBoard[row][col + matchLength] &&
                        currentBoard[row][col + matchLength].token === token &&
                        !processed.has(`${row}-${col + matchLength}`)) {
                        matchLength++;
                    }

                    const cells = [];
                    for (let i = 0; i < matchLength; i++) {
                        cells.push({ row, col: col + i });
                        processed.add(`${row}-${col + i}`);
                    }

                    const type = matchLength >= 5 ? 'LINE5' : matchLength === 4 ? 'FOUR' : 'THREE';
                    allMatches.push({ cells, type, count: matchLength });
                    col += matchLength - 1;
                }
            }
        }

        // 세로 라인 체크
        for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
            for (let row = 0; row < TokenCrushSetting.board.gridSize - 2; row++) {
                if (!currentBoard[row][col] || processed.has(`${row}-${col}`)) continue;

                const token = currentBoard[row][col].token;
                if (!currentBoard[row + 1]?.[col] || !currentBoard[row + 2]?.[col]) continue;

                if (token === currentBoard[row + 1][col].token &&
                    token === currentBoard[row + 2][col].token) {
                    let matchLength = 3;
                    while (row + matchLength < TokenCrushSetting.board.gridSize &&
                        currentBoard[row + matchLength]?.[col] &&
                        currentBoard[row + matchLength][col].token === token &&
                        !processed.has(`${row + matchLength}-${col}`)) {
                        matchLength++;
                    }

                    const cells = [];
                    for (let i = 0; i < matchLength; i++) {
                        cells.push({ row: row + i, col });
                        processed.add(`${row + i}-${col}`);
                    }

                    const type = matchLength >= 5 ? 'LINE5' : matchLength === 4 ? 'FOUR' : 'THREE';
                    allMatches.push({ cells, type, count: matchLength });
                    row += matchLength - 1;
                }
            }
        }

        return allMatches;
    };

    const hasPossibleMoves = (currentBoard) => {
        if (!currentBoard || currentBoard.length === 0) return false;

        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            for (let col = 0; col < TokenCrushSetting.board.gridSize - 1; col++) {
                if (!currentBoard[row] || !currentBoard[row][col] || !currentBoard[row][col + 1]) continue;

                const testBoard = currentBoard.map(r => [...r]);
                [testBoard[row][col], testBoard[row][col + 1]] =
                    [testBoard[row][col + 1], testBoard[row][col]];

                if (checkMatches(testBoard).length > 0) {
                    return true;
                }
            }
        }

        for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
            for (let row = 0; row < TokenCrushSetting.board.gridSize - 1; row++) {
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

        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
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
        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            newBoard[row] = [];
            for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
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

        for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
            let emptySpaces = 0;
            for (let row = TokenCrushSetting.board.gridSize - 1; row >= 0; row--) {
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
                    token: TokenCrushSetting.tokens.types[Math.floor(Math.random() * TokenCrushSetting.tokens.types.length)],
                    id: `${row}-${col}-${Date.now()}-${Math.random()}`
                };
                falling.push({ row, col });
            }
        }

        return { newBoard, falling };
    };

    const processMatches = async (currentBoard, currentCombo = 0) => {
        // 게임 오버 상태면 더 이상 매치 처리하지 않음
        if (isGameOver) {
            return currentBoard;
        }

        setIsAnimating(true);

        const matches = checkMatches(currentBoard);
        if (matches.length === 0) {
            setCombo(0);
            setShowCombo(false);

            if (!hasPossibleMoves(currentBoard)) {
                setShowShuffleNotice(true);
                await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.shuffle));
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

        // 게임 오버가 아닐 때만 시간 보너스 추가
        if (newCombo >= TokenCrushSetting.combo.startIndex && !isGameOver) {
            const timeBonus = Math.floor(Math.pow(TokenCrushSetting.combo.timeMultiplier, newCombo - TokenCrushSetting.combo.startIndex));
            setTimeLeft(prev => {
                // 시간이 0 이하면 보너스를 추가하지 않음
                if (prev <= 0) return 0;
                return Math.min(prev + timeBonus, TokenCrushSetting.time.max);
            });
            console.log(`${newCombo}콤보 → +${timeBonus}초 추가`);
        }

        let totalScore = 0;
        const allCells = [];

        matches.forEach(match => {
            const basePoints = TokenCrushSetting.score.points[match.type] || TokenCrushSetting.score.points.THREE;
            const matchScore = match.count * basePoints;
            totalScore += matchScore;
            allCells.push(...match.cells);
        });

        const comboMultiplier = Math.pow(TokenCrushSetting.combo.scoreMultiplier, newCombo - 1);
        const finalScore = Math.floor(totalScore * comboMultiplier);

        console.log(`콤보: ${newCombo}, 기본점수: ${totalScore}, 배율: ${comboMultiplier.toFixed(2)}x, 최종점수: ${finalScore}`);

        if (newCombo >= TokenCrushSetting.combo.startIndex) {
            setShowCombo(true);
        }

        setMatchingCells(allCells.map(c => ({ ...c, phase: 'blinking' })));
        await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.blink));

        setMatchingCells(allCells.map(c => ({ ...c, phase: 'exploding' })));
        await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.explode));

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
        await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.fall));
        setFallingCells([]);

        return processMatches(filledBoard, newCombo);
    };

    const swapTokens = async (row1, col1, row2, col2) => {
        if (isAnimating || isGameOver) return;

        resetHintTimer(); // 움직임 발생 시 타이머 리셋

        setSwappingCells([{ row: row1, col: col1 }, { row: row2, col: col2 }]);

        const newBoard = board.map(row => [...row]);
        [newBoard[row1][col1], newBoard[row2][col2]] =
            [newBoard[row2][col2], newBoard[row1][col1]];

        await new Promise(resolve => setTimeout(resolve, TokenCrushSetting.animation.swap));
        setBoard(newBoard);
        setSwappingCells([]);

        const matches = checkMatches(newBoard);

        if (matches.length > 0) {
            const finalBoard = await processMatches(newBoard, 0);
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

        resetHintTimer(); // 움직임 발생 시 타이머 리셋

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
        if (isAnimating || isGameOver) return;

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
        if (!dragStart || isAnimating || isGameOver) return;

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

        if (dragCurrent && !isAnimating && !isGameOver) {
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
        setTimeLeft(TokenCrushSetting.time.initial);
        setIsGameOver(false);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // 애니메이션 완료 후 게임 오버 처리
                    setTimeout(() => {
                        setIsGameOver(true);
                    }, 100);
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
        setIsGameOver(false);
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
                                        style={{ width: `${(timeLeft / TokenCrushSetting.time.initial) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {isGameOver && (
                                <div className="mb-2 bg-purple-900/50 border-2 border-purple-500 rounded-lg p-3 text-center flex-shrink-0 animate-fadeIn">
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

                                            const cellClasses = [
                                                'aspect-square rounded-lg flex items-center justify-center',
                                                'text-white font-bold text-xs sm:text-sm shadow-lg',
                                                cell ? TokenCrushSetting.tokens.colors[cell.token] : 'bg-gray-700',
                                                isSelected && !isDragging && 'ring-2 ring-white scale-110',
                                                isDragTarget && dragStart && 'ring-2 ring-yellow-400 scale-110',
                                                isDragging && 'dragging ring-2 ring-cyan-400',
                                                isHint && 'hint',
                                                !isAnimating && !isGameOver ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed',
                                                !isDragging && !matchingCell && !isSwapping && !isFalling && 'transition-all duration-300 ease-out',
                                                matchingCell?.phase === 'blinking' && 'blinking',
                                                matchingCell?.phase === 'exploding' && 'exploding',
                                                isSwapping && 'swapping',
                                                isFalling && 'falling'
                                            ].filter(Boolean).join(' ');

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
        </TokenCrushAnimation>
    );
};

export default TokenCrush;