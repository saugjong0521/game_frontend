import { TokenCrushSetting } from '@/game/tokencrush';

export class TokenCrushEngine {
    static createBoard() {
        const newBoard = [];
        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            newBoard[row] = [];
            for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
                newBoard[row][col] = {
                    token: TokenCrushSetting.tokens.types[Math.floor(Math.random() * TokenCrushSetting.tokens.types.length)],
                    id: `${row}-${col}-${Date.now()}`,
                    special: null // 'LINE_H', 'LINE_V', 'BOMB_BLOCK', 'MEGA_BLOCK'
                };
            }
        }
        return newBoard;
    }

    // 특수 블록 생성 로직
    static createSpecialBlock(matchType, direction) {
        if (matchType === 'LINE5') {
            return { special: TokenCrushSetting.specialBlocks.MEGA }; // 5개 이상 - 메가 블록
        } else if (matchType === 'TL') {
            return { special: TokenCrushSetting.specialBlocks.BOMB }; // 교차점 - 폭탄
        } else if (matchType === 'FOUR') {
            // 4개 - 라인 블록 (가로 매치면 세로 제거 LINE_V, 세로 매치면 가로 제거 LINE_H)
            return { special: direction === 'horizontal' ? 'LINE_V' : 'LINE_H' };
        }
        return null;
    }

    // 특수 블록 활성화 시 제거할 셀 계산
    static getSpecialBlockTargets(row, col, special, gridSize) {
        const targets = [];
        
        if (special === 'LINE_H') {
            // 가로 1줄 전체 제거
            for (let c = 0; c < gridSize; c++) {
                targets.push({ row, col: c });
            }
        } else if (special === 'LINE_V') {
            // 세로 1줄 전체 제거
            for (let r = 0; r < gridSize; r++) {
                targets.push({ row: r, col });
            }
        } else if (special === TokenCrushSetting.specialBlocks.BOMB) {
            // 주변 3x3 제거 (자기 자신 포함 9칸)
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                        targets.push({ row: newRow, col: newCol });
                    }
                }
            }
        } else if (special === TokenCrushSetting.specialBlocks.MEGA) {
            // 십자가 3줄 제거 (가로 3줄 + 세로 3줄)
            // 가로 3줄
            for (let c = 0; c < gridSize; c++) {
                targets.push({ row, col: c }); // 중앙 가로
                if (row > 0) targets.push({ row: row - 1, col: c }); // 위 가로
                if (row < gridSize - 1) targets.push({ row: row + 1, col: c }); // 아래 가로
            }
            // 세로 3줄
            for (let r = 0; r < gridSize; r++) {
                if (r === row || r === row - 1 || r === row + 1) continue; // 이미 추가된 셀 제외
                targets.push({ row: r, col }); // 중앙 세로
                if (col > 0) targets.push({ row: r, col: col - 1 }); // 왼쪽 세로
                if (col < gridSize - 1) targets.push({ row: r, col: col + 1 }); // 오른쪽 세로
            }
        }
        
        // 중복 제거
        const uniqueTargets = [];
        const seen = new Set();
        for (const target of targets) {
            const key = `${target.row}-${target.col}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueTargets.push(target);
            }
        }
        
        return uniqueTargets;
    }

    // 특수 블록인지 확인
    static isSpecialBlock(cell) {
        return cell && (
            cell.special === 'LINE_H' || 
            cell.special === 'LINE_V' || 
            cell.special === TokenCrushSetting.specialBlocks.BOMB || 
            cell.special === TokenCrushSetting.specialBlocks.MEGA
        );
    }

    static checkMatches(currentBoard) {
        const allMatches = [];
        const processed = new Set();

        // 1단계: 5개 이상 라인 체크 (가로)
        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            for (let col = 0; col < TokenCrushSetting.board.gridSize - 4; col++) {
                if (!currentBoard[row][col] || processed.has(`${row}-${col}`)) continue;

                const token = currentBoard[row][col].token;
                let matchLength = 1;
                
                while (col + matchLength < TokenCrushSetting.board.gridSize &&
                    currentBoard[row][col + matchLength]?.token === token &&
                    !processed.has(`${row}-${col + matchLength}`)) {
                    matchLength++;
                }

                if (matchLength >= 5) {
                    const cells = [];
                    for (let i = 0; i < matchLength; i++) {
                        cells.push({ row, col: col + i });
                        processed.add(`${row}-${col + i}`);
                    }
                    allMatches.push({ 
                        cells, 
                        type: 'LINE5', 
                        count: matchLength,
                        direction: 'horizontal',
                        centerCell: { row, col: col + Math.floor(matchLength / 2) } // 중앙 셀
                    });
                    col += matchLength - 1;
                }
            }
        }

        // 1단계: 5개 이상 라인 체크 (세로)
        for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
            for (let row = 0; row < TokenCrushSetting.board.gridSize - 4; row++) {
                if (!currentBoard[row][col] || processed.has(`${row}-${col}`)) continue;

                const token = currentBoard[row][col].token;
                let matchLength = 1;

                while (row + matchLength < TokenCrushSetting.board.gridSize &&
                    currentBoard[row + matchLength]?.[col]?.token === token &&
                    !processed.has(`${row + matchLength}-${col}`)) {
                    matchLength++;
                }

                if (matchLength >= 5) {
                    const cells = [];
                    for (let i = 0; i < matchLength; i++) {
                        cells.push({ row: row + i, col });
                        processed.add(`${row + i}-${col}`);
                    }
                    allMatches.push({ 
                        cells, 
                        type: 'LINE5', 
                        count: matchLength,
                        direction: 'vertical',
                        centerCell: { row: row + Math.floor(matchLength / 2), col } // 중앙 셀
                    });
                    row += matchLength - 1;
                }
            }
        }

        // 2단계: 교차점 패턴 체크 (L자/T자)
        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
                if (!currentBoard[row][col] || processed.has(`${row}-${col}`)) continue;

                const token = currentBoard[row][col].token;

                // 가로 방향 길이
                let horizontalLength = 1;
                let horizontalStart = col;

                while (horizontalStart > 0 &&
                    currentBoard[row][horizontalStart - 1]?.token === token &&
                    !processed.has(`${row}-${horizontalStart - 1}`)) {
                    horizontalStart--;
                    horizontalLength++;
                }

                let horizontalEnd = col;
                while (horizontalEnd < TokenCrushSetting.board.gridSize - 1 &&
                    currentBoard[row][horizontalEnd + 1]?.token === token &&
                    !processed.has(`${row}-${horizontalEnd + 1}`)) {
                    horizontalEnd++;
                    horizontalLength++;
                }

                // 세로 방향 길이
                let verticalLength = 1;
                let verticalStart = row;

                while (verticalStart > 0 &&
                    currentBoard[verticalStart - 1]?.[col]?.token === token &&
                    !processed.has(`${verticalStart - 1}-${col}`)) {
                    verticalStart--;
                    verticalLength++;
                }

                let verticalEnd = row;
                while (verticalEnd < TokenCrushSetting.board.gridSize - 1 &&
                    currentBoard[verticalEnd + 1]?.[col]?.token === token &&
                    !processed.has(`${verticalEnd + 1}-${col}`)) {
                    verticalEnd++;
                    verticalLength++;
                }

                // 교차점: 가로 3개 이상 AND 세로 3개 이상
                if (horizontalLength >= 3 && verticalLength >= 3) {
                    const cells = [];

                    for (let c = horizontalStart; c <= horizontalEnd; c++) {
                        if (!processed.has(`${row}-${c}`)) {
                            cells.push({ row, col: c });
                            processed.add(`${row}-${c}`);
                        }
                    }

                    for (let r = verticalStart; r <= verticalEnd; r++) {
                        if (r !== row && !processed.has(`${r}-${col}`)) {
                            cells.push({ row: r, col });
                            processed.add(`${r}-${col}`);
                        }
                    }

                    if (cells.length >= 5) {
                        allMatches.push({
                            cells,
                            type: 'TL',
                            count: cells.length,
                            centerCell: { row, col } // 교차점이 중심
                        });
                    }
                }
            }
        }

        // 3단계: 4개 라인 체크 (가로)
        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            for (let col = 0; col < TokenCrushSetting.board.gridSize - 3; col++) {
                if (!currentBoard[row][col] || processed.has(`${row}-${col}`)) continue;

                const token = currentBoard[row][col].token;
                if (currentBoard[row][col + 1]?.token === token &&
                    currentBoard[row][col + 2]?.token === token &&
                    currentBoard[row][col + 3]?.token === token &&
                    !processed.has(`${row}-${col + 1}`) &&
                    !processed.has(`${row}-${col + 2}`) &&
                    !processed.has(`${row}-${col + 3}`)) {
                    
                    const cells = [];
                    for (let i = 0; i < 4; i++) {
                        cells.push({ row, col: col + i });
                        processed.add(`${row}-${col + i}`);
                    }
                    allMatches.push({ 
                        cells, 
                        type: 'FOUR', 
                        count: 4,
                        direction: 'horizontal',
                        centerCell: { row, col: col + 1 } // 중앙-왼쪽 셀
                    });
                    col += 3;
                }
            }
        }

        // 3단계: 4개 라인 체크 (세로)
        for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
            for (let row = 0; row < TokenCrushSetting.board.gridSize - 3; row++) {
                if (!currentBoard[row][col] || processed.has(`${row}-${col}`)) continue;

                const token = currentBoard[row][col].token;
                if (currentBoard[row + 1]?.[col]?.token === token &&
                    currentBoard[row + 2]?.[col]?.token === token &&
                    currentBoard[row + 3]?.[col]?.token === token &&
                    !processed.has(`${row + 1}-${col}`) &&
                    !processed.has(`${row + 2}-${col}`) &&
                    !processed.has(`${row + 3}-${col}`)) {
                    
                    const cells = [];
                    for (let i = 0; i < 4; i++) {
                        cells.push({ row: row + i, col });
                        processed.add(`${row + i}-${col}`);
                    }
                    allMatches.push({ 
                        cells, 
                        type: 'FOUR', 
                        count: 4,
                        direction: 'vertical',
                        centerCell: { row: row + 1, col } // 중앙-위 셀
                    });
                    row += 3;
                }
            }
        }

        // 4단계: 3개 라인 체크 (가로)
        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            for (let col = 0; col < TokenCrushSetting.board.gridSize - 2; col++) {
                if (!currentBoard[row][col] || processed.has(`${row}-${col}`)) continue;

                const token = currentBoard[row][col].token;
                if (currentBoard[row][col + 1]?.token === token &&
                    currentBoard[row][col + 2]?.token === token &&
                    !processed.has(`${row}-${col + 1}`) &&
                    !processed.has(`${row}-${col + 2}`)) {
                    
                    const cells = [];
                    for (let i = 0; i < 3; i++) {
                        cells.push({ row, col: col + i });
                        processed.add(`${row}-${col + i}`);
                    }
                    allMatches.push({ cells, type: 'THREE', count: 3 });
                    col += 2;
                }
            }
        }

        // 4단계: 3개 라인 체크 (세로)
        for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
            for (let row = 0; row < TokenCrushSetting.board.gridSize - 2; row++) {
                if (!currentBoard[row][col] || processed.has(`${row}-${col}`)) continue;

                const token = currentBoard[row][col].token;
                if (currentBoard[row + 1]?.[col]?.token === token &&
                    currentBoard[row + 2]?.[col]?.token === token &&
                    !processed.has(`${row + 1}-${col}`) &&
                    !processed.has(`${row + 2}-${col}`)) {
                    
                    const cells = [];
                    for (let i = 0; i < 3; i++) {
                        cells.push({ row: row + i, col });
                        processed.add(`${row + i}-${col}`);
                    }
                    allMatches.push({ cells, type: 'THREE', count: 3 });
                    row += 2;
                }
            }
        }
        
        return allMatches;
    }

    static hasPossibleMoves(currentBoard) {
        if (!currentBoard || currentBoard.length === 0) return false;

        // 가로 스왑 체크
        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            for (let col = 0; col < TokenCrushSetting.board.gridSize - 1; col++) {
                if (!currentBoard[row] || !currentBoard[row][col] || !currentBoard[row][col + 1]) continue;

                const testBoard = currentBoard.map(r => [...r]);
                [testBoard[row][col], testBoard[row][col + 1]] =
                    [testBoard[row][col + 1], testBoard[row][col]];

                if (this.checkMatches(testBoard).length > 0) {
                    return true;
                }
            }
        }

        // 세로 스왑 체크
        for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
            for (let row = 0; row < TokenCrushSetting.board.gridSize - 1; row++) {
                if (!currentBoard[row] || !currentBoard[row][col] || !currentBoard[row + 1] || !currentBoard[row + 1][col]) continue;

                const testBoard = currentBoard.map(r => [...r]);
                [testBoard[row][col], testBoard[row + 1][col]] =
                    [testBoard[row + 1][col], testBoard[row][col]];

                if (this.checkMatches(testBoard).length > 0) {
                    return true;
                }
            }
        }

        return false;
    }

    static findHint(currentBoard) {
        if (!currentBoard || currentBoard.length === 0) return null;

        // 가로 스왑 체크
        for (let row = 0; row < TokenCrushSetting.board.gridSize; row++) {
            for (let col = 0; col < TokenCrushSetting.board.gridSize - 1; col++) {
                if (!currentBoard[row] || !currentBoard[row][col] || !currentBoard[row][col + 1]) continue;

                const testBoard = currentBoard.map(r => [...r]);
                [testBoard[row][col], testBoard[row][col + 1]] =
                    [testBoard[row][col + 1], testBoard[row][col]];

                if (this.checkMatches(testBoard).length > 0) {
                    return [
                        { row, col },
                        { row, col: col + 1 }
                    ];
                }
            }
        }

        // 세로 스왑 체크
        for (let col = 0; col < TokenCrushSetting.board.gridSize; col++) {
            for (let row = 0; row < TokenCrushSetting.board.gridSize - 1; row++) {
                if (!currentBoard[row] || !currentBoard[row][col] || !currentBoard[row + 1] || !currentBoard[row + 1][col]) continue;

                const testBoard = currentBoard.map(r => [...r]);
                [testBoard[row][col], testBoard[row + 1][col]] =
                    [testBoard[row + 1][col], testBoard[row][col]];

                if (this.checkMatches(testBoard).length > 0) {
                    return [
                        { row, col },
                        { row: row + 1, col }
                    ];
                }
            }
        }

        return null;
    }

    static shuffleBoard(currentBoard) {
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
    }

    static fillEmpty(currentBoard) {
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
                    id: `${row}-${col}-${Date.now()}-${Math.random()}`,
                    special: null
                };
                falling.push({ row, col });
            }
        }

        return { newBoard, falling };
    }

    static calculateScore(matches, combo) {
        let totalScore = 0;
        const allCells = [];

        matches.forEach(match => {
            const basePoints = TokenCrushSetting.score.points[match.type] || TokenCrushSetting.score.points.THREE;
            const matchScore = match.count * basePoints;
            totalScore += matchScore;
            allCells.push(...match.cells);
        });

        const comboMultiplier = Math.pow(TokenCrushSetting.combo.scoreMultiplier, combo - 1);
        const finalScore = Math.floor(totalScore * comboMultiplier);

        return { finalScore, allCells, comboMultiplier };
    }

    static isAdjacentCells(cell1, cell2) {
        const rowDiff = Math.abs(cell1.row - cell2.row);
        const colDiff = Math.abs(cell1.col - cell2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
}