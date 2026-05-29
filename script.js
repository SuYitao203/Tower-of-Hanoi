let scene, camera, renderer, hanoiGroup;
let disks = [];
let towers = [[], [], []];
let moveCount = 0;
const container = document.getElementById('game-container');

// 初始化场景
function init() {
    // 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 8);
    camera.lookAt(0, 2, 0);

    // 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 灯光
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040)); // 环境光

    // 添加地板网格辅助
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // 初始化游戏
    resetGame();

    // 监听窗口大小变化
    window.addEventListener('resize', onWindowResize);
}

function resetGame() {
    // 清除旧物体
    if (hanoiGroup) scene.remove(hanoiGroup);
    disks = [];
    towers = [[], [], []];
    moveCount = 0;
    document.getElementById('move-count').textContent = '0';

    hanoiGroup = new THREE.Group();
    
    // 1. 创建底座
    const baseGeo = new THREE.BoxGeometry(6, 0.5, 2);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.25;
    hanoiGroup.add(base);

    // 2. 创建三根柱子
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 16);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // 棕色
    
    for (let i = 0; i < 3; i++) {
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.x = -2 + i * 2; // 位置：-2, 0, 2
        pole.position.y = 1.5;
        hanoiGroup.add(pole);
    }

    // 3. 创建盘子
    const diskCount = parseInt(document.getElementById('disk-count').value);
    const colors = [0xff0000, 0xffa500, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0xee82ee, 0xffffff];
    
    for (let i = 0; i < diskCount; i++) {
        // 盘子宽度递减
        const width = 1.8 - i * 0.2;
        const diskGeo = new THREE.BoxGeometry(width, 0.2, 0.8);
        const diskMat = new THREE.MeshStandardMaterial({ color: colors[i] });
        const disk = new THREE.Mesh(diskGeo, diskMat);
        
        // 初始放在第一根柱子上
        disk.position.x = -2;
        disk.position.y = 0.6 + i * 0.25;
        disk.userData = { size: width }; // 记录大小用于判断放置
        
        hanoiGroup.add(disk);
        disks.push(disk);
        towers[0].push(disk);
    }
    
    scene.add(hanoiGroup);
    animate();
}

function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    // 让整个组缓慢旋转，方便看 3D 效果
    if (hanoiGroup) hanoiGroup.rotation.y += 0.002; 
    renderer.render(scene, camera);
}

// 事件监听
document.getElementById('reset-btn').addEventListener('click', resetGame);
document.getElementById('disk-count').addEventListener('change', resetGame);

// 启动
init();