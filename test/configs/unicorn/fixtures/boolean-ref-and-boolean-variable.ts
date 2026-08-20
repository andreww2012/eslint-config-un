interface Ref<T> {
  value: T;
}

declare function useVisibility(): Ref<boolean>;

const isVisible = useVisibility();
const ready = true;

export {isVisible, ready};
