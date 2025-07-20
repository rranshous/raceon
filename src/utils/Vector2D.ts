export interface Vector2D {
    x: number;
    y: number;
}

export class Vector2D {
    constructor(public x: number = 0, public y: number = 0) {}

    static create(x: number, y: number): Vector2D {
        return new Vector2D(x, y);
    }

    add(other: Vector2D): Vector2D {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    subtract(other: Vector2D): Vector2D {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    multiply(scalar: number): Vector2D {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize(): Vector2D {
        const len = this.length();
        if (len === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / len, this.y / len);
    }

    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    static fromAngle(angle: number, magnitude: number = 1): Vector2D {
        return new Vector2D(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude
        );
    }
}
