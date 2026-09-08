'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useCookieConsent } from '@/context/CookieConsentContext'

/**
 * A YouTube video that costs nothing until someone wants to watch it.
 *
 * A plain `<iframe src="youtube.com/embed/…">` pulls roughly a megabyte of
 * JavaScript from three domains on page load, whether or not the video is ever
 * played — on a service page it is routinely heavier than the rest of the page
 * put together, and it lands squarely in the LCP window. So this renders a
 * *facade*: a poster image and a play button, both first-party, and the iframe
 * is mounted on click. The cost of the video moves to the people who watch it.
 *
 * The poster goes through `next/image`, which means our own server fetches it
 * and serves it back as AVIF/WebP. That is not just smaller — it also means the
 * visitor's browser never talks to Google until the play button is pressed, so
 * the page has no third-party contact to ask consent for.
 *
 * Consent therefore gates the click, not the render: the video looks like a
 * video, and "externa tjänster" is asked for at the moment someone actually
 * wants the embed. Same rule as `ElfsightWidget`, applied where the third party
 * actually enters.
 *
 * `youtube-nocookie.com` rather than `youtube.com` — it skips the ad/profiling
 * cookies on playback. Consent still applies; it is a smaller footprint, not an
 * absent one.
 */
export default function YouTubeEmbed({
  id,
  title,
  poster,
  sizes = '(max-width: 1280px) 100vw, 1200px',
  className,
}: {
  /** The video id — the `v=` part of the watch URL, not the whole URL. */
  id: string
  /** Names the video for screen readers and for the iframe. Required on purpose. */
  title: string
  /**
   * Poster image. Give it one — a still from Sanity or /public is sharper than
   * anything YouTube exposes, and it is the only frame most visitors will see.
   * Without it we fall back to YouTube's own thumbnail, proxied through
   * next/image like any other remote source.
   */
  poster?: string
  /**
   * Matches the full-width 16:9 bands on a service page. Override it where the
   * embed sits in a narrower column, or the browser picks a source for a box
   * the video isn't in and the poster comes out soft.
   */
  sizes?: string
  className?: string
}) {
  const { consent, ready, openSettings } = useCookieConsent()
  const [playing, setPlaying] = useState(false)
  // maxres is the only 16:9 thumbnail YouTube guarantees at a usable size, but
  // it is missing on older or low-resolution uploads. hq always exists — it is
  // 4:3 with bars, which `object-cover` crops back to 16:9.
  const [src, setSrc] = useState(poster ?? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`)

  const allowed = consent?.external === true

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-lg ${className ?? ''}`}
      style={{ background: 'var(--color-primary)' }}
    >
      {playing ? (
        <iframe
          // autoplay is honoured because mounting followed a real click. The
          // iframe exists only in this branch — nothing about YouTube is on the
          // page before it.
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&hl=sv`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <>
          {/* React hoists these into <head>. Rendered only while the facade is
              up, and only with consent: the TLS handshake is then already done
              when the click comes, which is most of the delay between pressing
              play and seeing a frame. Without consent there is nothing to warm
              up, because nothing is going to be fetched. */}
          {allowed && (
            <>
              <link rel="preconnect" href="https://www.youtube-nocookie.com" />
              <link rel="preconnect" href="https://i.ytimg.com" />
            </>
          )}

          <Image
            src={src}
            alt=""
            fill
            sizes={sizes}
            className="object-cover"
            onError={() => setSrc(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
          />

          <button
            type="button"
            // Before the consent state has been read there is nothing sensible
            // to do with a click, and that is one frame — see ElfsightWidget.
            disabled={!ready}
            onClick={() => (allowed ? setPlaying(true) : openSettings())}
            aria-label={allowed ? `Spela videon: ${title}` : `Tillåt externa tjänster för att spela: ${title}`}
            className="group absolute inset-0 flex items-center justify-center transition-colors duration-300"
            style={{ background: 'rgba(18, 48, 74, 0.28)' }}
          >
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20"
              style={{ background: 'var(--color-gold)' }}
            >
              {/* Offset a hair right — a triangle centred on its bounding box
                  reads as sitting left of centre inside a circle. */}
              <svg
                width="26"
                height="30"
                viewBox="0 0 26 30"
                fill="#fff"
                aria-hidden="true"
                className="ml-1"
              >
                <path d="M25 13.27a2 2 0 0 1 0 3.46L3 29.46A2 2 0 0 1 0 27.73V2.27A2 2 0 0 1 3 .54Z" />
              </svg>
            </span>
          </button>

          {ready && !allowed && (
            <p
              className="pointer-events-none absolute inset-x-0 bottom-0 px-4 py-3 text-center text-xs leading-relaxed text-white"
              style={{ background: 'linear-gradient(transparent, rgba(18, 48, 74, 0.85))' }}
            >
              Videon spelas via YouTube. Tryck på play för att tillåta externa tjänster.
            </p>
          )}
        </>
      )}
    </div>
  )
}
