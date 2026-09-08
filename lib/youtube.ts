/**
 * Pulls the video id out of whatever the editor pasted.
 *
 * The field asks for a link because that is what someone has on the clipboard
 * after finding the film on YouTube — expecting them to know that only
 * `7j2_cCJeMlQ` out of the whole URL is the id is how the section ends up
 * silently empty. All four shapes YouTube hands out are accepted, and a bare id
 * still works for anyone who does know.
 *
 * Returns null for anything unrecognised, which is what leaves the section out
 * of the page rather than embedding a broken player.
 */
export function parseYouTubeId(input: string | undefined | null): string | null {
  const value = input?.trim()
  if (!value) return null

  // A bare id: 11 characters of the URL-safe alphabet, nothing else.
  const ID = /^[A-Za-z0-9_-]{11}$/
  if (ID.test(value)) return value

  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/, // watch?v=…
    /youtu\.be\/([A-Za-z0-9_-]{11})/, // youtu.be/…
    /\/embed\/([A-Za-z0-9_-]{11})/, // /embed/… and /nocookie/embed/…
    /\/shorts\/([A-Za-z0-9_-]{11})/, // /shorts/…
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match) return match[1]
  }

  return null
}
