"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { loadGoogleMaps, initializePlacesAutocomplete, type PlaceDetails } from "@/lib/googleMapsLoader"

type AddressAutocompleteInputProps = {
  id?: string
  name?: string
  value: string
  placeholder?: string
  className?: string
  onChange: (value: string) => void
  onPlaceSelected?: (place: PlaceDetails) => void
}

export function AddressAutocompleteInput({
  id = "address",
  name = "address",
  value,
  placeholder = "Start typing an address...",
  className,
  onChange,
  onPlaceSelected,
}: AddressAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null)
  const mutationObserverRef = useRef<MutationObserver | null>(null)
  const googleListenersRef = useRef<any[]>([])

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        await loadGoogleMaps()
        if (!isMounted || !inputRef.current) return
        // Initialize Places autocomplete
        autocompleteInstanceRef.current = initializePlacesAutocomplete(inputRef.current, (place) => {
          onChange(place.formatted_address)
          onPlaceSelected?.(place)
        })

        // After initialization, watch for Google's pac container and relocate it under our wrapper
        const wrapper = wrapperRef.current
        const movePacIntoWrapper = () => {
          const pac = document.querySelector('.pac-container') as HTMLElement | null
          if (!pac || !wrapper) return false
          if (wrapper.contains(pac)) return true
          try {
            wrapper.appendChild(pac)
            pac.style.position = 'absolute'
            pac.style.top = '100%'
            pac.style.left = '0'
            pac.style.width = '100%'
            pac.style.zIndex = '9999'
            pac.style.borderRadius = '12px'
            pac.style.overflow = 'hidden'
            pac.style.marginTop = '6px'
          } catch {
            return false
          }
          return true
        }

        // Observe DOM for pac container creation
        const observer = new MutationObserver((mutations) => {
          for (const m of mutations) {
            for (const node of Array.from(m.addedNodes)) {
              if ((node as HTMLElement)?.classList?.contains('pac-container')) {
                movePacIntoWrapper()
              }
            }
          }
        })
        observer.observe(document.body, { childList: true })
        mutationObserverRef.current = observer

        // Immediate attempt and short fallback retries
        movePacIntoWrapper()
        let tries = 0
        const maxTries = 20
        const intId = window.setInterval(() => {
          tries += 1
          const done = movePacIntoWrapper()
          if (done || tries >= maxTries) window.clearInterval(intId)
        }, 100)

        // Keep width synced
        const syncWidth = () => {
          const pac = wrapper?.querySelector('.pac-container') as HTMLElement | null
          if (pac && wrapper) {
            pac.style.width = `${wrapper.offsetWidth}px`
          }
        }
        window.addEventListener('resize', syncWidth)
        window.addEventListener('scroll', syncWidth, true)

        // Store cleanup callbacks on ref by pushing listeners (none from maps here as we use loader util)
        googleListenersRef.current.push({ type: 'resize', fn: syncWidth })
        googleListenersRef.current.push({ type: 'scroll', fn: syncWidth })
      } catch (err) {
        // fail silently; input still works as a normal text field
      }
    }
    init()
    return () => {
      isMounted = false
      // Best-effort cleanup: remove Google listeners by resetting input value and instance
      autocompleteInstanceRef.current = null
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect()
        mutationObserverRef.current = null
      }
      // Remove attached window listeners
      googleListenersRef.current.forEach((l) => {
        if (l.type === 'resize') window.removeEventListener('resize', l.fn)
        if (l.type === 'scroll') window.removeEventListener('scroll', l.fn, true)
      })
      googleListenersRef.current = []

      // Move pac back to body and reset styles (best-effort)
      const wrapper = wrapperRef.current
      const pac = wrapper?.querySelector('.pac-container') as HTMLElement | null
      if (pac && document.body) {
        document.body.appendChild(pac)
        pac.style.position = ''
        pac.style.top = ''
        pac.style.left = ''
        pac.style.width = ''
        pac.style.zIndex = ''
        pac.style.borderRadius = ''
        pac.style.overflow = ''
        pac.style.marginTop = ''
      }
    }
  }, [onChange, onPlaceSelected])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    // If user clears the input, ensure any suggestion dropdown closes naturally.
    // Google Places dropdown hides automatically when input is empty; no extra work needed.
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        autoComplete="off"
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        className={cn(
          "bg-white/20 dark:bg-slate-700/20 border-white/30 dark:border-slate-600/30 backdrop-blur-sm focus:bg-white/30 dark:focus:bg-slate-700/30 transition-all duration-300",
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          className,
        )}
      />
    </div>
  )
}

export default AddressAutocompleteInput


