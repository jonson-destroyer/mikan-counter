let session;
const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const countSpan = document.getElementById('count');

async function init() {
    // 1. スマホのカメラを起動
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: 640, height: 640 },
            audio: false
        });
        video.srcObject = stream;
        await new Promise((resolve) => { video.onloadedmetadata = resolve; });
    } catch (err) {
        alert('カメラの起動に失敗しました: ' + err);
        return;
    }

    // 2. 軽量化したONNXモデル（best_quantized.onnx）の読み込み
    try {
        session = await ort.InferenceSession.create('./best_quantized.onnx', { 
            executionProviders: ['webgl'] // スマホのGPUを活用
        });
        console.log('軽量化AIモデルの読み込み成功！');
        detectMikan(); // 検出ループを開始
    } catch (err) {
        console.error('モデルの読み込み失敗:', err);
        alert('モデルの読み込みに失敗しました。');
    }
}

async function detectMikan() {
    if (video.paused || video.ended) {
        requestAnimationFrame(detectMikan);
        return;
    }

    // カメラの映像フレームをキャンバスに描画
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    try {
        // 前処理・推論・後処理の実行（YOLOv8用）
        const inputTensor = preprocess(imageData, 640, 640);
        const results = await session.run({ images: inputTensor });
        const output = results[session.outputNames[0]].data;
        const detections = postprocess(output, 0.4); // 信頼度閾値 0.4

        // 検出されたミカンの数をカウントして画面に反映
        let mikanCount = detections.length;
        countSpan.innerText = mikanCount;

        // バウンディングボックスの描画処理...
    } catch (err) {
        console.error('推論エラー:', err);
    }

    // リアルタイムで繰り返し実行
    requestAnimationFrame(detectMikan);
}

// （※前処理 preprocess と後処理 postprocess の関数がここに続きます）

init();
