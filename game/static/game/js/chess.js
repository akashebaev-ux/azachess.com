document.addEventListener("DOMContentLoaded", function () {
    /*
    ============================================================
    DOM ELEMENTS
    ============================================================
    */

    const chessboard = document.getElementById("chessboard");
    const turnDisplay = document.getElementById("turn-display");

    const capturedWhiteContainer =
        document.getElementById("captured-white");

    const capturedBlackContainer =
        document.getElementById("captured-black");

    const moveHistoryContainer =
        document.getElementById("move-history");

    const drawButton =
        document.getElementById("draw-button");

    const resignButton =
        document.getElementById("resign-button");

    const newGameButton =
        document.getElementById("new-game-button");


    /*
    ============================================================
    BOARD COORDINATES
    ============================================================
    */

    const boardFiles = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H"
    ];

    const boardRanks = [
        8,
        7,
        6,
        5,
        4,
        3,
        2,
        1
    ];


    /*
    ============================================================
    PIECES
    ============================================================
    */

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
            [
                null, null, null, null,
                null, null, null, null
            ],
            [
                null, null, null, null,
                null, null, null, null
            ],
            [
                null, null, null, null,
                null, null, null, null
            ],
            [
                null, null, null, null,
                null, null, null, null
            ],
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


    /*
    ============================================================
    GAME STATE
    ============================================================
    */

    let board = createInitialBoard();

    let currentTurn = "white";

    let selectedSquare = null;

    let enPassantTarget = null;

    let halfMoveClock = 0;

    let gameOver = false;

    let lastMove = null;


    /*
    Captured pieces.
    */

    let capturedWhitePieces = [];
    let capturedBlackPieces = [];


    /*
    Move history.

    Each element looks like:

    {
        moveNumber: 1,
        white: "e4",
        black: "e5"
    }
    */

    let moveHistory = [];

    let fullMoveNumber = 1;


    /*
    Threefold repetition.
    */

    const positionHistory = new Map();


    /*
    ============================================================
    PIECE IMAGE PATH
    ============================================================
    */

    function getPieceImagePath(piece) {
        return (
            `/static/game/images/pieces/` +
            `${piece.color}/${piece.type}.svg`
        );
    }


    /*
    ============================================================
    CREATE / RENDER BOARD
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
                const square =
                    document.createElement("div");

                square.classList.add("square");

                if ((row + column) % 2 === 0) {
                    square.classList.add("light");
                } else {
                    square.classList.add("dark");
                }

                square.dataset.row = row;
                square.dataset.column = column;


                /*
                Rank labels: 8 → 1
                */

                if (column === 0) {
                    square.dataset.rank =
                        boardRanks[row];
                }


                /*
                File labels: A → H
                */

                if (row === 7) {
                    square.dataset.file =
                        boardFiles[column];
                }


                /*
                Selected square.
                */

                if (
                    selectedSquare &&
                    selectedSquare.row === row &&
                    selectedSquare.column === column
                ) {
                    square.classList.add(
                        "selected"
                    );
                }


                /*
                Legal move highlights.
                */

                const possibleMove =
                    legalMoves.find(
                        move =>
                            move.row === row &&
                            move.column === column
                    );

                if (possibleMove) {
                    const targetPiece =
                        board[row][column];

                    if (
                        targetPiece ||
                        possibleMove.special ===
                            "enPassant"
                    ) {
                        square.classList.add(
                            "capture-move"
                        );
                    } else {
                        square.classList.add(
                            "legal-move"
                        );
                    }
                }


                /*
                Render SVG piece.
                */

                const piece =
                    board[row][column];

                if (piece) {
                    const image =
                        document.createElement("img");

                    image.src =
                        getPieceImagePath(piece);

                    image.alt =
                        `${piece.color} ${piece.type}`;

                    image.classList.add(
                        "piece-image"
                    );

                    image.draggable = false;

                    square.appendChild(image);
                }


                square.addEventListener(
                    "click",
                    handleSquareClick
                );

                chessboard.appendChild(square);
            }
        }
        drawLastMoveArrow();
    }


    /*
    ============================================================
    CLICK HANDLING
    ============================================================
    */

    function handleSquareClick(event) {
        if (gameOver) {
            return;
        }

        const row =
            Number(
                event.currentTarget.dataset.row
            );

        const column =
            Number(
                event.currentTarget.dataset.column
            );

        const clickedPiece =
            board[row][column];


        /*
        Nothing selected yet.
        */

        if (!selectedSquare) {
            if (
                clickedPiece &&
                clickedPiece.color ===
                    currentTurn
            ) {
                selectedSquare = {
                    row,
                    column
                };

                createBoard();
            }

            return;
        }


        /*
        Click the selected square again
        to deselect.
        */

        if (
            selectedSquare.row === row &&
            selectedSquare.column === column
        ) {
            selectedSquare = null;

            createBoard();

            return;
        }


        /*
        Select another friendly piece.
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


        /*
        Find whether destination is legal.
        */

        const legalMoves =
            getLegalMoves(
                selectedSquare.row,
                selectedSquare.column
            );

        const chosenMove =
            legalMoves.find(
                move =>
                    move.row === row &&
                    move.column === column
            );

        if (!chosenMove) {
            return;
        }


        /*
        Execute move.
        */

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
    LEGAL MOVE GENERATION
    ============================================================
    */

    function getLegalMoves(row, column) {
        const piece =
            board[row][column];

        if (!piece) {
            return [];
        }

        const pseudoMoves =
            getPseudoLegalMoves(
                board,
                row,
                column,
                piece
            );

        return pseudoMoves.filter(
            move =>
                !wouldLeaveKingInCheck(
                    row,
                    column,
                    move,
                    piece.color
                )
        );
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
    PAWN MOVEMENT
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
            piece.color === "white"
                ? -1
                : 1;

        const startingRow =
            piece.color === "white"
                ? 6
                : 1;

        const oneStepRow =
            row + direction;


        /*
        Move one square forward.
        */

        if (
            isInsideBoard(
                oneStepRow,
                column
            ) &&
            boardState[
                oneStepRow
            ][
                column
            ] === null
        ) {
            moves.push({
                row: oneStepRow,
                column
            });


            /*
            Move two squares from
            starting position.
            */

            const twoStepRow =
                row + direction * 2;

            if (
                row === startingRow &&
                boardState[
                    twoStepRow
                ][
                    column
                ] === null
            ) {
                moves.push({
                    row: twoStepRow,
                    column
                });
            }
        }


        /*
        Normal pawn captures.
        */

        for (const offset of [-1, 1]) {
            const captureRow =
                row + direction;

            const captureColumn =
                column + offset;

            if (
                !isInsideBoard(
                    captureRow,
                    captureColumn
                )
            ) {
                continue;
            }

            const target =
                boardState[
                    captureRow
                ][
                    captureColumn
                ];

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
                enPassantTarget.color !==
                    piece.color &&
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
                    capturedPawn.type ===
                        "pawn" &&
                    capturedPawn.color !==
                        piece.color
                ) {
                    moves.push({
                        row:
                            enPassantTarget.row,

                        column:
                            enPassantTarget.column,

                        special:
                            "enPassant",

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
    ROOK MOVEMENT
    ============================================================
    */

    function getRookMoves(
        boardState,
        row,
        column,
        piece
    ) {
        return getSlidingMoves(
            boardState,
            row,
            column,
            piece,
            [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            ]
        );
    }


    /*
    ============================================================
    BISHOP MOVEMENT
    ============================================================
    */

    function getBishopMoves(
        boardState,
        row,
        column,
        piece
    ) {
        return getSlidingMoves(
            boardState,
            row,
            column,
            piece,
            [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ]
        );
    }


    /*
    ============================================================
    QUEEN MOVEMENT
    ============================================================
    */

    function getQueenMoves(
        boardState,
        row,
        column,
        piece
    ) {
        return getSlidingMoves(
            boardState,
            row,
            column,
            piece,
            [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ]
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

        for (
            const [
                rowDirection,
                columnDirection
            ] of directions
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
                const target =
                    boardState[
                        newRow
                    ][
                        newColumn
                    ];

                if (!target) {
                    moves.push({
                        row: newRow,
                        column: newColumn
                    });
                } else {
                    if (
                        target.color !==
                            piece.color
                    ) {
                        moves.push({
                            row: newRow,
                            column: newColumn
                        });
                    }

                    break;
                }

                newRow +=
                    rowDirection;

                newColumn +=
                    columnDirection;
            }
        }

        return moves;
    }


    /*
    ============================================================
    KNIGHT MOVEMENT
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
            const [
                rowOffset,
                columnOffset
            ] of offsets
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
                boardState[
                    newRow
                ][
                    newColumn
                ];

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
    KING MOVEMENT
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
                    boardState[
                        newRow
                    ][
                        newColumn
                    ];

                if (
                    !target ||
                    target.color !==
                        piece.color
                ) {
                    moves.push({
                        row: newRow,
                        column: newColumn
                    });
                }
            }
        }


        /*
        Castling.
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
            color === "white"
                ? 7
                : 0;

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
        Cannot castle while in check.
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


        /*
        Kingside castle.
        */

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


        /*
        Queenside castle.
        */

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
    KING SAFETY
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
                    boardState[
                        row
                    ][
                        column
                    ];

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
    ATTACK DETECTION
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
                piece.color ===
                    attackingColor &&
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
            const [
                rowOffset,
                columnOffset
            ] of knightOffsets
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
                piece.color ===
                    attackingColor &&
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
                    piece.color ===
                        attackingColor &&
                    piece.type === "king"
                ) {
                    return true;
                }
            }
        }


        /*
        Rook and Queen straight attacks.
        */

        if (
            hasSlidingAttack(
                boardState,
                row,
                column,
                attackingColor,
                [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ],
                [
                    "rook",
                    "queen"
                ]
            )
        ) {
            return true;
        }


        /*
        Bishop and Queen diagonal attacks.
        */

        if (
            hasSlidingAttack(
                boardState,
                row,
                column,
                attackingColor,
                [
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1]
                ],
                [
                    "bishop",
                    "queen"
                ]
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
            const [
                rowDirection,
                columnDirection
            ] of directions
        ) {
            let newRow =
                row + rowDirection;

            let newColumn =
                column +
                columnDirection;

            while (
                isInsideBoard(
                    newRow,
                    newColumn
                )
            ) {
                const piece =
                    boardState[
                        newRow
                    ][
                        newColumn
                    ];

                if (!piece) {
                    newRow +=
                        rowDirection;

                    newColumn +=
                        columnDirection;

                    continue;
                }

                if (
                    piece.color ===
                        attackingColor &&
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
    EXECUTE REAL MOVE
    ============================================================
    */

    function makeMove(
        fromRow,
        fromColumn,
        move
    ) {
        const piece =
            board[fromRow][fromColumn];

        if (!piece) {
            return;
        }

        const movingColor =
            piece.color;

        const originalPieceType =
            piece.type;

        let capturedPiece =
            board[
                move.row
            ][
                move.column
            ];


        /*
        En passant capture.
        */

        if (
            move.special ===
                "enPassant"
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
        Track captured pieces.
        */

        if (capturedPiece) {
            const capturedCopy = {
                type:
                    capturedPiece.type,

                color:
                    capturedPiece.color
            };

            if (
                capturedPiece.color ===
                    "white"
            ) {
                capturedWhitePieces.push(
                    capturedCopy
                );
            } else {
                capturedBlackPieces.push(
                    capturedCopy
                );
            }
        }


        /*
        50 move counter.
        */

        if (
            originalPieceType ===
                "pawn" ||
            capturedPiece
        ) {
            halfMoveClock = 0;
        } else {
            halfMoveClock++;
        }


        /*
        Move piece.
        */

        board[
            move.row
        ][
            move.column
        ] = piece;

        board[
            fromRow
        ][
            fromColumn
        ] = null;


        /*
        Castling rook movement.
        */

        if (
            move.special ===
                "castle"
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

        let promotionPiece = null;

        if (
            originalPieceType === "pawn" &&
            (
                move.row === 0 ||
                move.row === 7
            )
        ) {
            promotionPiece =
                choosePromotionPiece();

            piece.type =
                promotionPiece;
        }


        /*
        Save previous en passant status.
        */

        enPassantTarget = null;


        /*
        Create new en passant target
        if pawn moved two squares.
        */

        if (
            originalPieceType === "pawn" &&
            Math.abs(
                move.row - fromRow
            ) === 2
        ) {
            enPassantTarget = {
                row:
                    (
                        move.row +
                        fromRow
                    ) / 2,

                column:
                    move.column,

                pawnRow:
                    move.row,

                pawnColumn:
                    move.column,

                color:
                    movingColor
            };
        }


        /*
        Store move for highlighting.
        */

        lastMove = {
            fromRow,
            fromColumn,
            toRow: move.row,
            toColumn: move.column
        };


        /*
        Change turn before determining
        check or checkmate notation.
        */

        currentTurn =
            oppositeColor(
                currentTurn
            );


        /*
        Generate notation.
        */

        let notation =
            createMoveNotation({
                originalPieceType,
                movingColor,
                fromRow,
                fromColumn,
                move,
                capturedPiece,
                promotionPiece
            });


        /*
        Add + or #.
        */

        const opponentInCheck =
            isKingInCheck(
                board,
                currentTurn
            );

        const opponentHasMove =
            playerHasLegalMove(
                currentTurn
            );

        if (
            opponentInCheck &&
            !opponentHasMove
        ) {
            notation += "#";
        } else if (opponentInCheck) {
            notation += "+";
        }


        /*
        Save move history.
        */

        addMoveToHistory(
            movingColor,
            notation
        );


        /*
        Position history.
        */

        recordPosition();


        /*
        Update UI.
        */

        updateTurnDisplay();

        renderCapturedPieces();

        renderMoveHistory();
    }


    /*
    ============================================================
    TEMPORARY MOVE
    Used to check king safety.
    ============================================================
    */

    function executeMoveOnBoard(
        boardState,
        fromRow,
        fromColumn,
        move
    ) {
        const piece =
            boardState[
                fromRow
            ][
                fromColumn
            ];

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
            move.special ===
                "enPassant"
        ) {
            boardState[
                move.captureRow
            ][
                move.captureColumn
            ] = null;
        }


        if (
            move.special ===
                "castle"
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
    PAWN PROMOTION
    ============================================================
    */

    function choosePromotionPiece() {
        const answer =
            window.prompt(
                "Promote pawn to queen, rook, bishop or knight:",
                "queen"
            );

        if (!answer) {
            return "queen";
        }

        const value =
            answer
                .trim()
                .toLowerCase();

        const options = {
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
            options[value] ||
            "queen"
        );
    }


    /*
    ============================================================
    MOVE NOTATION
    ============================================================
    */

    function getSquareName(
        row,
        column
    ) {
        const files = [
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h"
        ];

        const rank =
            8 - row;

        return (
            `${files[column]}${rank}`
        );
    }


    function getPieceLetter(type) {
        const letters = {
            king: "K",
            queen: "Q",
            rook: "R",
            bishop: "B",
            knight: "N",
            pawn: ""
        };

        return (
            letters[type] || ""
        );
    }

    function drawLastMoveArrow() {
        if (!lastMove) {
            return;
        }

        const svgNamespace =
            "http://www.w3.org/2000/svg";

        const svg =
            document.createElementNS(
                svgNamespace,
                "svg"
            );

        svg.classList.add("move-arrow");

        svg.setAttribute(
            "viewBox",
            "0 0 800 800"
        );

        svg.setAttribute(
            "preserveAspectRatio",
            "none"
        );

        /*
        Each chess square is represented
        as 100 x 100 inside the SVG.
        */

        const startX =
            lastMove.fromColumn * 100 + 50;

        const startY =
            lastMove.fromRow * 100 + 50;

        const targetX =
            lastMove.toColumn * 100 + 50;

        const targetY =
            lastMove.toRow * 100 + 50;


        /*
        Calculate direction.
        */

        const deltaX =
            targetX - startX;

        const deltaY =
            targetY - startY;

        const distance =
            Math.sqrt(
                deltaX * deltaX +
                deltaY * deltaY
            );

        if (distance === 0) {
            return;
        }

        const unitX =
            deltaX / distance;

        const unitY =
            deltaY / distance;


        /*
        Shorten arrow so the arrowhead
        finishes nicely inside the square.
        */

        const endX =
            targetX - unitX * 28;

        const endY =
            targetY - unitY * 28;


        /*
        Arrow line.
        */

        const line =
            document.createElementNS(
                svgNamespace,
                "line"
            );

        line.setAttribute("x1", startX);
        line.setAttribute("y1", startY);

        line.setAttribute("x2", endX);
        line.setAttribute("y2", endY);

        line.classList.add(
            "move-arrow-line"
        );


        /*
        Arrow head.
        */

        const arrowLength = 34;
        const arrowWidth = 25;

        const tipX = targetX;
        const tipY = targetY;

        const baseX =
            targetX -
            unitX * arrowLength;

        const baseY =
            targetY -
            unitY * arrowLength;

        const perpendicularX =
            -unitY;

        const perpendicularY =
            unitX;

        const leftX =
            baseX +
            perpendicularX *
            arrowWidth;

        const leftY =
            baseY +
            perpendicularY *
            arrowWidth;

        const rightX =
            baseX -
            perpendicularX *
            arrowWidth;

        const rightY =
            baseY -
            perpendicularY *
            arrowWidth;

        const arrowHead =
            document.createElementNS(
                svgNamespace,
                "polygon"
            );

        arrowHead.setAttribute(
            "points",
            `${tipX},${tipY} ` +
            `${leftX},${leftY} ` +
            `${rightX},${rightY}`
        );

        arrowHead.classList.add(
            "move-arrow-head"
        );


        svg.appendChild(line);
        svg.appendChild(arrowHead);

        chessboard.appendChild(svg);
    }


    function createMoveNotation({
        originalPieceType,
        fromRow,
        fromColumn,
        move,
        capturedPiece,
        promotionPiece
    }) {
        /*
        Castling.
        */

        if (
            move.special ===
                "castle"
        ) {
            if (move.column === 6) {
                return "O-O";
            }

            return "O-O-O";
        }


        const destination =
            getSquareName(
                move.row,
                move.column
            );

        const isCapture =
            Boolean(
                capturedPiece
            ) ||
            move.special ===
                "enPassant";


        /*
        Pawn notation.
        */

        if (
            originalPieceType ===
                "pawn"
        ) {
            let notation = "";

            if (isCapture) {
                const fromFile =
                    getSquareName(
                        fromRow,
                        fromColumn
                    )[0];

                notation +=
                    `${fromFile}x`;
            }

            notation += destination;

            if (promotionPiece) {
                notation +=
                    "=" +
                    getPieceLetter(
                        promotionPiece
                    );
            }

            return notation;
        }


        /*
        Other pieces.
        */

        const pieceLetter =
            getPieceLetter(
                originalPieceType
            );

        return (
            pieceLetter +
            (isCapture ? "x" : "") +
            destination
        );
    }


    /*
    ============================================================
    MOVE HISTORY
    ============================================================
    */

    function addMoveToHistory(
        color,
        notation
    ) {
        if (color === "white") {
            moveHistory.push({
                moveNumber:
                    fullMoveNumber,

                white:
                    notation,

                black:
                    ""
            });

            return;
        }


        /*
        Black move.
        */

        let lastEntry =
            moveHistory[
                moveHistory.length - 1
            ];

        if (!lastEntry) {
            lastEntry = {
                moveNumber:
                    fullMoveNumber,

                white:
                    "",

                black:
                    notation
            };

            moveHistory.push(
                lastEntry
            );
        } else {
            lastEntry.black =
                notation;
        }

        fullMoveNumber++;
    }


    function renderMoveHistory() {
        moveHistoryContainer.innerHTML =
            "";

        if (
            moveHistory.length === 0
        ) {
            const empty =
                document.createElement("p");

            empty.classList.add(
                "move-history-empty"
            );

            empty.textContent =
                "No moves yet.";

            moveHistoryContainer.appendChild(
                empty
            );

            return;
        }


        moveHistory.forEach(move => {
            const row =
                document.createElement(
                    "div"
                );

            row.classList.add(
                "move-row"
            );


            const number =
                document.createElement(
                    "div"
                );

            number.classList.add(
                "move-number"
            );

            number.textContent =
                `${move.moveNumber}.`;


            const white =
                document.createElement(
                    "div"
                );

            white.classList.add(
                "move-cell"
            );

            white.textContent =
                move.white || "";


            const black =
                document.createElement(
                    "div"
                );

            black.classList.add(
                "move-cell"
            );

            black.textContent =
                move.black || "";


            row.appendChild(number);
            row.appendChild(white);
            row.appendChild(black);

            moveHistoryContainer.appendChild(
                row
            );
        });


        /*
        Scroll to latest move.
        */

        moveHistoryContainer.scrollTop =
            moveHistoryContainer.scrollHeight;
    }


    /*
    ============================================================
    CAPTURED PIECES
    ============================================================
    */

    function renderCapturedPieces() {
        capturedWhiteContainer.innerHTML =
            "";

        capturedBlackContainer.innerHTML =
            "";


        capturedWhitePieces.forEach(
            piece => {
                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    getPieceImagePath(
                        piece
                    );

                image.alt =
                    `Captured white ${piece.type}`;

                image.classList.add(
                    "captured-piece"
                );

                capturedWhiteContainer.appendChild(
                    image
                );
            }
        );


        capturedBlackPieces.forEach(
            piece => {
                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    getPieceImagePath(
                        piece
                    );

                image.alt =
                    `Captured black ${piece.type}`;

                image.classList.add(
                    "captured-piece"
                );

                capturedBlackContainer.appendChild(
                    image
                );
            }
        );
    }


    /*
    ============================================================
    CHECKMATE / STALEMATE / DRAWS
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
        50 move rule.
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

        const repetitions =
            positionHistory.get(
                positionKey
            ) || 0;

        if (
            repetitions >= 3
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


        /*
        Check.
        */

        if (inCheck) {
            turnDisplay.textContent =
                `${capitalize(currentTurn)} — Check`;

            return;
        }

        updateTurnDisplay();
    }


    /*
    ============================================================
    DOES PLAYER HAVE A LEGAL MOVE?
    ============================================================
    */

    function playerHasLegalMove(
        color
    ) {
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
                    board[
                        row
                    ][
                        column
                    ];

                if (
                    !piece ||
                    piece.color !== color
                ) {
                    continue;
                }

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

        const previousCount =
            positionHistory.get(
                key
            ) || 0;

        positionHistory.set(
            key,
            previousCount + 1
        );
    }


    function getPositionKey() {
        const pieceCodes = {
            white: {
                king: "K",
                queen: "Q",
                rook: "R",
                bishop: "B",
                knight: "N",
                pawn: "P"
            },

            black: {
                king: "k",
                queen: "q",
                rook: "r",
                bishop: "b",
                knight: "n",
                pawn: "p"
            }
        };

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
                    board[
                        row
                    ][
                        column
                    ];

                if (!piece) {
                    key += "-";
                } else {
                    key +=
                        pieceCodes[
                            piece.color
                        ][
                            piece.type
                        ];
                }
            }
        }

        key +=
            `|${currentTurn}`;

        key +=
            `|${getCastlingRights()}`;


        if (enPassantTarget) {
            key +=
                `|${enPassantTarget.row},` +
                `${enPassantTarget.column}`;
        } else {
            key += "|-";
        }

        return key;
    }


    /*
    ============================================================
    CASTLING RIGHTS
    ============================================================
    */

    function getCastlingRights() {
        let rights = "";


        /*
        White.
        */

        const whiteKing =
            board[7][4];

        if (
            whiteKing &&
            whiteKing.type === "king" &&
            whiteKing.color === "white" &&
            !whiteKing.hasMoved
        ) {
            const kingRook =
                board[7][7];

            const queenRook =
                board[7][0];

            if (
                kingRook &&
                kingRook.type === "rook" &&
                kingRook.color === "white" &&
                !kingRook.hasMoved
            ) {
                rights += "K";
            }

            if (
                queenRook &&
                queenRook.type === "rook" &&
                queenRook.color === "white" &&
                !queenRook.hasMoved
            ) {
                rights += "Q";
            }
        }


        /*
        Black.
        */

        const blackKing =
            board[0][4];

        if (
            blackKing &&
            blackKing.type === "king" &&
            blackKing.color === "black" &&
            !blackKing.hasMoved
        ) {
            const kingRook =
                board[0][7];

            const queenRook =
                board[0][0];

            if (
                kingRook &&
                kingRook.type === "rook" &&
                kingRook.color === "black" &&
                !kingRook.hasMoved
            ) {
                rights += "k";
            }

            if (
                queenRook &&
                queenRook.type === "rook" &&
                queenRook.color === "black" &&
                !queenRook.hasMoved
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
        const remainingPieces = [];

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
                    board[
                        row
                    ][
                        column
                    ];

                if (
                    piece &&
                    piece.type !== "king"
                ) {
                    remainingPieces.push({
                        type:
                            piece.type,

                        color:
                            piece.color,

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
            remainingPieces.length === 0
        ) {
            return true;
        }


        /*
        King + Bishop vs King
        King + Knight vs King
        */

        if (
            remainingPieces.length === 1
        ) {
            const type =
                remainingPieces[0].type;

            return (
                type === "bishop" ||
                type === "knight"
            );
        }


        /*
        King + Bishop vs
        King + Bishop where bishops
        are on same colored squares.
        */

        if (
            remainingPieces.length === 2 &&
            remainingPieces.every(
                piece =>
                    piece.type ===
                        "bishop"
            )
        ) {
            const bishopA =
                remainingPieces[0];

            const bishopB =
                remainingPieces[1];

            const colorA =
                (
                    bishopA.row +
                    bishopA.column
                ) % 2;

            const colorB =
                (
                    bishopB.row +
                    bishopB.column
                ) % 2;

            if (
                colorA === colorB
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
        return boardState.map(
            row =>
                row.map(
                    piece =>
                        piece
                            ? {
                                ...piece
                            }
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


    function oppositeColor(
        color
    ) {
        return (
            color === "white"
                ? "black"
                : "white"
        );
    }


    function capitalize(
        value
    ) {
        return (
            value
                .charAt(0)
                .toUpperCase() +
            value.slice(1)
        );
    }


    function updateTurnDisplay() {
        turnDisplay.textContent =
            capitalize(
                currentTurn
            );
    }


    /*
============================================================
DRAW
============================================================
*/

function offerDraw() {
    if (gameOver) {
        return;
    }

    const offeringPlayer =
        currentTurn;

    const opponent =
        oppositeColor(
            offeringPlayer
        );

    const accepted =
        window.confirm(
            `${capitalize(offeringPlayer)} offers a draw.\n\n` +
            `Does ${capitalize(opponent)} accept?`
        );

    if (!accepted) {
        return;
    }

    gameOver = true;

    selectedSquare = null;

    turnDisplay.textContent =
        "Draw by agreement";

    createBoard();
}


/*
============================================================
RESIGN
============================================================
*/

function resignGame() {
    if (gameOver) {
        return;
    }

    const resigningPlayer =
        currentTurn;

    const winner =
        oppositeColor(
            resigningPlayer
        );

    const confirmed =
        window.confirm(
            `${capitalize(resigningPlayer)}, ` +
            `are you sure you want to resign?`
        );

    if (!confirmed) {
        return;
    }

    gameOver = true;

    selectedSquare = null;

    turnDisplay.textContent =
        `${capitalize(winner)} wins — ` +
        `${capitalize(resigningPlayer)} resigned`;

    createBoard();
}


/*
============================================================
NEW GAME
============================================================
*/

function startNewGame() {
    /*
    Ask before deleting an active game.
    */

    if (
        !gameOver &&
        moveHistory.length > 0
    ) {
        const confirmed =
            window.confirm(
                "Start a new game? " +
                "The current game will be lost."
            );

        if (!confirmed) {
            return;
        }
    }


    /*
    Reset board.
    */

    board =
        createInitialBoard();


    /*
    Reset game state.
    */

    currentTurn =
        "white";

    selectedSquare =
        null;

    enPassantTarget =
        null;

    halfMoveClock =
        0;

    gameOver =
        false;

    lastMove =
        null;


    /*
    Reset captured pieces.
    */

    capturedWhitePieces =
        [];

    capturedBlackPieces =
        [];


    /*
    Reset move history.
    */

    moveHistory =
        [];

    fullMoveNumber =
        1;


    /*
    Reset repetition history.
    */

    positionHistory.clear();

    recordPosition();


    /*
    Refresh interface.
    */

    updateTurnDisplay();

    renderCapturedPieces();

    renderMoveHistory();

    createBoard();
}


/*
============================================================
GAME BUTTON EVENTS
============================================================
*/

drawButton.addEventListener(
    "click",
    offerDraw
);

resignButton.addEventListener(
    "click",
    resignGame
);

newGameButton.addEventListener(
    "click",
    startNewGame
);



    /*
    ============================================================
    START GAME
    ============================================================
    */

    recordPosition();

    updateTurnDisplay();

    renderCapturedPieces();

    renderMoveHistory();

    createBoard();
});
