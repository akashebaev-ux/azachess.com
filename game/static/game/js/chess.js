document.addEventListener("DOMContentLoaded", function () {
    const chessboard = document.getElementById("chessboard");
    const turnDisplay = document.getElementById("turn-display");

    const pieceSymbols = {
        white: {
            king: "♔",
            queen: "♕",
            rook: "♖",
            bishop: "♗",
            knight: "♘",
            pawn: "♙"
        },
        black: {
            king: "♚",
            queen: "♛",
            rook: "♜",
            bishop: "♝",
            knight: "♞",
            pawn: "♟"
        }
    };

    function createPiece(type, color) {
        return {
            type,
            color,
            hasMoved: false
        };
    }

    function createInitialBoard() {
        return [
            [
                createPiece("rook", "black"),
                createPiece("knight", "black"),
                createPiece("bishop", "black"),
                createPiece("queen", "black"),
                createPiece("king", "black"),
                createPiece("bishop", "black"),
                createPiece("knight", "black"),
                createPiece("rook", "black")
            ],
            [
                createPiece("pawn", "black"),
                createPiece("pawn", "black"),
                createPiece("pawn", "black"),
                createPiece("pawn", "black"),
                createPiece("pawn", "black"),
                createPiece("pawn", "black"),
                createPiece("pawn", "black"),
                createPiece("pawn", "black")
            ],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [
                createPiece("pawn", "white"),
                createPiece("pawn", "white"),
                createPiece("pawn", "white"),
                createPiece("pawn", "white"),
                createPiece("pawn", "white"),
                createPiece("pawn", "white"),
                createPiece("pawn", "white"),
                createPiece("pawn", "white")
            ],
            [
                createPiece("rook", "white"),
                createPiece("knight", "white"),
                createPiece("bishop", "white"),
                createPiece("queen", "white"),
                createPiece("king", "white"),
                createPiece("bishop", "white"),
                createPiece("knight", "white"),
                createPiece("rook", "white")
            ]
        ];
    }

    let board = createInitialBoard();

    let currentTurn = "white";
    let selectedSquare = null;
    let enPassantTarget = null;
    let halfMoveClock = 0;
    let gameOver = false;

    const positionHistory = new Map();

    /*
    ============================================================
    BOARD DISPLAY
    ============================================================
    */

    function createBoard() {
        chessboard.innerHTML = "";

        let legalMoves = [];

        if (selectedSquare) {
            legalMoves = getLegalMoves(
                selectedSquare.row,
                selectedSquare.column
            );
        }

        for (let row = 0; row < 8; row++) {
            for (let column = 0; column < 8; column++) {
                const square = document.createElement("div");

                square.classList.add("square");

                if ((row + column) % 2 === 0) {
                    square.classList.add("light");
                } else {
                    square.classList.add("dark");
                }

                square.dataset.row = row;
                square.dataset.column = column;

                const piece = board[row][column];

                if (piece) {
                    square.textContent =
                        pieceSymbols[piece.color][piece.type];
                }

                if (
                    selectedSquare &&
                    selectedSquare.row === row &&
                    selectedSquare.column === column
                ) {
                    square.classList.add("selected");
                }

                const possibleMove = legalMoves.find(
                    move =>
                        move.row === row &&
                        move.column === column
                );

                if (possibleMove) {
                    if (board[row][column]) {
                        square.classList.add("capture-move");
                    } else {
                        square.classList.add("legal-move");
                    }
                }

                square.addEventListener(
                    "click",
                    handleSquareClick
                );

                chessboard.appendChild(square);
            }
        }
    }

    /*
    ============================================================
    CLICKING
    ============================================================
    */

    function handleSquareClick(event) {
        if (gameOver) {
            return;
        }

        const row = Number(event.currentTarget.dataset.row);
        const column = Number(
            event.currentTarget.dataset.column
        );

        const clickedPiece = board[row][column];

        if (!selectedSquare) {
            if (
                clickedPiece &&
                clickedPiece.color === currentTurn
            ) {
                selectedSquare = {
                    row,
                    column
                };

                createBoard();
            }

            return;
        }

        const selectedPiece =
            board[selectedSquare.row][
                selectedSquare.column
            ];

        /*
        Selecting another piece of the same color.
        */
        if (
            clickedPiece &&
            clickedPiece.color === currentTurn
        ) {
            selectedSquare = {
                row,
                column
            };

            createBoard();

            return;
        }

        const legalMoves = getLegalMoves(
            selectedSquare.row,
            selectedSquare.column
        );

        const chosenMove = legalMoves.find(
            move =>
                move.row === row &&
                move.column === column
        );

        if (!chosenMove) {
            return;
        }

        makeMove(
            selectedSquare.row,
            selectedSquare.column,
            chosenMove
        );

        selectedSquare = null;

        createBoard();

        evaluateGameState();
    }

    /*
    ============================================================
    LEGAL MOVES
    ============================================================
    */

    function getLegalMoves(row, column) {
        const piece = board[row][column];

        if (!piece) {
            return [];
        }

        const pseudoMoves = getPseudoLegalMoves(
            board,
            row,
            column,
            piece
        );

        return pseudoMoves.filter(move => {
            return !wouldLeaveKingInCheck(
                row,
                column,
                move,
                piece.color
            );
        });
    }

    function getPseudoLegalMoves(
        boardState,
        row,
        column,
        piece
    ) {
        switch (piece.type) {
            case "pawn":
                return getPawnMoves(
                    boardState,
                    row,
                    column,
                    piece
                );

            case "rook":
                return getRookMoves(
                    boardState,
                    row,
                    column,
                    piece
                );

            case "knight":
                return getKnightMoves(
                    boardState,
                    row,
                    column,
                    piece
                );

            case "bishop":
                return getBishopMoves(
                    boardState,
                    row,
                    column,
                    piece
                );

            case "queen":
                return getQueenMoves(
                    boardState,
                    row,
                    column,
                    piece
                );

            case "king":
                return getKingMoves(
                    boardState,
                    row,
                    column,
                    piece
                );

            default:
                return [];
        }
    }

    /*
    ============================================================
    PAWN
    ============================================================
    */

    function getPawnMoves(
        boardState,
        row,
        column,
        piece
    ) {
        const moves = [];

        const direction =
            piece.color === "white" ? -1 : 1;

        const startingRow =
            piece.color === "white" ? 6 : 1;

        const oneStepRow = row + direction;

        /*
        One square forward.
        */
        if (
            isInsideBoard(oneStepRow, column) &&
            boardState[oneStepRow][column] === null
        ) {
            moves.push({
                row: oneStepRow,
                column
            });

            /*
            Two squares forward from starting position.
            */
            const twoStepRow =
                row + direction * 2;

            if (
                row === startingRow &&
                boardState[twoStepRow][column] === null
            ) {
                moves.push({
                    row: twoStepRow,
                    column
                });
            }
        }

        /*
        Normal diagonal captures.
        */
        for (const offset of [-1, 1]) {
            const captureColumn =
                column + offset;

            const captureRow =
                row + direction;

            if (
                !isInsideBoard(
                    captureRow,
                    captureColumn
                )
            ) {
                continue;
            }

            const target =
                boardState[captureRow][captureColumn];

            if (
                target &&
                target.color !== piece.color
            ) {
                moves.push({
                    row: captureRow,
                    column: captureColumn
                });
            }
        }

        /*
        En passant.
        */
        if (enPassantTarget) {
            if (
                enPassantTarget.color !== piece.color &&
                row + direction ===
                    enPassantTarget.row &&
                Math.abs(
                    column -
                    enPassantTarget.column
                ) === 1
            ) {
                const capturedPawn =
                    boardState[
                        enPassantTarget.pawnRow
                    ][
                        enPassantTarget.pawnColumn
                    ];

                if (
                    capturedPawn &&
                    capturedPawn.type === "pawn" &&
                    capturedPawn.color !== piece.color
                ) {
                    moves.push({
                        row: enPassantTarget.row,
                        column:
                            enPassantTarget.column,
                        special: "enPassant",
                        captureRow:
                            enPassantTarget.pawnRow,
                        captureColumn:
                            enPassantTarget.pawnColumn
                    });
                }
            }
        }

        return moves;
    }

    /*
    ============================================================
    ROOK
    ============================================================
    */

    function getRookMoves(
        boardState,
        row,
        column,
        piece
    ) {
        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ];

        return getSlidingMoves(
            boardState,
            row,
            column,
            piece,
            directions
        );
    }

    /*
    ============================================================
    BISHOP
    ============================================================
    */

    function getBishopMoves(
        boardState,
        row,
        column,
        piece
    ) {
        const directions = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ];

        return getSlidingMoves(
            boardState,
            row,
            column,
            piece,
            directions
        );
    }

    /*
    ============================================================
    QUEEN
    ============================================================
    */

    function getQueenMoves(
        boardState,
        row,
        column,
        piece
    ) {
        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ];

        return getSlidingMoves(
            boardState,
            row,
            column,
            piece,
            directions
        );
    }

    /*
    ============================================================
    SLIDING PIECES
    ============================================================
    */

    function getSlidingMoves(
        boardState,
        row,
        column,
        piece,
        directions
    ) {
        const moves = [];

        for (const [rowDirection, columnDirection]
            of directions) {

            let newRow =
                row + rowDirection;

            let newColumn =
                column + columnDirection;

            while (
                isInsideBoard(
                    newRow,
                    newColumn
                )
            ) {
                const target =
                    boardState[newRow][newColumn];

                if (!target) {
                    moves.push({
                        row: newRow,
                        column: newColumn
                    });
                } else {
                    if (
                        target.color !== piece.color
                    ) {
                        moves.push({
                            row: newRow,
                            column: newColumn
                        });
                    }

                    break;
                }

                newRow += rowDirection;
                newColumn += columnDirection;
            }
        }

        return moves;
    }

    /*
    ============================================================
    KNIGHT
    ============================================================
    */

    function getKnightMoves(
        boardState,
        row,
        column,
        piece
    ) {
        const moves = [];

        const offsets = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1]
        ];

        for (
            const [rowOffset, columnOffset]
            of offsets
        ) {
            const newRow =
                row + rowOffset;

            const newColumn =
                column + columnOffset;

            if (
                !isInsideBoard(
                    newRow,
                    newColumn
                )
            ) {
                continue;
            }

            const target =
                boardState[newRow][newColumn];

            if (
                !target ||
                target.color !== piece.color
            ) {
                moves.push({
                    row: newRow,
                    column: newColumn
                });
            }
        }

        return moves;
    }

    /*
    ============================================================
    KING
    ============================================================
    */

    function getKingMoves(
        boardState,
        row,
        column,
        piece
    ) {
        const moves = [];

        for (
            let rowOffset = -1;
            rowOffset <= 1;
            rowOffset++
        ) {
            for (
                let columnOffset = -1;
                columnOffset <= 1;
                columnOffset++
            ) {
                if (
                    rowOffset === 0 &&
                    columnOffset === 0
                ) {
                    continue;
                }

                const newRow =
                    row + rowOffset;

                const newColumn =
                    column + columnOffset;

                if (
                    !isInsideBoard(
                        newRow,
                        newColumn
                    )
                ) {
                    continue;
                }

                const target =
                    boardState[newRow][newColumn];

                if (
                    !target ||
                    target.color !== piece.color
                ) {
                    moves.push({
                        row: newRow,
                        column: newColumn
                    });
                }
            }
        }

        /*
        Castling only applies to the real board.
        */
        if (boardState === board) {
            if (
                canCastle(
                    piece.color,
                    "kingSide"
                )
            ) {
                moves.push({
                    row,
                    column: 6,
                    special: "castle",
                    rookFromColumn: 7,
                    rookToColumn: 5
                });
            }

            if (
                canCastle(
                    piece.color,
                    "queenSide"
                )
            ) {
                moves.push({
                    row,
                    column: 2,
                    special: "castle",
                    rookFromColumn: 0,
                    rookToColumn: 3
                });
            }
        }

        return moves;
    }

    /*
    ============================================================
    CASTLING
    ============================================================
    */

    function canCastle(color, side) {
        const row =
            color === "white" ? 7 : 0;

        const king =
            board[row][4];

        if (
            !king ||
            king.type !== "king" ||
            king.color !== color ||
            king.hasMoved
        ) {
            return false;
        }

        /*
        Cannot castle while currently in check.
        */
        if (
            isKingInCheck(
                board,
                color
            )
        ) {
            return false;
        }

        const enemy =
            oppositeColor(color);

        if (side === "kingSide") {
            const rook =
                board[row][7];

            if (
                !rook ||
                rook.type !== "rook" ||
                rook.color !== color ||
                rook.hasMoved
            ) {
                return false;
            }

            if (
                board[row][5] ||
                board[row][6]
            ) {
                return false;
            }

            if (
                isSquareAttacked(
                    board,
                    row,
                    5,
                    enemy
                ) ||
                isSquareAttacked(
                    board,
                    row,
                    6,
                    enemy
                )
            ) {
                return false;
            }

            return true;
        }

        if (side === "queenSide") {
            const rook =
                board[row][0];

            if (
                !rook ||
                rook.type !== "rook" ||
                rook.color !== color ||
                rook.hasMoved
            ) {
                return false;
            }

            if (
                board[row][1] ||
                board[row][2] ||
                board[row][3]
            ) {
                return false;
            }

            if (
                isSquareAttacked(
                    board,
                    row,
                    3,
                    enemy
                ) ||
                isSquareAttacked(
                    board,
                    row,
                    2,
                    enemy
                )
            ) {
                return false;
            }

            return true;
        }

        return false;
    }

    /*
    ============================================================
    CHECK VALIDATION
    ============================================================
    */

    function wouldLeaveKingInCheck(
        fromRow,
        fromColumn,
        move,
        color
    ) {
        const temporaryBoard =
            cloneBoard(board);

        executeMoveOnBoard(
            temporaryBoard,
            fromRow,
            fromColumn,
            move
        );

        return isKingInCheck(
            temporaryBoard,
            color
        );
    }

    function isKingInCheck(
        boardState,
        color
    ) {
        const kingPosition =
            findKing(
                boardState,
                color
            );

        if (!kingPosition) {
            return true;
        }

        return isSquareAttacked(
            boardState,
            kingPosition.row,
            kingPosition.column,
            oppositeColor(color)
        );
    }

    function findKing(
        boardState,
        color
    ) {
        for (let row = 0; row < 8; row++) {
            for (
                let column = 0;
                column < 8;
                column++
            ) {
                const piece =
                    boardState[row][column];

                if (
                    piece &&
                    piece.type === "king" &&
                    piece.color === color
                ) {
                    return {
                        row,
                        column
                    };
                }
            }
        }

        return null;
    }

    /*
    ============================================================
    SQUARE ATTACK DETECTION
    ============================================================
    */

    function isSquareAttacked(
        boardState,
        row,
        column,
        attackingColor
    ) {
        /*
        Pawn attacks.
        */

        const pawnDirection =
            attackingColor === "white"
                ? -1
                : 1;

        const pawnSourceRow =
            row - pawnDirection;

        for (const offset of [-1, 1]) {
            const pawnColumn =
                column + offset;

            if (
                !isInsideBoard(
                    pawnSourceRow,
                    pawnColumn
                )
            ) {
                continue;
            }

            const piece =
                boardState[
                    pawnSourceRow
                ][
                    pawnColumn
                ];

            if (
                piece &&
                piece.color === attackingColor &&
                piece.type === "pawn"
            ) {
                return true;
            }
        }

        /*
        Knight attacks.
        */

        const knightOffsets = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1]
        ];

        for (
            const [rowOffset, columnOffset]
            of knightOffsets
        ) {
            const sourceRow =
                row + rowOffset;

            const sourceColumn =
                column + columnOffset;

            if (
                !isInsideBoard(
                    sourceRow,
                    sourceColumn
                )
            ) {
                continue;
            }

            const piece =
                boardState[
                    sourceRow
                ][
                    sourceColumn
                ];

            if (
                piece &&
                piece.color === attackingColor &&
                piece.type === "knight"
            ) {
                return true;
            }
        }

        /*
        King attacks.
        */

        for (
            let rowOffset = -1;
            rowOffset <= 1;
            rowOffset++
        ) {
            for (
                let columnOffset = -1;
                columnOffset <= 1;
                columnOffset++
            ) {
                if (
                    rowOffset === 0 &&
                    columnOffset === 0
                ) {
                    continue;
                }

                const sourceRow =
                    row + rowOffset;

                const sourceColumn =
                    column + columnOffset;

                if (
                    !isInsideBoard(
                        sourceRow,
                        sourceColumn
                    )
                ) {
                    continue;
                }

                const piece =
                    boardState[
                        sourceRow
                    ][
                        sourceColumn
                    ];

                if (
                    piece &&
                    piece.color === attackingColor &&
                    piece.type === "king"
                ) {
                    return true;
                }
            }
        }

        /*
        Rook / Queen straight attacks.
        */

        const straightDirections = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ];

        if (
            hasSlidingAttack(
                boardState,
                row,
                column,
                attackingColor,
                straightDirections,
                ["rook", "queen"]
            )
        ) {
            return true;
        }

        /*
        Bishop / Queen diagonal attacks.
        */

        const diagonalDirections = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ];

        if (
            hasSlidingAttack(
                boardState,
                row,
                column,
                attackingColor,
                diagonalDirections,
                ["bishop", "queen"]
            )
        ) {
            return true;
        }

        return false;
    }

    function hasSlidingAttack(
        boardState,
        row,
        column,
        attackingColor,
        directions,
        allowedTypes
    ) {
        for (
            const [rowDirection, columnDirection]
            of directions
        ) {
            let newRow =
                row + rowDirection;

            let newColumn =
                column + columnDirection;

            while (
                isInsideBoard(
                    newRow,
                    newColumn
                )
            ) {
                const piece =
                    boardState[newRow][newColumn];

                if (!piece) {
                    newRow += rowDirection;
                    newColumn += columnDirection;

                    continue;
                }

                if (
                    piece.color === attackingColor &&
                    allowedTypes.includes(
                        piece.type
                    )
                ) {
                    return true;
                }

                break;
            }
        }

        return false;
    }

    /*
    ============================================================
    EXECUTE MOVE
    ============================================================
    */

    function makeMove(
        fromRow,
        fromColumn,
        move
    ) {
        const piece =
            board[fromRow][fromColumn];

        let capturedPiece =
            board[move.row][move.column];

        /*
        En passant capture.
        */

        if (
            move.special === "enPassant"
        ) {
            capturedPiece =
                board[
                    move.captureRow
                ][
                    move.captureColumn
                ];

            board[
                move.captureRow
            ][
                move.captureColumn
            ] = null;
        }

        /*
        50-move counter.
        */

        if (
            piece.type === "pawn" ||
            capturedPiece
        ) {
            halfMoveClock = 0;
        } else {
            halfMoveClock++;
        }

        board[move.row][move.column] =
            piece;

        board[fromRow][fromColumn] =
            null;

        /*
        Castling rook movement.
        */

        if (
            move.special === "castle"
        ) {
            const rook =
                board[
                    move.row
                ][
                    move.rookFromColumn
                ];

            board[
                move.row
            ][
                move.rookToColumn
            ] = rook;

            board[
                move.row
            ][
                move.rookFromColumn
            ] = null;

            if (rook) {
                rook.hasMoved = true;
            }
        }

        piece.hasMoved = true;

        /*
        Promotion.
        */

        if (
            piece.type === "pawn" &&
            (
                move.row === 0 ||
                move.row === 7
            )
        ) {
            piece.type =
                choosePromotionPiece();
        }

        /*
        Reset old en passant.
        */

        enPassantTarget = null;

        /*
        Create new en passant possibility
        after a pawn moves two squares.
        */

        if (
            piece.type === "pawn" &&
            Math.abs(
                move.row - fromRow
            ) === 2
        ) {
            enPassantTarget = {
                row:
                    (move.row + fromRow) / 2,
                column: move.column,
                pawnRow: move.row,
                pawnColumn: move.column,
                color: piece.color
            };
        }

        currentTurn =
            oppositeColor(currentTurn);

        recordPosition();

        updateTurnDisplay();
    }

    function executeMoveOnBoard(
        boardState,
        fromRow,
        fromColumn,
        move
    ) {
        const piece =
            boardState[fromRow][fromColumn];

        boardState[
            move.row
        ][
            move.column
        ] = piece;

        boardState[
            fromRow
        ][
            fromColumn
        ] = null;

        if (
            move.special === "enPassant"
        ) {
            boardState[
                move.captureRow
            ][
                move.captureColumn
            ] = null;
        }

        if (
            move.special === "castle"
        ) {
            const rook =
                boardState[
                    move.row
                ][
                    move.rookFromColumn
                ];

            boardState[
                move.row
            ][
                move.rookToColumn
            ] = rook;

            boardState[
                move.row
            ][
                move.rookFromColumn
            ] = null;
        }
    }

    /*
    ============================================================
    PROMOTION
    ============================================================
    */

    function choosePromotionPiece() {
        const answer = window.prompt(
            "Promote pawn to: queen, rook, bishop or knight",
            "queen"
        );

        if (!answer) {
            return "queen";
        }

        const value =
            answer.trim().toLowerCase();

        const promotionOptions = {
            q: "queen",
            queen: "queen",

            r: "rook",
            rook: "rook",

            b: "bishop",
            bishop: "bishop",

            n: "knight",
            knight: "knight"
        };

        return (
            promotionOptions[value] ||
            "queen"
        );
    }

    /*
    ============================================================
    CHECKMATE / STALEMATE / DRAW
    ============================================================
    */

    function evaluateGameState() {
        const inCheck =
            isKingInCheck(
                board,
                currentTurn
            );

        const hasLegalMove =
            playerHasLegalMove(
                currentTurn
            );

        /*
        Checkmate.
        */

        if (
            inCheck &&
            !hasLegalMove
        ) {
            const winner =
                oppositeColor(
                    currentTurn
                );

            turnDisplay.textContent =
                `${capitalize(winner)} wins by checkmate`;

            gameOver = true;

            return;
        }

        /*
        Stalemate.
        */

        if (
            !inCheck &&
            !hasLegalMove
        ) {
            turnDisplay.textContent =
                "Draw by stalemate";

            gameOver = true;

            return;
        }

        /*
        50-move rule.
        100 half-moves = 50 moves by each side.
        */

        if (
            halfMoveClock >= 100
        ) {
            turnDisplay.textContent =
                "Draw by 50-move rule";

            gameOver = true;

            return;
        }

        /*
        Threefold repetition.
        */

        const positionKey =
            getPositionKey();

        if (
            (
                positionHistory.get(
                    positionKey
                ) || 0
            ) >= 3
        ) {
            turnDisplay.textContent =
                "Draw by threefold repetition";

            gameOver = true;

            return;
        }

        /*
        Insufficient material.
        */

        if (
            isInsufficientMaterial()
        ) {
            turnDisplay.textContent =
                "Draw by insufficient material";

            gameOver = true;

            return;
        }

        if (inCheck) {
            turnDisplay.textContent =
                `${capitalize(currentTurn)} — Check`;
        } else {
            updateTurnDisplay();
        }
    }

    function playerHasLegalMove(color) {
        for (
            let row = 0;
            row < 8;
            row++
        ) {
            for (
                let column = 0;
                column < 8;
                column++
            ) {
                const piece =
                    board[row][column];

                if (
                    piece &&
                    piece.color === color
                ) {
                    const moves =
                        getLegalMoves(
                            row,
                            column
                        );

                    if (
                        moves.length > 0
                    ) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /*
    ============================================================
    THREEFOLD REPETITION
    ============================================================
    */

    function recordPosition() {
        const key =
            getPositionKey();

        const currentCount =
            positionHistory.get(key) || 0;

        positionHistory.set(
            key,
            currentCount + 1
        );
    }

    function getPositionKey() {
        let key = "";

        for (
            let row = 0;
            row < 8;
            row++
        ) {
            for (
                let column = 0;
                column < 8;
                column++
            ) {
                const piece =
                    board[row][column];

                if (!piece) {
                    key += "--";
                    continue;
                }

                key +=
                    piece.color[0] +
                    piece.type[0];
            }
        }

        key += `-${currentTurn}`;

        key += `-${getCastlingRights()}`;

        if (enPassantTarget) {
            key +=
                `-ep${enPassantTarget.row}${enPassantTarget.column}`;
        } else {
            key += "-ep-";
        }

        return key;
    }

    function getCastlingRights() {
        let rights = "";

        const whiteKing =
            board[7][4];

        if (
            whiteKing &&
            whiteKing.type === "king" &&
            whiteKing.color === "white" &&
            !whiteKing.hasMoved
        ) {
            const whiteKingRook =
                board[7][7];

            const whiteQueenRook =
                board[7][0];

            if (
                whiteKingRook &&
                whiteKingRook.type === "rook" &&
                whiteKingRook.color === "white" &&
                !whiteKingRook.hasMoved
            ) {
                rights += "K";
            }

            if (
                whiteQueenRook &&
                whiteQueenRook.type === "rook" &&
                whiteQueenRook.color === "white" &&
                !whiteQueenRook.hasMoved
            ) {
                rights += "Q";
            }
        }

        const blackKing =
            board[0][4];

        if (
            blackKing &&
            blackKing.type === "king" &&
            blackKing.color === "black" &&
            !blackKing.hasMoved
        ) {
            const blackKingRook =
                board[0][7];

            const blackQueenRook =
                board[0][0];

            if (
                blackKingRook &&
                blackKingRook.type === "rook" &&
                blackKingRook.color === "black" &&
                !blackKingRook.hasMoved
            ) {
                rights += "k";
            }

            if (
                blackQueenRook &&
                blackQueenRook.type === "rook" &&
                blackQueenRook.color === "black" &&
                !blackQueenRook.hasMoved
            ) {
                rights += "q";
            }
        }

        return rights || "-";
    }

    /*
    ============================================================
    INSUFFICIENT MATERIAL
    ============================================================
    */

    function isInsufficientMaterial() {
        const pieces = [];

        for (
            let row = 0;
            row < 8;
            row++
        ) {
            for (
                let column = 0;
                column < 8;
                column++
            ) {
                const piece =
                    board[row][column];

                if (
                    piece &&
                    piece.type !== "king"
                ) {
                    pieces.push({
                        ...piece,
                        row,
                        column
                    });
                }
            }
        }

        /*
        King vs King.
        */
        if (
            pieces.length === 0
        ) {
            return true;
        }

        /*
        King + Bishop vs King
        or
        King + Knight vs King.
        */
        if (
            pieces.length === 1 &&
            (
                pieces[0].type === "bishop" ||
                pieces[0].type === "knight"
            )
        ) {
            return true;
        }

        /*
        King + Bishop vs King + Bishop,
        when both bishops are on the same
        color squares.
        */
        if (
            pieces.length === 2 &&
            pieces.every(
                piece =>
                    piece.type === "bishop"
            )
        ) {
            const firstSquareColor =
                (
                    pieces[0].row +
                    pieces[0].column
                ) % 2;

            const secondSquareColor =
                (
                    pieces[1].row +
                    pieces[1].column
                ) % 2;

            if (
                firstSquareColor ===
                secondSquareColor
            ) {
                return true;
            }
        }

        return false;
    }

    /*
    ============================================================
    HELPERS
    ============================================================
    */

    function cloneBoard(
        boardState
    ) {
        return boardState.map(row =>
            row.map(piece =>
                piece
                    ? { ...piece }
                    : null
            )
        );
    }

    function isInsideBoard(
        row,
        column
    ) {
        return (
            row >= 0 &&
            row < 8 &&
            column >= 0 &&
            column < 8
        );
    }

    function oppositeColor(color) {
        return (
            color === "white"
                ? "black"
                : "white"
        );
    }

    function capitalize(value) {
        return (
            value.charAt(0).toUpperCase() +
            value.slice(1)
        );
    }

    function updateTurnDisplay() {
        turnDisplay.textContent =
            capitalize(currentTurn);
    }

    /*
    ============================================================
    START GAME
    ============================================================
    */

    recordPosition();
    updateTurnDisplay();
    createBoard();
});
