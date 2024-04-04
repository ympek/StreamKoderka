(function() {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const who = document.getElementById('who');
  
  const squareSize = 72;
  const lightSquareColor = "#bbb";
  const darkSquareColor = "#888";
  const hoverColor = "#636331";
  const selectColor = "red";
  const checkColor = "blue";
  let player = "w";

  let hoverSquare = "none";
  let selectedSquare = "none";
  let checkedSquare = "none";

  const pieces = [];
  const images = {};
  let options = [];
  const optionsInCheck = [];

  function isOption(sq) {
    const op = options.find(o => {
      return sq === o;
    });
    return !!op;
  }

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
        if (square === checkedSquare) {
          ctx.fillStyle = checkColor;
        }
        ctx.fillRect((i-1) * squareSize, (j-1) * squareSize, squareSize, squareSize);

        if (isOption(square)) {
          ctx.fillStyle = "yellow";
          ctx.fillRect((i-1) * squareSize, (j-1) * squareSize, squareSize/3, squareSize/3);
        }
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

  function movePiece(source, target, chessboard) {
    for (let i = 0; i < chessboard.length; i++) {
      if (chessboard[i].sq === source) {
        chessboard[i].sq = target;
        continue;
      }
      if (chessboard[i].sq === target) {
        chessboard[i].sq = "none";
      }
    }
  }

  function isOut(sq) {
    const [x, y] = sq.split("_").map(i => parseInt(i))
    if (x < 1 || x > 8) {
      return true;
    }
    if (y < 1 || y > 8) {
      return true;
    }
    return false;
  }

  function isFree(square, chessboard) {
    const p = chessboard.find((piece) => {
      return piece.sq === square;
    });

    return !p;
  }

  function isEnemyAt(square, chessboard) {
    const p = chessboard.find((piece) => {
      return piece.sq === square;
    });

    if (!p) {
      return false;
    }

    return p.id[0] !== player;
  }

  function isCurrentPlayerInCheck(chessboard) {
    const p = chessboard.find((piece) => {
      return piece.sq === checkedSquare;
    });

    if (!p) {
      return false;
    }

    return p.id[0] === player;
  }

  function getSquareOfKing(pl, chessboard) {
    const kingId = `${pl}K`;
    for (let i = 0; i < chessboard.length; i++) {
      if (chessboard[i].id == kingId) {
        return chessboard[i].sq;
      }
    }
  }

  function calculateCheckedSquare(chessboard, kingSquare, forPlayer) {
    let resultSquare = "none";
    let foundSquare = false;
    // czy w nastepnym ruchu w opcjach jest pole z krolem przeciwnika
    // console.log("kingSquare is", kingSquare);
    chessboard.forEach(p => {
      if (foundSquare) {
        return;
      }
      if (p.id[0] !== forPlayer) {
        return;
      }

      // console.log("checking ", p.sq, "for options");
      let tmpPlayer = player;
      if (forPlayer != player) {
        player = forPlayer;
      }
      let tmpOptions = calculateOptions(p.sq, chessboard)
      player = tmpPlayer;
      if (tmpOptions.includes(kingSquare)) {
        resultSquare = kingSquare;
        foundSquare = true;
        console.log("YESS!!!!")
      }
      // console.log(tmpOptions);
      tmpOptions.length = 0;
    });

    return resultSquare;
  }

  function getPieceIdBySquare(s, chessboard) {
    const p = chessboard.find((piece) => {
      return piece.sq === s;
    });
    return p.id;
  }

  function calculateOptionsInCheck(square, chessboard) {
    // console.log("calculateOptionsInCheck");
    let tmpOptions = calculateOptions(square, chessboard);

    const pId = getPieceIdBySquare(square, chessboard);
    // console.log("options", tmpOptions);

    const resultingOptions = tmpOptions.filter(opt => {
      const piecesCopy = chessboard.map(p => { return {...p}});
      // console.log("movePiece from->to", square, opt);
      // console.log("piecesCopy", JSON.stringify(piecesCopy))
      // console.log("pieces", JSON.stringify(pieces))
      movePiece(square, opt, piecesCopy);
      // console.log("piecesCopy AFTER", JSON.stringify(piecesCopy))
      // console.log("pieces AFTER", JSON.stringify(pieces))
      const opponent = player === "w" ? "b" : "w";
      if (pId[1] === "K") {
        kingSquare = opt;
      } else {
        kingSquare = getSquareOfKing(player, chessboard);
      }
      const newCheckedSquare = calculateCheckedSquare(piecesCopy, kingSquare, opponent);
      // console.log("newCheckedSquare", newCheckedSquare);

      return newCheckedSquare === "none";
    });

    // console.log("options after the procedure", tmpOptions);
    return resultingOptions;
  }

  function calculateOptions(square, chessboard) {
    const p = chessboard.find((piece) => {
      return piece.sq === square;
    });

    if (!p) {
      return;
    }

    const [x, y] = square.split("_").map(i => parseInt(i))
    let tmpOptions = [];
    if (p.id[1] === "P") {
      tmpOptions = calculateOptionsForPawn(p, x, y, chessboard)
    }
    if (p.id[1] === "N") {
      tmpOptions = calculateOptionsForKnight(x, y, chessboard)
    }
    if (p.id[1] === "B") {
      tmpOptions = calculateOptionsForBishop(x, y, chessboard)
    }
    if (p.id[1] === "R") {
      tmpOptions = calculateOptionsForRook(x, y, chessboard)
    }
    if (p.id[1] === "Q") {
      const bishopOptions = calculateOptionsForBishop(x, y, chessboard)
      const rookOptions = calculateOptionsForRook(x, y, chessboard)
      tmpOptions = [...bishopOptions, ...rookOptions];
    }
    if (p.id[1] === "K") {
      tmpOptions = calculateOptionsForKing(x, y, chessboard)
    }
    return tmpOptions;
  }

  function calculateOptionsForKing(x, y, board) {
    let tmpOptions = [];
    let s;
    s = sq(x-1, y-1);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x, y-1)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x+1, y-1)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x-1, y+1)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x, y+1)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x+1, y+1)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x-1, y)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x+1, y)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    return tmpOptions;
  }

  function calculateOptionsForRook(x, y, board) {
    let tmpOptions = [];
    let cX = x+1;
    let cY = y;
    let c = sq(cX, cY)
    while(!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      tmpOptions.push(c)
      if (isEnemyAt(c, board)) {
        break;
      }
      cX++;
      c = sq(cX, cY)
    }

    cX = x-1;
    cY = y;
    c = sq(cX, cY)
    while(!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      tmpOptions.push(c)
      if (isEnemyAt(c, board)) {
        break;
      }
      cX--;
      c = sq(cX, cY)
    }

    cX = x;
    cY = y-1;
    c = sq(cX, cY)
    while(!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      tmpOptions.push(c)
      if (isEnemyAt(c, board)) {
        break;
      }
      cY--;
      c = sq(cX, cY)
    }

    cX = x;
    cY = y+1;
    c = sq(cX, cY)
    while(!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      tmpOptions.push(c)
      if (isEnemyAt(c, board)) {
        break;
      }
      cY++;
      c = sq(cX, cY)
    }
    return tmpOptions;
  }

  function calculateOptionsForBishop(x, y, board) {
    // console.log("calculateOptionsForBishop")
    let cX = x+1; // 7
    let cY = y+1; // 9
    let c = sq(cX, cY)
    let tmpOptions = [];
    // console.log("loop 1", cX, cY, c);
    while(!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      tmpOptions.push(c)
      if (isEnemyAt(c, board)) {
        break;
      }
      cX++;
      cY++;
      c = sq(cX, cY)
    }

    cX = x-1;
    cY = y-1;
    c = sq(cX, cY)
    // console.log("loop 2", cX, cY, c);
    while(!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      // console.log("inside loop 2", cX, cY, c);
      tmpOptions.push(c)
      if (isEnemyAt(c, board)) {
        break;
      }
      cX--;
      cY--;
      c = sq(cX, cY)
    }

    cX = x+1;
    cY = y-1;
    c = sq(cX, cY)
    // console.log("loop 3", cX, cY, c);
    // 5_1
    if (isEnemyAt("5_1", board)) {
      // console.log("hardcoded true")
    } else {
      // console.log("hardcoded false")
    }
    while(!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      // console.log("inside loop 3", cX, cY, c);
      tmpOptions.push(c)
      if (isEnemyAt(c, board)) {
        // console.log("enemy is at C, stopping", c);
        break;
      }
      cX++;
      cY--;
      c = sq(cX, cY)
    }

    cX = x-1;
    cY = y+1;
    c = sq(cX, cY)
    // console.log("loop 4", cX, cY, c);
    while(!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      // console.log("inside loop 4", cX, cY, c);
      tmpOptions.push(c)
      if (isEnemyAt(c, board)) {
        break;
      }
      cX--;
      cY++;
      c = sq(cX, cY)
    }
    return tmpOptions;
  }

  function calculateOptionsForKnight(x, y, board) {
    let s;
    let tmpOptions = [];
    s = sq(x-1, y+2);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x+1, y+2)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x-1, y-2)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x+1, y-2)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x+2, y-1)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x+2, y+1)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x-2, y-1)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    s = sq(x-2, y+1)
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s)
    }
    return tmpOptions;
  }

  function calculateOptionsForPawn(p, x, y, board) {
    let s;
    let tmpOptions = [];
    if (p.id[0] === "w") {
      s = sq(x, y-1)
      if (isFree(s, board)) {
        tmpOptions.push(s)
      }
      s = sq(x, y-2)
      if (y === 7 && isFree(s, board)) {
        tmpOptions.push(s)
      }
      s = sq(x-1, y-1)
      if (!isFree(s, board) && isEnemyAt(s, board)) {
        tmpOptions.push(s)
      }
      s = sq(x+1, y-1)
      if (!isFree(s, board) && isEnemyAt(s, board)) {
        tmpOptions.push(s)
      }
    } else {
      s = sq(x, y+1)
      if (isFree(s, board)) {
        tmpOptions.push(s)
      }
      s = sq(x, y+2)
      if (y === 2 && isFree(s, board)) {
        tmpOptions.push(s)
      }
      s = sq(x-1, y+1)
      if (!isFree(s, board) && isEnemyAt(s, board)) {
        tmpOptions.push(s)
      }
      s = sq(x+1, y+1)
      if (!isFree(s, board) && isEnemyAt(s, board)) {
        tmpOptions.push(s)
      }
    }
    return tmpOptions;
  }

  function isMyPieceAt(sq, chessboard) {
    // sprawdz czy source jest figura gracza
    const p = chessboard.find((piece) => {
      return piece.sq === sq;
    });

    if (!p) {
      return false;
    }
    return p.id[0] === player;
  }

  // function isSelectable(square) {
  //   if (selectedSquare === square) {
  //     return false;
  //   }

  // }

  function isCheckmate() {
    const playerBeingChecked  = player === "w" ? "b" : "w";
    const allOptions = [];

    pieces.forEach((piece) => {
      if (piece.id[0] != playerBeingChecked) {
        return;
      }
      let opts = calculateOptionsInCheck(piece.sq, pieces);
      console.log("OPTS________", opts);
    })

    return false;
  }

  function handleClick(e) {
    const pos = getMousePos(e);
    const targetSquare = xyToSq(pos.x, pos.y);

    if (selectedSquare != "none") {
      if (options.length > 0 && isOption(targetSquare)) {
        movePiece(selectedSquare, targetSquare, pieces);
        const opponent = player === "w" ? "b" : "w";
        const kingSquare = getSquareOfKing(opponent, pieces);
        const forPlayer = player;
        checkedSquare = calculateCheckedSquare(pieces, kingSquare, forPlayer);
        // if (checkedSquare !== "none" && isCheckmate()) {
        //   // oblicz opcje biorac pod uwage ze jest szach
        // }
        switchPlayer();
      }
      clearSelection();
      clearOptions();
    } else {
      if (isMyPieceAt(targetSquare, pieces)) {
        selectedSquare = targetSquare;
        if (isCurrentPlayerInCheck(pieces)) {
          options = calculateOptionsInCheck(targetSquare, pieces);
        } else {
          options = calculateOptions(targetSquare, pieces);
        }
      }
    }
  }

  function clearSelection() {
    selectedSquare = "none";
  }

  function clearOptions() {
    options.length = 0;
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

