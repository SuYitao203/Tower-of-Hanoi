// 游戏状态
let gameState = {
    diskCount: 3,
    pegs: [[3, 2, 1], [], []],  // A, B, C
    moves: 0,
    selectedDisk: null,  // {pegIndex, diskSize}
    isAutoSolving: false
};

// DOM 元素
const diskCountInput = document.getElementById('disk-count');
const resetBtn = document.getElementById('reset-btn');
const solveBtn = document.getElementById('solve-btn');
const moveCountSpan = document.getElementById('move-count');
const messageDiv = document.getElementById('message');

// 颜色数组
const colors = [
    '#FF6B6B', '#FFA726', '#FFEE58', '#4CAF50',
    '#2196F3', '#9C27B0', '#E91E63', '#00BCD4'
];

// 初始化游戏
function initGame() {
    const count = parseInt(diskCountInput.value);
    if (count < 3 || count > 8) {
        showMessage('盘子数量必须是 3-8', true);
        diskCountInput.value = 3;
        return;
    }
    
    // 重置状态
    gameState = {
        diskCount: count,
        pegs: [Array.from({length: count}, (_, i) => count - i), [], []],
        moves: 0,
        selectedDisk: null,
        isAutoSolving: false
    };
    
    // 渲染界面
    render();
    updateUI();
    
    showMessage(`游戏开始！把 ${count} 个盘子从 A 移到 C`);
}

// 渲染游戏
function render() {
    // 清空所有柱子
    document.querySelectorAll('.disks-container').forEach(container => {
        container.innerHTML = '';
    });
    
    // 渲染每个柱子
    for (let i = 0; i < 3; i++) {
        const peg = gameState.pegs[i];
        const container = document.querySelector(`[data-peg="${['A','B','C'][i]}"] .disks-container`);
        
        // 从下往上渲染盘子
        peg.forEach((diskSize, index) => {
            const disk = document.createElement('div');
            disk.className = 'disk';
            disk.dataset.size = diskSize;
            disk.textContent = diskSize;
            
            // 盘子样式
            disk.style.width = `${40 + diskSize * 20}px`;
            disk.style.backgroundColor = colors[diskSize - 1];
            disk.style.bottom = `${index * 25}px`;
            
            // 添加点击事件
            disk.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                handleDiskClick(i, diskSize);
            });
            
            container.appendChild(disk);
        });
    }
}

// 处理点击
function handleDiskClick(pegIndex, diskSize) {
    if (gameState.isAutoSolving) return;
    
    const peg = gameState.pegs[pegIndex];
    const topDisk = peg.length > 0 ? peg[peg.length - 1] : null;
    
    if (!gameState.selectedDisk) {
        // 情况1: 点击盘子，选中它
        if (topDisk === diskSize) {
            gameState.selectedDisk = { pegIndex, diskSize };
            highlightSelected(pegIndex, diskSize);
            showMessage(`选中了盘子 ${diskSize}，请点击目标柱子`);
        }
    } else {
        // 情况2: 已经选中了盘子，点击目标柱子
        if (gameState.selectedDisk.pegIndex !== pegIndex) {
            moveDisk(gameState.selectedDisk.pegIndex, pegIndex);
        } else {
            // 点击同一个柱子，取消选择
            clearSelection();
        }
    }
}

// 移动盘子
function moveDisk(fromPeg, toPeg) {
    if (fromPeg === toPeg) return;
    
    const fromStack = gameState.pegs[fromPeg];
    const toStack = gameState.pegs[toPeg];
    
    if (fromStack.length === 0) return;
    
    const diskToMove = fromStack[fromStack.length - 1];
    
    // 检查移动是否合法
    if (toStack.length > 0 && toStack[toStack.length - 1] < diskToMove) {
        showMessage('❌ 不能把大盘子放在小盘子上！', true);
        clearSelection();
        return false;
    }
    
    // 执行移动
    fromStack.pop();
    toStack.push(diskToMove);
    gameState.moves++;
    
    // 重新渲染
    render();
    updateUI();
    
    // 清除选中状态
    clearSelection();
    
    // 检查胜利
    if (gameState.pegs[2].length === gameState.diskCount) {
        showMessage(`🎉 恭喜完成！用了 ${gameState.moves} 步`, false);
    }
    
    return true;
}

// 高亮选中的盘子
function highlightSelected(pegIndex, diskSize) {
    const disks = document.querySelectorAll(`[data-peg="${['A','B','C'][pegIndex]}"] .disk`);
    disks.forEach(disk => {
        if (parseInt(disk.dataset.size) === diskSize) {
            disk.style.transform = 'translateY(-10px)';
            disk.style.boxShadow = '0 0 10px 2px gold';
        }
    });
}

// 清除选中
function clearSelection() {
    if (gameState.selectedDisk) {
        const { pegIndex, diskSize } = gameState.selectedDisk;
        const disks = document.querySelectorAll(`[data-peg="${['A','B','C'][pegIndex]}"] .disk`);
        disks.forEach(disk => {
            disk.style.transform = '';
            disk.style.boxShadow = '';
        });
    }
    gameState.selectedDisk = null;
}

// 更新界面
function updateUI() {
    moveCountSpan.textContent = gameState.moves;
}

// 显示消息
function showMessage(text, isError = false) {
    messageDiv.textContent = text;
    messageDiv.className = 'message show';
    if (isError) {
        messageDiv.classList.add('error');
    }
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 2000);
}

// 自动求解
function startAutoSolve() {
    if (gameState.isAutoSolving) return;
    
    // 禁用按钮
    gameState.isAutoSolving = true;
    solveBtn.disabled = true;
    resetBtn.disabled = true;
    diskCountInput.disabled = true;
    
    showMessage('自动求解开始...');
    
    // 实现自动求解
    autoSolveHanoi(gameState.diskCount, 0, 2, 1);
}

// 汉诺塔自动求解算法
function autoSolveHanoi(n, source, target, auxiliary) {
    if (n === 1) {
        setTimeout(() => {
            moveDisk(source, target);
            
            // 检查是否完成
            if (gameState.pegs[2].length === gameState.diskCount) {
                finishAutoSolve();
            }
        }, 1000);
        return;
    }
    
    // 递归调用
    autoSolveHanoi(n - 1, source, auxiliary, target);
    
    setTimeout(() => {
        moveDisk(source, target);
        autoSolveHanoi(n - 1, auxiliary, target, source);
        
        // 检查是否完成
        if (gameState.pegs[2].length === gameState.diskCount) {
            finishAutoSolve();
        }
    }, 1000);
}

// 完成自动求解
function finishAutoSolve() {
    setTimeout(() => {
        gameState.isAutoSolving = false;
        solveBtn.disabled = false;
        resetBtn.disabled = false;
        diskCountInput.disabled = false;
        showMessage('自动求解完成！');
    }, 1000);
}

// 重置游戏
resetBtn.addEventListener('click', initGame);

// 盘子数量改变
diskCountInput.addEventListener('change', initGame);

// 自动求解按钮
solveBtn.addEventListener('click', startAutoSolve);

// 为柱子添加点击事件（关键修复！）
document.querySelectorAll('.peg').forEach((peg, index) => {
    peg.addEventListener('click', (e) => {
        // 只有当点击到柱子本身（而不是盘子）时才触发
        if (!e.target.classList.contains('disk')) {
            if (gameState.selectedDisk) {
                // 有选中的盘子，尝试移动到这个柱子
                moveDisk(gameState.selectedDisk.pegIndex, index);
            }
        }
    });
});

// 初始化游戏
initGame();