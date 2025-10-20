import Deferred from "./Util/deferred";

const AUTO_END_TIMEOUT = 1000; // 1 sec

export default function createHeavyAnimationController() {

	let counter = 0;
	let deferred: Deferred | null = null;

	const getIsHeavyAnimating = () => (deferred != null && deferred instanceof Deferred);

	const waitHeavyAnimation = () => deferred?.promise;

	const beginHeavyAnimation = (duration = AUTO_END_TIMEOUT) => {
		counter++;

		if (counter === 1) { // first set
			deferred = new Deferred();
		}

		const timeout = window.setTimeout(onEnd, duration);
		let hasEnded = false;

		function onEnd() {
			if (hasEnded) return;
			hasEnded = true;

			clearTimeout(timeout);
			counter--;

			if (counter === 0) { // last unset
				deferred?.resolve();
				deferred = null;
			}
		}

		return onEnd;
	};

	return {
		getIsHeavyAnimating,
		waitHeavyAnimation,
		beginHeavyAnimation,
	};
}
