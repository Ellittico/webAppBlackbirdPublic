const avatars = import.meta.glob("../assets/avatar/*.png", {
  eager: true,
  import: "default",
})

export function getAvatarByIndex(index: number) {
  const keys = Object.keys(avatars).sort()
  const safeIndex = Math.max(1, index)
  const key = keys[(safeIndex - 1) % keys.length]
  return avatars[key] as string
}
