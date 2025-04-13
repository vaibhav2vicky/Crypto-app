class DH {
    // Simplified Diffie-Hellman implementation
    constructor() {
      // In a real app, use much larger prime numbers
      this.p = 23; // Prime number (modulus)
      this.g = 5;  // Base (generator)
      this.privateKey = Math.floor(Math.random() * 10) + 1; // Random private key
    }
  
    getPublicKey() {
      return Math.pow(this.g, this.privateKey) % this.p;
    }
  
    computeSharedSecret(otherPublicKey) {
      return Math.pow(otherPublicKey, this.privateKey) % this.p;
    }
  }
  
  export default DH;