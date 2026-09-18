/*
============================================================
AZACHESS TEACHER EXPLANATIONS
============================================================

This file contains the chess teacher's explanation logic.

It explains concepts such as:

- development
- center control
- attacks
- defense
- king safety
- pawn structure
- tactics
- strategy
- special moves

============================================================
*/


/*
============================================================
GET CHESS API
============================================================

Do NOT destructure AzaChessTeacherAPI when this file loads.

chess.js creates the API inside DOMContentLoaded, so we get the
API only when an explanation is actually requested.
*/

function getAzaChessTeacherAPI() {
    const api =
        window.AzaChessTeacherAPI;

    if (!api) {
        console.error(
            "AzaChessTeacherAPI is not available."
        );

        return null;
    }

    return api;
}


/*
============================================================
TEACHER EXPLANATION MODULES
============================================================
*/


/*
============================================================
DEVELOPMENT
============================================================
*/

function getTeacherDevelopmentReasons(context) {
    const reasons = [];

    const {
        piece,
        fromRow
    } = context;

    if (
        piece.type === "knight" ||
        piece.type === "bishop"
    ) {
        const startingRow =
            piece.color === "white"
                ? 7
                : 0;

        if (fromRow === startingRow) {
            reasons.push(
                `develops the ${piece.type}`
            );
        }
    }

    return reasons;
}


/*
============================================================
CENTRE
============================================================
*/

function getTeacherCenterReasons(context) {
    const reasons = [];

    const {
        piece,
        toColumn,
        destination,
        controlledEmptySquares = []
    } = context;

    const centralSquares = [
        "d4",
        "e4",
        "d5",
        "e5"
    ];


    /*
    Moving directly into the centre.
    */

    if (
        centralSquares.includes(
            destination
        )
    ) {
        reasons.push(
            "fights for the centre"
        );
    }


    /*
    Central pawn development.
    */

    if (
        piece.type === "pawn" &&
        (
            toColumn === 3 ||
            toColumn === 4
        )
    ) {
        if (
            !reasons.includes(
                "fights for the centre"
            )
        ) {
            reasons.push(
                "helps control the centre"
            );
        }
    }


    /*
    Important central squares controlled
    after the move.
    */

    const importantControlledSquares =
        controlledEmptySquares.filter(
            square =>
                centralSquares.includes(
                    square
                )
        );

    if (
        importantControlledSquares.length > 0
    ) {
        reasons.push(
            `controls ` +
            `${importantControlledSquares.join(" and ")}`
        );
    }

    return reasons;
}


/*
============================================================
ATTACKS AND CAPTURES
============================================================
*/

function getTeacherAttackReasons(context) {
    const reasons = [];

    const {
        piece,
        target,
        attackedPieces = [],
        getTeacherPieceName
    } = context;


    /*
    Direct capture.
    */

    if (
        target &&
        target.color !== piece.color
    ) {
        reasons.push(
            `captures the enemy ` +
            `${getTeacherPieceName(target)}`
        );
    }


    /*
    Enemy pieces attacked after the move.
    */

    if (attackedPieces.length > 0) {
        const targetDescriptions =
            attackedPieces.map(
                attackedPiece =>
                    `${attackedPiece.name} ` +
                    `on ${attackedPiece.square}`
            );

        if (
            targetDescriptions.length === 1
        ) {
            reasons.push(
                `attacks the enemy ` +
                `${targetDescriptions[0]}`
            );
        } else {
            reasons.push(
                `attacks the enemy ` +
                `${targetDescriptions.join(" and ")}`
            );
        }
    }

    return reasons;
}


/*
============================================================
DEFENSE
============================================================
*/

function getTeacherDefenseReasons(context) {
    const reasons = [];

    const {
        defendedPieces = []
    } = context;

    if (defendedPieces.length === 0) {
        return reasons;
    }

    const defendedDescriptions =
        defendedPieces.map(
            target =>
                `${target.name} on ${target.square}`
        );

    if (
        defendedDescriptions.length === 1
    ) {
        reasons.push(
            `defends the ` +
            `${defendedDescriptions[0]}`
        );
    } else {
        reasons.push(
            `defends the ` +
            `${defendedDescriptions.join(" and ")}`
        );
    }

    return reasons;
}


/*
============================================================
KING SAFETY
============================================================
*/

