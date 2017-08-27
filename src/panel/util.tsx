export function insertAt<T>(list: Array<T>, itemIndex: number, targetIndex: number) {
  if (itemIndex >= 0 && targetIndex >= 0) {
    const item = list[itemIndex]
    list.splice(itemIndex, 1)
    list.splice(targetIndex, 0, item)
  }
}
