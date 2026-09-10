/**
 * A block of structured data.
 *
 * The payload carries editor-controlled strings — product names, descriptions
 * typed in the studio — into the body of a `<script>`, where the browser is
 * not parsing HTML but where the sequence `</script>` still ends the element.
 * `JSON.stringify` escapes quotes and backslashes but not `<`, so it is
 * neutralised here. Same reasoning as the `esc()` helpers in the two mail
 * routes: the data is trusted to be well-formed, never to be inert.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
