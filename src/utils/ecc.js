// Elliptic Curve Cryptography (ECC) - Point Arithmetic
// Define the secp256k1 curve parameters
const CURVE = {
    P: 2n ** 256n - 0x1000003d1n,  // Field prime
    N: 2n ** 256n - 0x14551231950b75fc4402da1732fc9bebfn, // Group order
    a: 0n,
    b: 7n
};

// Modular arithmetic helper functions
function mod(a, b) {
    return (a % b + b) % b;
}

function modInverse(a, p) {
    let m0 = p, t, q;
    let x0 = 0n, x1 = 1n;
    if (p === 1n) return 0n;
    while (a > 1n) {
        q = a / p;
        t = p, p = a % p, a = t;
        t = x0, x0 = x1 - q * x0, x1 = t;
    }
    return x1 < 0n ? x1 + m0 : x1;
}

// Point Addition on the Elliptic Curve
function addPoints(P1, P2, curve) {
    if (!P1) return P2;
    if (!P2) return P1;
    
    const [x1, y1] = P1, [x2, y2] = P2;
    const { P } = curve;
    
    if (x1 === x2 && y1 === y2) {
        const lam = mod((3n * x1 ** 2n * modInverse(2n * y1, P)), P);
        return computeNewPoint(lam, x1, x2, y1, P);
    } else {
        const lam = mod((y2 - y1) * modInverse(x2 - x1, P), P);
        return computeNewPoint(lam, x1, x2, y1, P);
    }
}

// Compute new point after addition
function computeNewPoint(lam, x1, x2, y1, P) {
    const x3 = mod(lam ** 2n - x1 - x2, P);
    const y3 = mod(lam * (x1 - x3) - y1, P);
    return [x3, y3];
}

// Point Multiplication on the Elliptic Curve
function multiplyPoint(P, n, curve) {
    let R = null;
    let Q = P;
    
    while (n > 0n) {
        if (n & 1n) R = addPoints(R, Q, curve);
        Q = addPoints(Q, Q, curve);
        n >>= 1n;
    }
    
    return R;
}

// Example Usage: Generate Public Key
export function generatePublicKey(privateKey, G, curve) {
    return multiplyPoint(G, privateKey, curve);
}