function getTeacherKingSafetyReasons(context) {
    const reasons = [];

    const {
        piece,
        fromRow,
        fromColumn,
        toRow,
        toColumn,
        api
    } = context;

    const {
        cloneBoard,
        canCastle,
        getBoard,
        setBoard
    } = api;


    /*
    Actual castling.
    */

    if (
        piece.type === "king" &&
        Math.abs(
            toColumn - fromColumn
        ) === 2
    ) {
        reasons.push(
            "improves king safety by castling"
        );

        return reasons;
    }


    /*
    Preparing kingside castling.

    Moving the knight from g1/g8 or
    bishop from f1/f8 may clear the
    path between king and rook.
    */

    const startingRow =
        piece.color === "white"
            ? 7
            : 0;

    const movedKingsideKnight =
        piece.type === "knight" &&
        fromRow === startingRow &&
        fromColumn === 6;

    const movedKingsideBishop =
        piece.type === "bishop" &&
        fromRow === startingRow &&
        fromColumn === 5;

    if (
        movedKingsideKnight ||
        movedKingsideBishop
    ) {
        const currentBoard =
            getBoard();

        const castlingBoard =
            cloneBoard(
                currentBoard
            );


        /*
        Apply the proposed move to our
        temporary board.
        */

        castlingBoard[
            toRow
        ][
            toColumn
        ] =
            castlingBoard[
                fromRow
            ][
                fromColumn
            ];

        castlingBoard[
            fromRow
        ][
            fromColumn
        ] = null;


        const king =
            castlingBoard[
                startingRow
            ][4];

        const rook =
            castlingBoard[
                startingRow
            ][7];

        const bishopSquare =
            castlingBoard[
                startingRow
            ][5];

        const knightSquare =
            castlingBoard[
                startingRow
            ][6];


        const kingAndRookCanCastle =
            king &&
            king.type === "king" &&
            king.color === piece.color &&
            !king.hasMoved &&
            rook &&
            rook.type === "rook" &&
            rook.color === piece.color &&
            !rook.hasMoved;

        const castlingPathClear =
            !bishopSquare &&
            !knightSquare;


        if (
            kingAndRookCanCastle &&
            castlingPathClear
        ) {
            const originalBoardForCastling =
                getBoard();

            try {
                /*
                canCastle() uses the real board
                variable inside chess.js.

                Temporarily give it our simulated
                position.
                */

                setBoard(
                    castlingBoard
                );

                const castlingIsLegal =
                    canCastle(
                        piece.color,
                        "kingSide"
                    );

                if (castlingIsLegal) {
                    reasons.push(
                        "makes kingside castling available"
                    );
                } else {
                    reasons.push(
                        "clears the path for kingside castling"
                    );
                }
            } finally {
                /*
                Always restore the real position.
                */

                setBoard(
                    originalBoardForCastling
                );
            }
        } else {
            reasons.push(
                "helps prepare kingside castling"
            );
        }
    }

    return reasons;
}


/*
============================================================
PAWN IDEAS
============================================================
*/

