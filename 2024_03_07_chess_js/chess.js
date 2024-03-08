(function() {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const who = document.getElementById('who');
  
  const squareSize = 72;
  const lightSquareColor = "#bbb";
  const darkSquareColor = "#888";
  const hoverColor = "#636331";
  const selectColor = "red";
  let player = "w";

  let hoverSquare = "none";
  let selectedSquare = "none";

  const pieces = [];

  const images = {};

  // w/b P Q K
  // wB
  // 1_2 

  function drawSquares() {
    let x = 0;
    for (let i = 1; i <= 8; i++) {
      for (let j = 1; j <= 8; j++) {
        const square = sq(i, j);
        if (x % 2 === 0) {
          ctx.fillStyle = lightSquareColor;
        } else {
          ctx.fillStyle = darkSquareColor;
        }
        if (square === hoverSquare) {
          ctx.fillStyle = hoverColor;
        }
        if (square === selectedSquare) {
          ctx.fillStyle = selectColor;
        }
        ctx.fillRect((i-1) * squareSize, (j-1) * squareSize, squareSize, squareSize);
        x++;
      }
      x++;
    }
  }

  function drawLabels() {
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "#fff";

    for (let i = 1; i <= 8; i++) {
      ctx.fillText(i, (i-1) * squareSize + squareSize/2, canvas.height - 5);
    }

    for (let i = 1; i <= 8; i++) {
      ctx.fillText(i, canvas.width - 20, (i-1) * squareSize + squareSize/2);
    }
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function putPiece(id, square) {
    pieces.push({
      id: id,
      sq: square
    })
  }

  function sq(x, y) {
    return x+"_"+y; // [x,y].join("_")
  }

  function sqToXY(square) {
    // 1_1 => canvas's shit
    const [i, j] = square.split("_").map(x => parseInt(x));
    return {
      x: (i-1) * squareSize,
      y: (j-1) * squareSize
    }
  }

  function xyToSq(x, y) {
    const tx = Math.ceil(x / squareSize);
    const ty = Math.ceil(y / squareSize);
    return tx+"_"+ty;
  }

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
}

  function handleHover(e) {
    const pos = getMousePos(e);
    hoverSquare = xyToSq(pos.x, pos.y);
  }

  function movePiece(target) {
    for (let i = 0; i < pieces.length; i++) {
      if (pieces[i].sq === selectedSquare) {
        pieces[i].sq = target;
        continue;
      }
      if (pieces[i].sq === target) {
        pieces[i].sq = "none";
      }
    }
  }

  function canMoveFromCurrentlySelectedSquare() {
    // sprawdz czy source jest figura gracza
    const p = pieces.find((piece) => {
      return piece.sq === selectedSquare;
    });

    if (!p) {
      return false;
    }

    // if (p.id[0] === player) {
    //   return true
    // } else {
    //   return false;
    // }
    return p.id[0] === player;
  }

  function handleClick(e) {
    const pos = getMousePos(e);
    const targetSquare = xyToSq(pos.x, pos.y);

    if (selectedSquare != "none") {
      if (selectedSquare !== targetSquare && canMoveFromCurrentlySelectedSquare()) {
        movePiece(targetSquare);
        switchPlayer();
      }
      clearSelection();
    } else {
      selectedSquare = targetSquare;
    }
  }

  function clearSelection() {
    selectedSquare = "none";
  }

  function initEvents() {
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleHover);
  }

  function initPieces() {
    for (let i = 1; i <= 8; i++) {
      putPiece("bP", sq(i, 2));
      putPiece("wP", sq(i, 7));
    }

    ["w", "b"].forEach(c => {
      const y = c === "w" ? 8 : 1;
      putPiece(c+"R", sq(1, y));
      putPiece(c+"N", sq(2, y));
      putPiece(c+"B", sq(3, y));
      putPiece(c+"Q", sq(4, y));
      putPiece(c+"K", sq(5, y));
      putPiece(c+"B", sq(6, y));
      putPiece(c+"N", sq(7, y));
      putPiece(c+"R", sq(8, y));
    });
  }

  function initImages() {
    const img = ['bbishop.png',
      'bking.png',
      'bknight.png',
      'bpawn.png',
      'bqueen.png',
      'brook.png',
      'wbishop.png',
      'wking.png',
      'wknight.png',
      'wpawn.png',
      'wqueen.png',
      'wrook.png'
    ];

    const objects = img.map(imgPath => {
      const imageObj = new Image();
      imageObj.src = imgPath;
      return imageObj
    });

    // id => Image
    const keys = img.map(imgPath => {
      const color = imgPath.substring(0, 1);
      const piece = imgPath.substring(1, 3);
      let id = color;
      if (piece === "ki") {
        id += "K";
      } else if (piece === "kn") {
        id += "N";
      } else {
        id += piece[0].toUpperCase();
      }
      return id;
    });

    for (let i = 0; i < img.length; i++) {
      const k = keys[i];
      images[k] = objects[i];
    }
  }

  function switchPlayer() {
    player = player === "w" ? "b" : "w";
    const text = player === "w" ? "białe" : "czarne";
    who.innerHTML = text;
  }

  function drawPieces() {
    pieces.forEach((piece) => {
      const coords = sqToXY(piece.sq)
      ctx.drawImage(images[piece.id], coords.x, coords.y, squareSize, squareSize);
    });
  }

  function loop() {
    clearCanvas();
    drawSquares();
    drawLabels();
    drawPieces();

    requestAnimationFrame(loop);
  }

  function run() {
    initImages();
    initPieces();
    initEvents();
    loop();
  }

  run();
})();

