// A small dropdown that follows the ARIA listbox pattern: a button opens a
// list, which the arrow keys, Home, End, Enter, Space and Escape operate.

/**
 * Turns the `.picker` element `root` into a dropdown of `options`, each
 * `{ value, label, tag? }`. Calls `onChange(value)` when the user picks one.
 */
export function createPicker(root, options, onChange) {
  const button = root.querySelector('.picker-button');
  const valueLabel = root.querySelector('.picker-value');
  const list = root.querySelector('.picker-list');

  let selectedIndex = 0;
  let activeIndex = 0;

  const items = options.map(({ label, tag }, index) => {
    const item = document.createElement('li');
    item.id = `${list.id}-${index}`;
    item.setAttribute('role', 'option');
    item.textContent = label;

    if (tag) {
      const badge = document.createElement('span');
      badge.className = 'tag';
      badge.textContent = tag;
      item.append(badge);
    }

    item.addEventListener('click', () => choose(index));
    item.addEventListener('pointermove', () => setActive(index));

    return item;
  });

  list.replaceChildren(...items);

  const isOpen = () => !list.hidden;

  function setActive(index) {
    activeIndex = (index + items.length) % items.length;
    items.forEach((item, i) => item.classList.toggle('active', i === activeIndex));
    list.setAttribute('aria-activedescendant', items[activeIndex].id);
    items[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  function open() {
    list.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    setActive(selectedIndex);
    list.focus();
  }

  function close({ returnFocus = true } = {}) {
    if (!isOpen()) return;

    list.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (returnFocus) button.focus();
  }

  function select(value) {
    const index = options.findIndex((option) => option.value === value);
    if (index === -1) return;

    selectedIndex = index;
    items.forEach((item, i) => item.setAttribute('aria-selected', String(i === index)));
    valueLabel.textContent = options[index].label;
  }

  function choose(index) {
    close();

    if (index !== selectedIndex) {
      select(options[index].value);
      onChange(options[index].value);
    }
  }

  button.addEventListener('click', () => (isOpen() ? close() : open()));

  button.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open();
    }
  });

  list.addEventListener('keydown', (event) => {
    const keys = {
      ArrowDown: () => setActive(activeIndex + 1),
      ArrowUp: () => setActive(activeIndex - 1),
      Home: () => setActive(0),
      End: () => setActive(items.length - 1),
      Enter: () => choose(activeIndex),
      ' ': () => choose(activeIndex),
      Escape: () => close(),
    };

    if (event.key === 'Tab') {
      close({ returnFocus: false });
    } else if (keys[event.key]) {
      event.preventDefault();
      keys[event.key]();
    }
  });

  // Close when focus or a click goes anywhere else
  list.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) close({ returnFocus: false });
  });

  document.addEventListener('pointerdown', (event) => {
    if (!root.contains(event.target)) close({ returnFocus: false });
  });

  return {
    select,

    /** Shows a spinner while the chosen option is still loading. */
    setBusy(busy) {
      root.toggleAttribute('data-busy', busy);
    },

    setDisabled(disabled) {
      button.disabled = disabled;
      if (disabled) close({ returnFocus: false });
    },
  };
}