function getTeacherPawnReasons(context) {
    const reasons = [];

    const {
        piece,
        target,
        fromRow,
        fromColumn,
        toRow,
        toColumn,
        destination,
        api
    } = context;

    /*
    Only analyse pawn moves here.
    */

    if (
        !piece ||
        piece.type !== "pawn"
    ) {
        return reasons;
    }

    const board =
        context.temporaryBoard ||
        api.getBoard();

    const color =
        piece.color;

    const enemyColor =
        color === "white"
            ? "black"
            : "white";

    const direction =
        color === "white"
            ? -1
            : 1;

    const startingRow =
        color === "white"
            ? 6
            : 1;

    const promotionRow =
        color === "white"
            ? 0
            : 7;

    const rank =
        8 - toRow;

    const fileLetters =
        [
            "a", "b", "c", "d",
            "e", "f", "g", "h"
        ];


    /*
    ========================================================
    1. PAWN DEVELOPMENT
    ========================================================
    */

    if (
        fromRow === startingRow
    ) {
        reasons.push(
            "develops a pawn from its starting position"
        );
    }


    /*
    ========================================================
    2. TWO-SQUARE OPENING MOVE
    ========================================================
    */

    if (
        fromRow === startingRow &&
        Math.abs(
            toRow - fromRow
        ) === 2
    ) {
        reasons.push(
            "gains space quickly"
        );
    }


    /*
    ========================================================
    3. CENTRAL PAWN
    ========================================================
    */

    if (
        toColumn === 3 ||
        toColumn === 4
    ) {
        reasons.push(
            "strengthens the pawn presence in the centre"
        );
    }


    /*
    ========================================================
    4. PAWN CAPTURE
    ========================================================
    */

    if (
        target &&
        target.color === enemyColor
    ) {
        reasons.push(
            "changes the pawn structure by capturing"
        );
    }


    /*
    ========================================================
    5. SPACE GAIN
    ========================================================
    */

    const advancedEnough =
        color === "white"
            ? toRow <= 3
            : toRow >= 4;

    if (advancedEnough) {
        reasons.push(
            "gains space in the opponent's half"
        );
    }


    /*
    ========================================================
    6. CONNECTED PAWN
    ========================================================

    Look for a friendly pawn on an adjacent file
    close enough to support this pawn.
    */

    let connectedPawn = false;

    for (
        const columnOffset of [-1, 1]
    ) {
        const adjacentColumn =
            toColumn + columnOffset;

        if (
            adjacentColumn < 0 ||
            adjacentColumn > 7
        ) {
            continue;
        }

        for (
            const rowOffset of [-1, 0, 1]
        ) {
            const adjacentRow =
                toRow + rowOffset;

            if (
                adjacentRow < 0 ||
                adjacentRow > 7
            ) {
                continue;
            }

            const nearbyPiece =
                board[
                    adjacentRow
                ][
                    adjacentColumn
                ];

            if (
                nearbyPiece &&
                nearbyPiece.type === "pawn" &&
                nearbyPiece.color === color
            ) {
                connectedPawn = true;
                break;
            }
        }

        if (connectedPawn) {
            break;
        }
    }

    if (connectedPawn) {
        reasons.push(
            "keeps contact with another friendly pawn"
        );
    }


    /*
    ========================================================
    7. PAWN CHAIN
    ========================================================

    A pawn is supported diagonally from behind
    by another friendly pawn.
    */

    const supportingRow =
        toRow - direction;

    let pawnChain = false;

    if (
        supportingRow >= 0 &&
        supportingRow <= 7
    ) {
        for (
            const columnOffset of [-1, 1]
        ) {
            const supportingColumn =
                toColumn + columnOffset;

            if (
                supportingColumn < 0 ||
                supportingColumn > 7
            ) {
                continue;
            }

            const supportingPiece =
                board[
                    supportingRow
                ][
                    supportingColumn
                ];

            if (
                supportingPiece &&
                supportingPiece.type === "pawn" &&
                supportingPiece.color === color
            ) {
                pawnChain = true;
                break;
            }
        }
    }

    if (pawnChain) {
        reasons.push(
            "forms part of a pawn chain"
        );
    }


    /*
    ========================================================
    8. DOUBLED PAWNS
    ========================================================
    */

    let friendlyPawnsOnSameFile = 0;

    for (
        let row = 0;
        row < 8;
        row++
    ) {
        const boardPiece =
            board[row][toColumn];

        if (
            boardPiece &&
            boardPiece.type === "pawn" &&
            boardPiece.color === color
        ) {
            friendlyPawnsOnSameFile++;
        }
    }

    /*
    The board still represents the position before
    the move, so include the moving pawn if needed.
    */

    const pawnAlreadyOnDestinationFile =
        fromColumn === toColumn;

    if (
        !pawnAlreadyOnDestinationFile
    ) {
        friendlyPawnsOnSameFile++;
    }

    if (
        friendlyPawnsOnSameFile > 1
    ) {
        reasons.push(
            "may create doubled pawns on this file"
        );
    }


    /*
    ========================================================
    9. ISOLATED PAWN
    ========================================================

    No friendly pawn exists on either adjacent file.
    */

    let friendlyPawnOnAdjacentFile = false;

    for (
        const columnOffset of [-1, 1]
    ) {
        const adjacentColumn =
            toColumn + columnOffset;

        if (
            adjacentColumn < 0 ||
            adjacentColumn > 7
        ) {
            continue;
        }

        for (
            let row = 0;
            row < 8;
            row++
        ) {
            const boardPiece =
                board[
                    row
                ][
                    adjacentColumn
                ];

            if (
                boardPiece &&
                boardPiece.type === "pawn" &&
                boardPiece.color === color
            ) {
                friendlyPawnOnAdjacentFile =
                    true;

                break;
            }
        }

        if (
            friendlyPawnOnAdjacentFile
        ) {
            break;
        }
    }

    if (
        !friendlyPawnOnAdjacentFile
    ) {
        reasons.push(
            "may become an isolated pawn without a friendly pawn on an adjacent file"
        );
    }


    /*
    ========================================================
    10. PASSED PAWN
    ========================================================

    Search the pawn's file and adjacent files
    ahead of it for enemy pawns.
    */

    let enemyPawnBlockingPassage =
        false;

    for (
        const columnOffset of [-1, 0, 1]
    ) {
        const checkColumn =
            toColumn + columnOffset;

        if (
            checkColumn < 0 ||
            checkColumn > 7
        ) {
            continue;
        }

        let checkRow =
            toRow + direction;

        while (
            checkRow >= 0 &&
            checkRow <= 7
        ) {
            const boardPiece =
                board[
                    checkRow
                ][
                    checkColumn
                ];

            if (
                boardPiece &&
                boardPiece.type === "pawn" &&
                boardPiece.color === enemyColor
            ) {
                enemyPawnBlockingPassage =
                    true;

                break;
            }

            checkRow +=
                direction;
        }

        if (
            enemyPawnBlockingPassage
        ) {
            break;
        }
    }

    if (
        !enemyPawnBlockingPassage
    ) {
        reasons.push(
            "has the characteristics of a passed pawn because no enemy pawn can oppose it on its file or adjacent files"
        );
    }


    /*
    ========================================================
    11. PAWN BREAK
    ========================================================

    Check whether enemy pawns are close to the
    destination square on neighbouring files.
    */

    let challengesEnemyPawn =
        false;

    for (
        const columnOffset of [-1, 1]
    ) {
        const enemyColumn =
            toColumn + columnOffset;

        if (
            enemyColumn < 0 ||
            enemyColumn > 7
        ) {
            continue;
        }

        for (
            const rowOffset of [-1, 0, 1]
        ) {
            const enemyRow =
                toRow + rowOffset;

            if (
                enemyRow < 0 ||
                enemyRow > 7
            ) {
                continue;
            }

            const nearbyPiece =
                board[
                    enemyRow
                ][
                    enemyColumn
                ];

            if (
                nearbyPiece &&
                nearbyPiece.type === "pawn" &&
                nearbyPiece.color === enemyColor
            ) {
                challengesEnemyPawn =
                    true;

                break;
            }
        }

        if (
            challengesEnemyPawn
        ) {
            break;
        }
    }

    if (challengesEnemyPawn) {
        reasons.push(
            "can act as a pawn break against the opponent's pawn structure"
        );
    }


    /*
    ========================================================
    12. OPENING A DIAGONAL / FILE
    ========================================================
    */

    if (
        fromRow === startingRow
    ) {
        if (
            fromColumn === 3 ||
            fromColumn === 4
        ) {
            reasons.push(
                "helps open lines for the bishops and queen"
            );
        } else {
            reasons.push(
                "may open a line for a piece behind the pawn"
            );
        }
    }


    /*
    ========================================================
    13. KING PAWN SHIELD
    ========================================================

    Moving f/g/h pawns or a/b/c pawns can affect
    the king's future shelter.
    */

    const isKingsidePawn =
        fromColumn >= 5;

    const isQueensidePawn =
        fromColumn <= 2;

    if (
        isKingsidePawn ||
        isQueensidePawn
    ) {
        const movedFar =
            Math.abs(
                toRow - fromRow
            ) >= 2;

        if (movedFar) {
            reasons.push(
                "also changes the pawn cover that could protect the king"
            );
        }
    }


    /*
    ========================================================
    14. ADVANCED PAWN
    ========================================================
    */

    const veryAdvanced =
        color === "white"
            ? rank >= 6
            : rank <= 3;

    if (veryAdvanced) {
        reasons.push(
            "creates an advanced pawn that may become dangerous"
        );
    }


    /*
    ========================================================
    15. PROMOTION
    ========================================================
    */

    if (
        toRow === promotionRow
    ) {
        const promotionLetter =
            context.uciMove &&
            context.uciMove.length >= 5
                ? context.uciMove[4]
                : "q";

        const promotionNames = {
            q: "queen",
            r: "rook",
            b: "bishop",
            n: "knight"
        };

        const promotionPiece =
            promotionNames[
                promotionLetter
            ] || "queen";

        reasons.push(
            `promotes the pawn to a ${promotionPiece}`
        );
    }


    /*
    ========================================================
    16. NEAR PROMOTION
    ========================================================
    */

    const oneStepFromPromotion =
        color === "white"
            ? toRow === 1
            : toRow === 6;

    if (
        oneStepFromPromotion
    ) {
        reasons.push(
            "moves the pawn only one step away from promotion"
        );
    }


    /*
    ========================================================
    17. EN PASSANT
    ========================================================

    A diagonal pawn move to an empty destination
    can indicate en passant.

    We describe it cautiously because the complete
    en-passant state remains managed by chess.js.
    */

    if (
        fromColumn !== toColumn &&
        !target
    ) {
        reasons.push(
            "uses a diagonal pawn move that may be an en passant capture"
        );
    }


    /*
    ========================================================
    18. FILE DESCRIPTION
    ========================================================
    */

    const destinationFile =
        fileLetters[toColumn];

    /*
    This gives the teacher useful positional language
    for particularly advanced pawns.
    */

    if (
        veryAdvanced &&
        destinationFile
    ) {
        reasons.push(
            `puts pressure on the ${destinationFile}-file area`
        );
    }


    return reasons;
}


