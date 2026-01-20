// Check if the active element is interactive
export const isInteractiveElement = (element: Element | null): boolean => {
  if (!element) return false;

  const tagName = element.tagName.toUpperCase();
  const interactiveTags = ['INPUT', 'TEXTAREA', 'BUTTON', 'A', 'SELECT'];
  const isContentEditable = element.getAttribute('contenteditable') === 'true';
  const hasTabIndex = element.hasAttribute('tabindex');

  return (
    interactiveTags.includes(tagName) ||
    isContentEditable ||
    hasTabIndex
  );
};