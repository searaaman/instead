// Validates a completed grid on its own merits (every row, column, and
// 3x3 box contains 1-9 exactly once) rather than comparing against one
// stored "correct" answer — the mathematically right way to check a
// Sudoku, and it means we don't have to guarantee our hand-picked puzzles
// have a single unique solution.
export function isValidSudoku(grid: number[][]): boolean {
  const isCompleteSet = (values: number[]) => {
    const seen = new Set(values);
    return seen.size === 9 && values.every((v) => v >= 1 && v <= 9);
  };

  for (let r = 0; r < 9; r++) {
    if (!isCompleteSet(grid[r])) return false;
  }

  for (let c = 0; c < 9; c++) {
    const col = grid.map((row) => row[c]);
    if (!isCompleteSet(col)) return false;
  }

  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const box: number[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          box.push(grid[boxRow * 3 + r][boxCol * 3 + c]);
        }
      }
      if (!isCompleteSet(box)) return false;
    }
  }

  return true;
}

export function isGridFull(grid: number[][]): boolean {
  return grid.every((row) => row.every((cell) => cell >= 1 && cell <= 9));
}
