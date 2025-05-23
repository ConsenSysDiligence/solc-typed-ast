import { fmt, PPIsh } from "..";

export function forAll<T>(iterable: Iterable<T>, cb: (v: T) => boolean): boolean {
    for (const el of iterable) {
        if (!cb(el)) {
            return false;
        }
    }

    return true;
}

export function forAny<T>(iterable: Iterable<T>, cb: (v: T) => boolean): boolean {
    for (const el of iterable) {
        if (cb(el)) {
            return true;
        }
    }

    return false;
}

export function assert(
    condition: boolean,
    message: string,
    ...details: PPIsh[]
): asserts condition {
    if (condition) {
        return;
    }

    throw new Error(fmt(message, ...details));
}

export function repeat<T>(x: T, n: number): T[] {
    const res: T[] = [];
    for (let i = 0; i < n; i++) {
        res.push(x);
    }

    return res;
}
