export function animateEntrance(container) {
  if (!container) {
    return;
  }

  [...container.children].forEach((child, index) => {
    child.classList.remove("fade-in");
    child.style.animationDelay = `${index * 35}ms`;
    child.classList.add("fade-in");
  });
}
