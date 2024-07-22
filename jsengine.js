let moveN = 1;
let isWhiteTurn = true;
const bitboards = {
    whitePawns: 0x000000000000FF00n,
    whiteKnights: 0x0000000000000042n,
    whiteBishops: 0x0000000000000024n,
    whiteRooks: 0x0000000000000081n,
    whiteQueens: 0x0000000000000008n,
    whiteKing: 0x0000000000000010n,
    blackPawns: 0x00FF000000000000n,
    blackKnights: 0x4200000000000000n,
    blackBishops: 0x2400000000000000n,
    blackRooks: 0x8100000000000000n,
    blackQueens: 0x0800000000000000n,
    blackKing: 0x1000000000000000n,
};
const pieceSymbols = {
    whitePawns: 'P', whiteKnights: 'N', whiteBishops: 'B', whiteRooks: 'R', whiteQueens: 'Q', whiteKing: 'K',
    blackPawns: 'p', blackKnights: 'n', blackBishops: 'b', blackRooks: 'r', blackQueens: 'q', blackKing: 'k',
};
function initializeBoard() {
    const board = Array.from({ length: 8 }, () => Array(8).fill(' '));
    return board;
}
function setPiecesOnBoard(board, bitboard, pieceSymbol) {
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const bitIndex = rank * 8 + file;
            const bit = (bitboard >> BigInt(bitIndex)) & 1n;
            if (bit === 1n) {
                board[7 - rank][file] = pieceSymbol; // Note: 7 - rank to flip the board correctly
            }
        }
    }
}

function mergeBitboardsIntoBoard(bitboards) {
    const board = initializeBoard();

    setPiecesOnBoard(board, bitboards.whitePawns, pieceSymbols.whitePawns);
    setPiecesOnBoard(board, bitboards.whiteKnights, pieceSymbols.whiteKnights);
    setPiecesOnBoard(board, bitboards.whiteBishops, pieceSymbols.whiteBishops);
    setPiecesOnBoard(board, bitboards.whiteRooks, pieceSymbols.whiteRooks);
    setPiecesOnBoard(board, bitboards.whiteQueens, pieceSymbols.whiteQueens);
    setPiecesOnBoard(board, bitboards.whiteKing, pieceSymbols.whiteKing);
    setPiecesOnBoard(board, bitboards.blackPawns, pieceSymbols.blackPawns);
    setPiecesOnBoard(board, bitboards.blackKnights, pieceSymbols.blackKnights);
    setPiecesOnBoard(board, bitboards.blackBishops, pieceSymbols.blackBishops);
    setPiecesOnBoard(board, bitboards.blackRooks, pieceSymbols.blackRooks);
    setPiecesOnBoard(board, bitboards.blackQueens, pieceSymbols.blackQueens);
    setPiecesOnBoard(board, bitboards.blackKing, pieceSymbols.blackKing);
    return board;
}
function setclearPiece(bitboard, square, setclear) {
    switch (setclear){
        case 'set':
            return bitboard | (1n << BigInt(square));
        case 'clear':
            return bitboard & ~(1n << BigInt(square));
        default:
            console.error('Invalid state.')
    }
}
function uciToIndex(square) {
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = square.charCodeAt(1) - '1'.charCodeAt(0);
    return rank * 8 + file;
}
function movePieceUCI(bitboards, pieceType, uciMove) {
    const fromSquare = uciToIndex(uciMove.slice(0, 2));
    const toSquare = uciToIndex(uciMove.slice(2, 4));
    bitboards[pieceType] = setclearPiece(bitboards[pieceType], fromSquare, 'clear');
    bitboards[pieceType] = setclearPiece(bitboards[pieceType], toSquare, 'set');
}
function submitMove() {
    const uciMove = document.getElementById('uciMove').value;
    const pieceType = getPieceType(uciMove.slice(0, 2));
    if (pieceType) {
        movePieceUCI(bitboards, pieceType, uciMove);
        const chessBoard = mergeBitboardsIntoBoard(bitboards);
        displayBoard(chessBoard);
        const currentFEN = generateFEN();
        displayFEN(currentFEN);
        moveN += 1;
    } else {
        console.error('Invalid move');
    }
}
function getPieceType(fromSquare) {
    const index = uciToIndex(fromSquare);
    for (const [pieceType, bitboard] of Object.entries(bitboards)) {
        if (((bitboard >> BigInt(index)) & 1n) === 1n) {
            return pieceType;
        }
    }
    return null;
}
function displayBoard(board) {
    const chessboardElement = document.getElementById('chessboard');
    chessboardElement.innerHTML = '';
    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
            const squareElement = document.createElement('div');
            squareElement.classList.add('square');
            squareElement.classList.add((rank + file) % 2 === 0 ? 'white' : 'black');
            squareElement.textContent = board[rank][file];
            chessboardElement.appendChild(squareElement);
        }
    }
}
function mergeBitboardsIntoBoard(bitboards) {
    const board = Array.from({ length: 8 }, () => Array(8).fill(' '));
    for (const [pieceType, bitboard] of Object.entries(bitboards)) {
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const bitIndex = rank * 8 + file;
                const bit = (bitboard >> BigInt(bitIndex)) & 1n;
                if (bit === 1n) {
                    board[rank][file] = pieceSymbols[pieceType];
                }
            }
        }
    }
    return board;
}
function generateFEN() {
    let fen = '';
    for (let rank = 7; rank >= 0; rank--) {
        let emptySquares = 0;
        for (let file = 0; file < 8; file++) {
            const square = BigInt(rank * 8 + file);
            let pieceFound = false;
            for (const [pieceType, bitboard] of Object.entries(bitboards)) {
                if ((bitboard & (1n << square)) !== 0n) {
                    if (emptySquares > 0) {
                        fen += emptySquares;
                        emptySquares = 0;
                    }
                    fen += pieceSymbols[pieceType];
                    pieceFound = true;
                    break;
                }
            }  
            if (!pieceFound) {
                emptySquares++;
            }
        }
        if (emptySquares > 0) {
            fen += emptySquares;
        }
        if (rank > 0) {
            fen += '/';
        }
    }
    fen += ` w KQkq - 0 ${Math.floor((moveN + 1) / 2)}`; //placeholder, will fix this later
    return fen;
}
function displayFEN(fen) {
    const fenDisplay = document.getElementById('fenDisplay');
    if (fenDisplay) {
        fenDisplay.textContent = `Move ${moveN} (${isWhiteTurn ? 'White' : 'Black'} to move): ${fen}`;
    } else {
        console.log(`Move ${moveN} (${isWhiteTurn ? 'White' : 'Black'} to move) - Current FEN:`, fen);
    }
}
const initialBoard = mergeBitboardsIntoBoard(bitboards);
displayBoard(initialBoard);
const initialFEN = generateFEN();
displayFEN(initialFEN);