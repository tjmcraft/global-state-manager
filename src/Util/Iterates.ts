export function pick<T, K extends keyof T>(object: T, keys: K[]) {
  return keys.reduce((result, key) => {
    result[key] = object[key];
    return result;
  }, {} as Pick<T, K>);
}

export function omit<T extends object, K extends keyof T>(object: T, keys: K[]): Omit<T, K> {
  const stringKeys = new Set(keys.map(String));
  const savedKeys = Object.keys(object)
    .filter((key) => !stringKeys.has(key)) as Array<Exclude<keyof T, K>>;

  return pick(object, savedKeys);
}

export function arePropsShallowEqual(currentProps: AnyLiteral, newProps: AnyLiteral): boolean {

	if (currentProps === newProps) {
		return true;
	}

	const currentKeys = Object.keys(currentProps);
	const currentKeysLength = currentKeys.length;
	const newKeysLength = Object.keys(newProps).length;

	if (currentKeysLength !== newKeysLength) {
		return false;
	}

	if (currentKeysLength === 0) {
		return true;
	}

	for (let i = 0; i < currentKeysLength; i++) {
		const prop = currentKeys[i];
		if (currentProps[prop] !== newProps[prop]) return false;
	}

	return true;
}

export function getUnequalProps(currentProps: AnyLiteral, newProps: AnyLiteral) {
	const currentKeys = Object.keys(currentProps);
	const currentKeysLength = currentKeys.length;
	const newKeysLength = Object.keys(newProps).length;

	if (currentKeysLength !== newKeysLength) {
		return ['%LENGTH%'];
	}

	return currentKeys.reduce((res, prop) => {
		if (currentProps[prop] !== newProps[prop]) {
			res.push(`${prop}: ${currentProps[prop]} => ${newProps[prop]}`);
		}
		return res;
	}, [] as Array<string>);
}


const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x: any, y: any): boolean {
	// SameValue algorithm
	if (x === y) { // Steps 1-5, 7-10
		// Steps 6.b-6.e: +0 != -0
		// Added the nonzero y check to make Flow happy, but it is redundant
		return x !== 0 || y !== 0 || 1 / x === 1 / y;
	} else {
		// Step 6.a: NaN == NaN
		return x !== x && y !== y;
	}
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
export function shallowEqual(objA: AnyLiteral | any, objB: AnyLiteral | any): boolean {
	if (is(objA, objB)) {
		return true;
	}

	if (typeof objA !== 'object' || objA === null ||
		typeof objB !== 'object' || objB === null) {
		return false;
	}

	const keysA = Object.keys(objA);
	const keysB = Object.keys(objB);

	if (keysA.length !== keysB.length) {
		return false;
	}

	// Test for A's keys different from B.
	for (let i = 0; i < keysA.length; i++) {
		if (
			!hasOwnProperty.call(objB, keysA[i]) ||
			!is(objA[keysA[i]], objB[keysA[i]])
		) {
			return false;
		}
	}

	return true;
}

export const getObjectDiff = (obj1: AnyLiteral, obj2: AnyLiteral) => {
	const combinedObject = { ...obj1, ...obj2 };
	return Object.entries(combinedObject).reduce((acc, [key, value]) => {
		if (
			!Object.values(obj1).includes(value) ||
			!Object.values(obj2).includes(value)
		) acc[key] = value;
		return acc;
	}, {} as AnyLiteral);
};

export function compareObjects(original:AnyLiteral, copy:AnyLiteral) {
	for (let [k, v] of Object.entries(original)) {
		if (typeof v === "object" && v !== null) {
			compareObjects(v, copy?.[k]);
		} else {
			if (Object.is(v, copy?.[k])) delete copy?.[k];
		}
	}
	return copy;
}

export const stacksEqual = <T>(a1: Array<T>, a2: Array<T>) => a1 === a2 || (
	a1 !== null && a2 !== null &&
	Array.isArray(a1) && Array.isArray(a2) &&
	a1.length === a2.length &&
	a1.map((val, idx) => shallowEqual(val, a2[idx])).every(e => e)
);

export const stacksDiff = <T>(arr1: Array<T>, arr2: Array<T>) =>
	arr1 !== null && arr2 !== null &&
	Array.isArray(arr1) && Array.isArray(arr2) &&
	arr1.length > 0 && arr2.length > 0 &&
	arr1
		.filter(x => !arr2.includes(x))
		.concat(arr2.filter(x => !arr1.includes(x)));