/*
============================================================
TACTICAL IDEAS
============================================================
*/

function getTeacherTacticalReasons(context) {
    const reasons = [];

    const {
        piece,
        target,
        toRow,
        toColumn,
        temporaryBoard,
        attackedPieces = [],
        defendedPieces = [],
        api
    } = context;

    if (
        !piece ||
        !temporaryBoard
    ) {
        return reasons;
    }

    const color =
        piece.color;

    const enemyColor =
        color === "white"
            ? "black"
            : "white";

    const pieceValues = {
        pawn: 1,
        knight: 3,
        bishop: 3,
        rook: 5,
        queen: 9,
        king: 100
    };

    const pieceNames = {
        pawn: "pawn",
        knight: "knight",
        bishop: "bishop",
        rook: "rook",
        queen: "queen",
        king: "king"
    };


    /*
    ========================================================
    HELPER — FIND KING
    ========================================================
    */

    function findKing(
        boardState,
        kingColor
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
                const boardPiece =
                    boardState[row][column];

                if (
                    boardPiece &&
                    boardPiece.type === "king" &&
                    boardPiece.color === kingColor
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
    ========================================================
    HELPER — GET CONTROLLED SQUARES
    ========================================================

    getTeacherControlledSquares uses the board stored
    inside chess.js, so temporarily switch it to the
    post-move position.
    */

    function getControlledSquares(
        row,
        column
    ) {
        const originalBoard =
            api.getBoard();

        try {
            api.setBoard(
                temporaryBoard
            );

            return (
                api.getTeacherControlledSquares(
                    row,
                    column
                ) || []
            );
        } finally {
            api.setBoard(
                originalBoard
            );
        }
    }


    /*
    ========================================================
    HELPER — PIECE AT SQUARE
    ========================================================
    */

    function getPieceAt(square) {
        if (!square) {
            return null;
        }

        return temporaryBoard[
            square.row
        ][
            square.column
        ];
    }


    /*
    ========================================================
    HELPER — SQUARE NAME
    ========================================================
    */

    function squareName(
        row,
        column
    ) {
        if (
            api.getSquareName
        ) {
            return api.getSquareName(
                row,
                column
            );
        }

        const files =
            [
                "a", "b", "c", "d",
                "e", "f", "g", "h"
            ];

        return (
            files[column] +
            (8 - row)
        );
    }


    /*
    ========================================================
    1. CHECK
    ========================================================
    */

    const enemyKing =
        findKing(
            temporaryBoard,
            enemyColor
        );

    const controlledSquares =
        getControlledSquares(
            toRow,
            toColumn
        );

    let givesCheck = false;

    if (enemyKing) {
        givesCheck =
            controlledSquares.some(
                square =>
                    square.row ===
                        enemyKing.row &&
                    square.column ===
                        enemyKing.column
            );
    }

    if (givesCheck) {
        reasons.push(
            "gives check to the enemy king"
        );
    }


    /*
    ========================================================
    2. CAPTURE / MATERIAL GAIN
    ========================================================
    */

    if (
        target &&
        target.color === enemyColor
    ) {
        const capturedValue =
            pieceValues[
                target.type
            ] || 0;

        const attackerValue =
            pieceValues[
                piece.type
            ] || 0;

        if (
            capturedValue >
            attackerValue
        ) {
            reasons.push(
                `wins a more valuable ${pieceNames[target.type] || target.type}`
            );
        } else if (
            capturedValue ===
            attackerValue
        ) {
            reasons.push(
                `captures an enemy ${pieceNames[target.type] || target.type}`
            );
        }
    }


    /*
    ========================================================
    3. FORK / DOUBLE ATTACK
    ========================================================

    Count enemy pieces attacked by the moved piece.
    */

    const valuableTargets = [];

    for (
        const square of controlledSquares
    ) {
        const attackedPiece =
            getPieceAt(square);

        if (
            !attackedPiece ||
            attackedPiece.color !== enemyColor
        ) {
            continue;
        }

        valuableTargets.push({
            piece:
                attackedPiece,
            row:
                square.row,
            column:
                square.column
        });
    }

    if (
        valuableTargets.length >= 2
    ) {
            /*
            A real tactical fork should involve at least
            one important target.

            Two attacked pawns, for example, are better
            described simply as multiple attacks.
            */

            const importantTargets =
                valuableTargets.filter(
                    item => {
                        const value =
                            pieceValues[
                                item.piece.type
                            ] || 0;

                        return (
                            value >= 3 ||
                            item.piece.type === "king"
                        );
                    }
                );

            const sortedTargets =
                [...valuableTargets].sort(
                    (a, b) => {
                        const valueA =
                            pieceValues[
                                a.piece.type
                            ] || 0;

                        const valueB =
                            pieceValues[
                                b.piece.type
                            ] || 0;

                        return valueB - valueA;
                    }
                );

            const targetDescription =
                sortedTargets
                    .slice(0, 2)
                    .map(item => {
                        const targetName =
                            pieceNames[
                                item.piece.type
                            ] ||
                            item.piece.type;

                        const targetSquare =
                            squareName(
                                item.row,
                                item.column
                            );

                        return (
                            `${targetName} on ` +
                            `${targetSquare}`
                        );
                    })
                    .join(" and ");

            if (
                importantTargets.length >= 2
            ) {
                reasons.push(
                    `forks the ${targetDescription}`
                );
            } else if (
                importantTargets.length === 1
            ) {
                reasons.push(
                    `creates a double attack on the ${targetDescription}`
                );
            }
        }




    /*
    ========================================================
    5. ATTACK ON A MORE VALUABLE PIECE
    ========================================================
    */

    const movingPieceValue =
        pieceValues[
            piece.type
        ] || 0;

    const higherValueTargets =
        valuableTargets.filter(
            item => {
                const targetValue =
                    pieceValues[
                        item.piece.type
                    ] || 0;

                return (
                    targetValue >
                    movingPieceValue &&
                    item.piece.type !==
                        "king"
                );
            }
        );

    if (
        higherValueTargets.length > 0
    ) {
        const attacked =
            higherValueTargets[0];

        reasons.push(
            `attacks the more valuable ${pieceNames[attacked.piece.type] || attacked.piece.type} on ${squareName(attacked.row, attacked.column)}`
        );
    }


    /*
    ========================================================
    6. HANGING / UNDEFENDED TARGET
    ========================================================

    This is deliberately described cautiously.
    A full exchange calculation will later be handled
    with Stockfish.
    */

    for (
        const attacked of valuableTargets
    ) {
        if (
            attacked.piece.type ===
            "king"
        ) {
            continue;
        }

        const targetValue =
            pieceValues[
                attacked.piece.type
            ] || 0;

        if (
            targetValue >= 3
        ) {
            reasons.push(
                `puts tactical pressure on the ${pieceNames[attacked.piece.type] || attacked.piece.type} on ${squareName(attacked.row, attacked.column)}`
            );

            break;
        }
    }


    /*
    ========================================================
    7. PIN DETECTION
    ========================================================

    Pins are relevant mainly for bishops, rooks and queens.
    Look beyond an attacked enemy piece to see whether the
    enemy king lies directly behind it.
    */

    if (
        piece.type === "bishop" ||
        piece.type === "rook" ||
        piece.type === "queen"
    ) {
        const directions = [];

        if (
            piece.type === "bishop" ||
            piece.type === "queen"
        ) {
            directions.push(
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            );
        }

        if (
            piece.type === "rook" ||
            piece.type === "queen"
        ) {
            directions.push(
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            );
        }

        for (
            const [
                rowDirection,
                columnDirection
            ] of directions
        ) {
            let row =
                toRow +
                rowDirection;

            let column =
                toColumn +
                columnDirection;

            let firstEnemyPiece =
                null;

            while (
                row >= 0 &&
                row < 8 &&
                column >= 0 &&
                column < 8
            ) {
                const boardPiece =
                    temporaryBoard[
                        row
                    ][
                        column
                    ];

                if (boardPiece) {
                    if (
                        !firstEnemyPiece
                    ) {
                        if (
                            boardPiece.color ===
                            enemyColor
                        ) {
                            firstEnemyPiece = {
                                piece:
                                    boardPiece,
                                row,
                                column
                            };
                        } else {
                            break;
                        }
                    } else {
                        if (
                            boardPiece.color ===
                                enemyColor &&
                            boardPiece.type ===
                                "king"
                        ) {
                            if (
                                firstEnemyPiece
                                    .piece
                                    .type !==
                                "king"
                            ) {
                                reasons.push(
                                    `pins the ${pieceNames[firstEnemyPiece.piece.type] || firstEnemyPiece.piece.type} on ${squareName(firstEnemyPiece.row, firstEnemyPiece.column)} to the king`
                                );
                            }
                        }

                        break;
                    }
                }

                row +=
                    rowDirection;

                column +=
                    columnDirection;
            }
        }
    }


    /*
    ========================================================
    8. SKEWER DETECTION
    ========================================================

    Look for a high-value enemy piece first and a second
    enemy piece behind it on the same line.
    */

    if (
        piece.type === "bishop" ||
        piece.type === "rook" ||
        piece.type === "queen"
    ) {
        const directions = [];

        if (
            piece.type === "bishop" ||
            piece.type === "queen"
        ) {
            directions.push(
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            );
        }

        if (
            piece.type === "rook" ||
            piece.type === "queen"
        ) {
            directions.push(
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            );
        }

        for (
            const [
                rowDirection,
                columnDirection
            ] of directions
        ) {
            let row =
                toRow +
                rowDirection;

            let column =
                toColumn +
                columnDirection;

            const enemyPiecesOnLine =
                [];

            while (
                row >= 0 &&
                row < 8 &&
                column >= 0 &&
                column < 8
            ) {
                const boardPiece =
                    temporaryBoard[
                        row
                    ][
                        column
                    ];

                if (boardPiece) {
                    if (
                        boardPiece.color ===
                        enemyColor
                    ) {
                        enemyPiecesOnLine.push({
                            piece:
                                boardPiece,
                            row,
                            column
                        });

                        if (
                            enemyPiecesOnLine
                                .length === 2
                        ) {
                            break;
                        }
                    } else {
                        break;
                    }
                }

                row +=
                    rowDirection;

                column +=
                    columnDirection;
            }

            if (
                enemyPiecesOnLine.length ===
                2
            ) {
                const first =
                    enemyPiecesOnLine[0];

                const second =
                    enemyPiecesOnLine[1];

                const firstValue =
                    pieceValues[
                        first.piece.type
                    ] || 0;

                const secondValue =
                    pieceValues[
                        second.piece.type
                    ] || 0;

                if (
                    firstValue >
                    secondValue
                ) {
                    reasons.push(
                        `creates a skewer against the ${pieceNames[first.piece.type] || first.piece.type}`
                    );
                }
            }
        }
    }


    /*
    ========================================================
    9. DISCOVERED ATTACK
    ========================================================

    We keep this conservative for now. If the moved piece
    attacks several targets while also exposing a line,
    describe the tactical activity without claiming a
    discovered attack unless we can prove it later.
    */

    if (
        valuableTargets.length >= 2 &&
        (
            piece.type === "knight" ||
            piece.type === "pawn"
        )
    ) {
        reasons.push(
            "creates several tactical threats at the same time"
        );
    }


    /*
    ========================================================
    10. DEFENDED ATTACKER
    ========================================================
    */

    if (
        defendedPieces.length > 0 &&
        valuableTargets.length > 0
    ) {
        reasons.push(
            "combines an attack with support from the rest of the position"
        );
    }


    /*
    ========================================================
    11. MATE PRESSURE
    ========================================================

    Exact checkmate detection should eventually use the
    legal-move system or Stockfish. For now we only describe
    pressure when the move gives check and attacks squares
    around the enemy king.
    */

    if (
        givesCheck &&
        enemyKing
    ) {
        let kingAreaSquares =
            0;

        for (
            const square of controlledSquares
        ) {
            const rowDistance =
                Math.abs(
                    square.row -
                    enemyKing.row
                );

            const columnDistance =
                Math.abs(
                    square.column -
                    enemyKing.column
                );

            if (
                rowDistance <= 1 &&
                columnDistance <= 1
            ) {
                kingAreaSquares++;
            }
        }

        if (
            kingAreaSquares >= 2
        ) {
            reasons.push(
                "increases tactical pressure around the enemy king"
            );
        }
    }


    /*
    ========================================================
    12. PROMOTION TACTIC
    ========================================================
    */

    if (
        piece.type === "pawn"
    ) {
        const promotionRow =
            color === "white"
                ? 0
                : 7;

        const oneStepAway =
            color === "white"
                ? toRow === 1
                : toRow === 6;

        if (
            toRow === promotionRow
        ) {
            reasons.push(
                "uses promotion as a tactical resource"
            );
        } else if (
            oneStepAway
        ) {
            reasons.push(
                "creates the tactical threat of promotion"
            );
        }
    }


    return [
        ...new Set(reasons)
    ];
}

/*
============================================================
SPECIAL MOVES
============================================================
*/

function getTeacherSpecialMoveReasons(context) {
    const reasons = [];

    /*
    Promotion
    en passant
    and other special-move explanations
    will be added here.
    */

    return reasons;
}

/*
============================================================
EXPLANATION PRIORITY
============================================================
*/

function prioritizeTeacherReasons(groups) {
    const selected = [];
    const used = new Set();

    function add(reason) {
        if (!reason) {
            return;
        }

        const normalized =
            reason
                .toLowerCase()
                .trim();

        /*
        Avoid exact duplicates.
        */

        if (used.has(normalized)) {
            return;
        }

        /*
        Avoid several descriptions of the same
        tactical attack.
        */

        if (
            selected.some(existing =>
                existing.includes(
                    "double attack"
                )
            ) &&
            (
                normalized.includes(
                    "tactical pressure"
                ) ||
                normalized.includes(
                    "several tactical threats"
                )
            )
        ) {
            return;
        }

        if (
            normalized.includes(
                "double attack"
            )
        ) {
            /*
            Remove weaker generic attack descriptions.
            */

            for (
                let index =
                    selected.length - 1;
                index >= 0;
                index--
            ) {
                if (
                    selected[index].includes(
                        "tactical pressure"
                    ) ||
                    selected[index].includes(
                        "several tactical threats"
                    )
                ) {
                    selected.splice(
                        index,
                        1
                    );
                }
            }
        }

        used.add(normalized);

        selected.push(
            normalized
        );
    }


    /*
    Priority:
    tactical ideas first.
    */

    /*
    Major tactical ideas deserve highest priority.
    Generic tactical comments do not.
    */

    const majorTacticalReasons =
        (groups.tactical || []).filter(
            reason => {
                const text =
                    reason.toLowerCase();

                return (
                    text.includes("check") ||
                    text.includes("fork") ||
                    text.includes("double attack") ||
                    text.includes("pin") ||
                    text.includes("skewer") ||
                    text.includes("wins") ||
                    text.includes("promotion")
                );
            }
        );


    const minorTacticalReasons =
        (groups.tactical || []).filter(
            reason =>
                !majorTacticalReasons.includes(
                    reason
                )
        );


        /*
    If a major tactical explanation already describes
    a fork/double attack, do not repeat the complete
    list of attacked pieces.
    */

    const hasMajorMultipleAttack =
        majorTacticalReasons.some(
            reason => {
                const text =
                    reason.toLowerCase();

                return (
                    text.includes("double attack") ||
                    text.includes("fork")
                );
            }
        );

    const filteredAttackReasons =
        hasMajorMultipleAttack
            ? (groups.attack || []).filter(
                reason =>
                    !reason
                        .toLowerCase()
                        .includes(
                            "attacks the enemy"
                        )
            )
            : groups.attack;

    const priorityOrder = [
        majorTacticalReasons,
        filteredAttackReasons,
        groups.special,
        groups.development,
        groups.kingSafety,
        groups.center,
        groups.defense,
        groups.pawn,
        minorTacticalReasons
    ];

    for (
        const group of priorityOrder
    ) {
        if (
            !Array.isArray(group)
        ) {
            continue;
        }

        for (
            const reason of group
        ) {
            add(reason);

            /*
            Maximum three main teaching points.
            */

            if (
                selected.length >= 3
            ) {
                return selected;
            }
        }
    }

    return selected;
}

/*
============================================================
GENERATE TEACHER EXPLANATION
============================================================
*/

function generateTeacherExplanation(
    uciMove
) {
    const api =
        getAzaChessTeacherAPI();

    if (!api) {
        return "Let's examine this move.";
    }


    /*
    Get only the chess functionality
    needed by the explanation system.
    */

    const {
        teacherUciToCoordinates,
        getTeacherPieceName,
        getSquareName,
        cloneBoard,
        getTeacherControlledSquares,
        getBoard,
        setBoard
    } = api;


    const coordinates =
        teacherUciToCoordinates(
            uciMove
        );

    if (!coordinates) {
        return "Let's examine this move.";
    }


    const {
        fromRow,
        fromColumn,
        toRow,
        toColumn
    } = coordinates;


    /*
    Get the real current position.
    */

    const board =
        getBoard();

    const piece =
        board[
            fromRow
        ][
            fromColumn
        ];

    if (!piece) {
        return "Let's examine this move.";
    }


    const target =
        board[
            toRow
        ][
            toColumn
        ];

    const pieceName =
        getTeacherPieceName(
            piece
        );

    const destination =
        getSquareName(
            toRow,
            toColumn
        );

    const reasons = [];


    /*
    ========================================================
    CREATE TEMPORARY POSITION AFTER THE MOVE
    ========================================================
    */

    const temporaryBoard =
        cloneBoard(
            board
        );

    temporaryBoard[
        toRow
    ][
        toColumn
    ] =
        temporaryBoard[
            fromRow
        ][
            fromColumn
        ];

    temporaryBoard[
        fromRow
    ][
        fromColumn
    ] = null;


    /*
    ========================================================
    FIND SQUARES CONTROLLED AFTER THE MOVE
    ========================================================

    getTeacherControlledSquares() reads the internal
    chess.js board.

    Temporarily replace the board, calculate the
    controlled squares, then restore it.
    */

    const originalBoard =
        getBoard();

    let controlledSquares = [];

    try {
        setBoard(
            temporaryBoard
        );

        controlledSquares =
            getTeacherControlledSquares(
                toRow,
                toColumn
            );
    } finally {
        setBoard(
            originalBoard
        );
    }


    /*
    ========================================================
    FIND ATTACKED / DEFENDED PIECES AND EMPTY SQUARES
    ========================================================
    */

    const attackedPieces = [];

    const defendedPieces = [];

    const controlledEmptySquares = [];


    controlledSquares.forEach(
        position => {

            const controlledPiece =
                temporaryBoard[
                    position.row
                ][
                    position.column
                ];

            const controlledSquare =
                getSquareName(
                    position.row,
                    position.column
                );


            /*
            Empty controlled square.
            */

            if (!controlledPiece) {
                controlledEmptySquares.push(
                    controlledSquare
                );

                return;
            }


            /*
            Enemy piece attacked.
            */

            if (
                controlledPiece.color !==
                piece.color
            ) {
                attackedPieces.push({
                    name:
                        getTeacherPieceName(
                            controlledPiece
                        ),

                    square:
                        controlledSquare
                });

                return;
            }


            /*
            Friendly piece defended.
            */

            defendedPieces.push({
                name:
                    getTeacherPieceName(
                        controlledPiece
                    ),

                square:
                    controlledSquare
            });
        }
    );


    /*
    ========================================================
    EXPLANATION CONTEXT
    ========================================================
    */

    const explanationContext = {
        api,
        piece,
        pieceName,
        target,
        fromRow,
        fromColumn,
        toRow,
        toColumn,
        destination,
        uciMove,
        temporaryBoard,
        attackedPieces,
        defendedPieces,
        controlledEmptySquares,
        getTeacherPieceName
    };


   /*
    ============================================================
    COLLECT EXPLANATION REASONS
    ============================================================
    */

    const developmentReasons =
        getTeacherDevelopmentReasons(
            explanationContext
        );

    const centerReasons =
        getTeacherCenterReasons(
            explanationContext
        );

    const attackReasons =
        getTeacherAttackReasons(
            explanationContext
        );

    const defenseReasons =
        getTeacherDefenseReasons(
            explanationContext
        );

    const kingSafetyReasons =
        getTeacherKingSafetyReasons(
            explanationContext
        );

    const pawnReasons =
        getTeacherPawnReasons(
            explanationContext
        );

    const tacticalReasons =
        getTeacherTacticalReasons(
            explanationContext
        );

    const specialMoveReasons =
        getTeacherSpecialMoveReasons(
            explanationContext
        );


    /*
    ============================================================
    SELECT THE MOST IMPORTANT REASONS
    ============================================================
    */

    const selectedReasons =
        prioritizeTeacherReasons({
            tactical:
                tacticalReasons,

            kingSafety:
                kingSafetyReasons,

            attack:
                attackReasons,

            development:
                developmentReasons,

            center:
                centerReasons,

            defense:
                defenseReasons,

            pawn:
                pawnReasons,

            special:
                specialMoveReasons
        });


    /*
    ========================================================
    REMOVE DUPLICATE EXPLANATIONS
    ========================================================
    */

    const uniqueReasons =
        selectedReasons;


    /*
    ========================================================
    BUILD FINAL SENTENCE
    ========================================================
    */

    if (
        uniqueReasons.length === 0
    ) {
        return (
            `The ${pieceName} moves to ` +
            `${destination}. Let's examine ` +
            `how this changes the position.`
        );
    }


    if (
        uniqueReasons.length === 1
    ) {
        return (
            `The ${pieceName} moves to ` +
            `${destination} and ` +
            `${uniqueReasons[0]}.`
        );
    }


    const finalReasons =
        [...uniqueReasons];

    const lastReason =
        finalReasons.pop();

    return (
        `The ${pieceName} moves to ` +
        `${destination}. It ` +
        `${finalReasons.join(", ")} and ` +
        `${lastReason}.`
    );
}


/*
============================================================
PUBLIC EXPLANATION API
============================================================
*/

window.AzaChessTeacherExplanations = {
    generate:
        generateTeacherExplanation
};