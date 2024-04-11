(function () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const who = document.getElementById("who");

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
  let enPassantSquare = "none";
  let capturedEnPassant = false;

  const pieces = [];
  const images = {};
  let options = [];

  function isOption(sq) {
    const op = options.find((o) => {
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
        ctx.fillRect(
          (i - 1) * squareSize,
          (j - 1) * squareSize,
          squareSize,
          squareSize,
        );

        if (isOption(square)) {
          ctx.fillStyle = "yellow";
          ctx.fillRect(
            (i - 1) * squareSize,
            (j - 1) * squareSize,
            squareSize / 3,
            squareSize / 3,
          );
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
      ctx.fillText(i, (i - 1) * squareSize + squareSize / 2, canvas.height - 5);
    }

    for (let i = 1; i <= 8; i++) {
      ctx.fillText(i, canvas.width - 20, (i - 1) * squareSize + squareSize / 2);
    }
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function putPiece(id, square) {
    pieces.push({
      id: id,
      sq: square,
    });
  }

  function sq(x, y) {
    return x + "_" + y; // or [x,y].join("_")
  }

  function sqToXY(square) {
    // 1_1 => canvas's shit
    const [i, j] = square.split("_").map((x) => parseInt(x));
    return {
      x: (i - 1) * squareSize,
      y: (j - 1) * squareSize,
    };
  }

  function xyToSq(x, y) {
    const tx = Math.ceil(x / squareSize);
    const ty = Math.ceil(y / squareSize);
    return tx + "_" + ty;
  }

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function handleHover(e) {
    const pos = getMousePos(e);
    hoverSquare = xyToSq(pos.x, pos.y);
  }

  function removeAt(square, chessboard) {
    console.log("removeAt called", square);
    for (let i = 0; i < chessboard.length; i++) {
      if (chessboard[i].sq === square) {
        chessboard[i].sq = "none";
      }
    }
  }

  function movePiece(source, target, chessboard) {
    let pieceId;
    for (let i = 0; i < chessboard.length; i++) {
      if (chessboard[i].sq === source) {
        chessboard[i].sq = target;
        pieceId = chessboard[i].id;
        continue;
      }
      if (chessboard[i].sq === target) {
        chessboard[i].sq = "none";
      }
    }

    if (capturedEnPassant) {
      if (pieceId[0] === "w") {
        const [x, y] = target.split("_").map((i) => parseInt(i));
        removeAt(sq(x, y + 1), chessboard);
      } else {
        const [x, y] = target.split("_").map((i) => parseInt(i));
        removeAt(sq(x, y - 1), chessboard);
      }
      capturedEnPassant = false;
    }
  }

  function isOut(sq) {
    const [x, y] = sq.split("_").map((i) => parseInt(i));
    if (x < 1 || x > 8) {
      return true;
    }
    return y < 1 || y > 8;
  }

  function isFree(square, chessboard) {
    const p = chessboard.find((piece) => {
      return piece.sq === square;
    });
    return !p;
  }

  function isEnPassantSquare(square) {
    return square === enPassantSquare;
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
    chessboard.forEach((p) => {
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
      let tmpOptions = calculateOptions(p.sq, chessboard);
      player = tmpPlayer;
      if (tmpOptions.includes(kingSquare)) {
        resultSquare = kingSquare;
        foundSquare = true;
        console.log("YESS!!!!");
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

  function filterOptionsResultingInCheck(square, chessboard, opt) {
    const piecesCopy = chessboard.map((p) => {
      return { ...p };
    });
    // console.log("movePiece from->to", square, opt);
    // console.log("piecesCopy", JSON.stringify(piecesCopy))
    // console.log("pieces", JSON.stringify(pieces))
    movePiece(square, opt, piecesCopy);
    // console.log("piecesCopy AFTER", JSON.stringify(piecesCopy))
    // console.log("pieces AFTER", JSON.stringify(pieces))
    const opponent = player === "w" ? "b" : "w";
    const pId = getPieceIdBySquare(square, chessboard);
    if (pId[1] === "K") {
      kingSquare = opt;
    } else {
      kingSquare = getSquareOfKing(player, chessboard);
    }
    const newCheckedSquare = calculateCheckedSquare(
      piecesCopy,
      kingSquare,
      opponent,
    );
    // console.log("newCheckedSquare", newCheckedSquare);

    return newCheckedSquare === "none";
  }

  function calculatePossibleOptions(square, chessboard) {
    let tmpOptions = calculateOptions(square, chessboard);
    tmpOptions = tmpOptions.filter((opt) =>
      filterOptionsResultingInCheck(square, chessboard, opt),
    );
    return tmpOptions;
  }

  function calculateOptions(square, chessboard) {
    const p = chessboard.find((piece) => {
      return piece.sq === square;
    });

    if (!p) {
      return [];
    }

    const [x, y] = square.split("_").map((i) => parseInt(i));
    let tmpOptions = [];
    if (p.id[1] === "P") {
      tmpOptions = calculateOptionsForPawn(p, x, y, chessboard);
    }
    if (p.id[1] === "N") {
      tmpOptions = calculateOptionsForKnight(x, y, chessboard);
    }
    if (p.id[1] === "B") {
      tmpOptions = calculateOptionsForBishop(x, y, chessboard);
    }
    if (p.id[1] === "R") {
      tmpOptions = calculateOptionsForRook(x, y, chessboard);
    }
    if (p.id[1] === "Q") {
      const bishopOptions = calculateOptionsForBishop(x, y, chessboard);
      const rookOptions = calculateOptionsForRook(x, y, chessboard);
      tmpOptions = [...bishopOptions, ...rookOptions];
    }
    if (p.id[1] === "K") {
      tmpOptions = calculateOptionsForKing(x, y, chessboard);
    }

    return tmpOptions.filter((opt) => !isOut(opt));
  }

  function calculateOptionsForKing(x, y, board) {
    let tmpOptions = [];
    let s;
    s = sq(x - 1, y - 1);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x, y - 1);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x + 1, y - 1);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x - 1, y + 1);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x, y + 1);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x + 1, y + 1);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x - 1, y);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x + 1, y);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    return tmpOptions;
  }

  function calculateOptionsForRook(x, y, board) {
    let tmpOptions = [];
    let cX = x + 1;
    let cY = y;
    let c = sq(cX, cY);
    while (!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      tmpOptions.push(c);
      if (isEnemyAt(c, board)) {
        break;
      }
      cX++;
      c = sq(cX, cY);
    }

    cX = x - 1;
    cY = y;
    c = sq(cX, cY);
    while (!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      tmpOptions.push(c);
      if (isEnemyAt(c, board)) {
        break;
      }
      cX--;
      c = sq(cX, cY);
    }

    cX = x;
    cY = y - 1;
    c = sq(cX, cY);
    while (!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      tmpOptions.push(c);
      if (isEnemyAt(c, board)) {
        break;
      }
      cY--;
      c = sq(cX, cY);
    }

    cX = x;
    cY = y + 1;
    c = sq(cX, cY);
    while (!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      tmpOptions.push(c);
      if (isEnemyAt(c, board)) {
        break;
      }
      cY++;
      c = sq(cX, cY);
    }
    return tmpOptions;
  }

  function calculateOptionsForBishop(x, y, board) {
    let cX = x + 1;
    let cY = y + 1;
    let c = sq(cX, cY);
    let tmpOptions = [];
    while (!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      tmpOptions.push(c);
      if (isEnemyAt(c, board)) {
        break;
      }
      cX++;
      cY++;
      c = sq(cX, cY);
    }

    cX = x - 1;
    cY = y - 1;
    c = sq(cX, cY);
    while (!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      tmpOptions.push(c);
      if (isEnemyAt(c, board)) {
        break;
      }
      cX--;
      cY--;
      c = sq(cX, cY);
    }

    cX = x + 1;
    cY = y - 1;
    c = sq(cX, cY);
    while (!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      tmpOptions.push(c);
      if (isEnemyAt(c, board)) {
        break;
      }
      cX++;
      cY--;
      c = sq(cX, cY);
    }

    cX = x - 1;
    cY = y + 1;
    c = sq(cX, cY);
    while (!isOut(c, board) && (isFree(c, board) || isEnemyAt(c, board))) {
      tmpOptions.push(c);
      if (isEnemyAt(c, board)) {
        break;
      }
      cX--;
      cY++;
      c = sq(cX, cY);
    }
    return tmpOptions;
  }

  function calculateOptionsForKnight(x, y, board) {
    let s;
    let tmpOptions = [];
    s = sq(x - 1, y + 2);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x + 1, y + 2);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x - 1, y - 2);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x + 1, y - 2);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x + 2, y - 1);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x + 2, y + 1);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x - 2, y - 1);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    s = sq(x - 2, y + 1);
    if (!isMyPieceAt(s, board)) {
      tmpOptions.push(s);
    }
    return tmpOptions;
  }

  function calculateOptionsForPawn(p, x, y, board) {
    let s;
    let tmpOptions = [];
    if (p.id[0] === "w") {
      s = sq(x, y - 1);
      if (isFree(s, board)) {
        tmpOptions.push(s);
      }
      s = sq(x, y - 2);
      if (y === 7 && isFree(s, board)) {
        tmpOptions.push(s);
      }
      s = sq(x - 1, y - 1);
      if (isEnPassantSquare(s) || (!isFree(s, board) && isEnemyAt(s, board))) {
        tmpOptions.push(s);
      }
      s = sq(x + 1, y - 1);
      if (isEnPassantSquare(s) || (!isFree(s, board) && isEnemyAt(s, board))) {
        tmpOptions.push(s);
      }
    } else {
      s = sq(x, y + 1);
      if (isFree(s, board)) {
        tmpOptions.push(s);
      }
      s = sq(x, y + 2);
      if (y === 2 && isFree(s, board)) {
        tmpOptions.push(s);
      }
      s = sq(x - 1, y + 1);
      if (isEnPassantSquare(s) || (!isFree(s, board) && isEnemyAt(s, board))) {
        tmpOptions.push(s);
      }
      s = sq(x + 1, y + 1);
      if (isEnPassantSquare(s) || (!isFree(s, board) && isEnemyAt(s, board))) {
        tmpOptions.push(s);
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

  function markEnPassantSquareIfNeeded(source, dest) {
    const pId = getPieceIdBySquare(source, pieces);
    if (pId[1] != "P") {
      enPassantSquare = "none";
      return;
    }

    if (dest === enPassantSquare) {
      capturedEnPassant = true;
      enPassantSquare = "none";
      return;
    }

    const [sx, sy] = source.split("_").map((i) => parseInt(i));
    const [_, dy] = dest.split("_").map((i) => parseInt(i));
    if (sy + 2 === dy) {
      enPassantSquare = sq(sx, sy + 1);
    } else if (sy - 2 === dy) {
      enPassantSquare = sq(sx, sy - 1);
    } else {
      enPassantSquare = "none";
    }
    console.log("marked potential en passant sq as", enPassantSquare);
  }

  function isCheckmate() {
    let optionsCount = 0;
    pieces.forEach((piece) => {
      if (piece.id[0] != player) {
        return;
      }
      let opts = calculatePossibleOptions(piece.sq, pieces);
      optionsCount += opts.length;
    });

    return optionsCount === 0;
  }

  function handleClick(e) {
    const pos = getMousePos(e);
    const targetSquare = xyToSq(pos.x, pos.y);

    if (selectedSquare != "none") {
      if (options.length > 0 && isOption(targetSquare)) {
        markEnPassantSquareIfNeeded(selectedSquare, targetSquare);
        movePiece(selectedSquare, targetSquare, pieces);
        const opponent = player === "w" ? "b" : "w";
        const kingSquare = getSquareOfKing(opponent, pieces);
        const forPlayer = player;
        checkedSquare = calculateCheckedSquare(pieces, kingSquare, forPlayer);
        switchPlayer();
        if (isCurrentPlayerInCheck(pieces) && isCheckmate()) {
          setTimeout(() => {
            alert("szach mat - koniec gry");
          }, 200);
        }
      }
      clearSelection();
      clearOptions();
    } else {
      if (isMyPieceAt(targetSquare, pieces)) {
        selectedSquare = targetSquare;
        options = calculatePossibleOptions(targetSquare, pieces);
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
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mousemove", handleHover);
  }

  function initPieces() {
    for (let i = 1; i <= 8; i++) {
      putPiece("bP", sq(i, 2));
      putPiece("wP", sq(i, 7));
    }

    ["w", "b"].forEach((c) => {
      const y = c === "w" ? 8 : 1;
      putPiece(c + "R", sq(1, y));
      putPiece(c + "N", sq(2, y));
      putPiece(c + "B", sq(3, y));
      putPiece(c + "Q", sq(4, y));
      putPiece(c + "K", sq(5, y));
      putPiece(c + "B", sq(6, y));
      putPiece(c + "N", sq(7, y));
      putPiece(c + "R", sq(8, y));
    });
  }

  function initImages() {
    const img = [
      "bbishop.png",
      "bking.png",
      "bknight.png",
      "bpawn.png",
      "bqueen.png",
      "brook.png",
      "wbishop.png",
      "wking.png",
      "wknight.png",
      "wpawn.png",
      "wqueen.png",
      "wrook.png",
    ];

    const objects = img.map((imgPath) => {
      const imageObj = new Image();
      imageObj.src = imgPath;
      return imageObj;
    });

    // id => Image
    const keys = img.map((imgPath) => {
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
      const coords = sqToXY(piece.sq);
      ctx.drawImage(
        images[piece.id],
        coords.x,
        coords.y,
        squareSize,
        squareSize,
      );
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
