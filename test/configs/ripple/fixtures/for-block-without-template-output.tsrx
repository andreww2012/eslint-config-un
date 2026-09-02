export function List() @{
  const items = [1, 2, 3];

  @for (const item of items) {
    const doubled = item * 2;
  }
}
