let lockCount = 0;
let savedOverflow = '';

/** Call returned cleanup when modal closes. Safe with stacked modals. */
export function lockBodyScroll() {
    if (lockCount === 0) {
        savedOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    }
    lockCount += 1;
    return () => {
        lockCount -= 1;
        if (lockCount <= 0) {
            lockCount = 0;
            document.body.style.overflow = savedOverflow;
        }
    };
}
