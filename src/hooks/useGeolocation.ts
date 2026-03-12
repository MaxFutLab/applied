import { useCallback, useEffect, useMemo, useState } from 'react'

export type GeolocationSnapshot = {
  latitude: number
  longitude: number
  accuracy: number
  timestampLocal: string
}

type GeolocationPermissionStatus = PermissionState | 'unsupported' | 'unknown'

type UseGeolocationResult = {
  currentLocation: GeolocationSnapshot | null
  errorMessage: string | null
  isLoading: boolean
  permissionStatus: GeolocationPermissionStatus
  captureLocation: () => Promise<GeolocationSnapshot | null>
}

export function useGeolocation(): UseGeolocationResult {
  const geolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [currentLocation, setCurrentLocation] = useState<GeolocationSnapshot | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    geolocationSupported ? null : 'Geolocalizacao nao suportada neste dispositivo.',
  )
  const [isLoading, setIsLoading] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<GeolocationPermissionStatus>(
    geolocationSupported ? 'unknown' : 'unsupported',
  )

  useEffect(() => {
    if (!geolocationSupported) {
      return
    }

    if (!('permissions' in navigator)) {
      return
    }

    let isMounted = true

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        if (!isMounted) {
          return
        }

        setPermissionStatus(status.state)
        status.onchange = () => setPermissionStatus(status.state)
      })
      .catch(() => {
        setPermissionStatus('unknown')
      })

    return () => {
      isMounted = false
    }
  }, [geolocationSupported])

  const captureLocation = useCallback(async () => {
    if (!geolocationSupported) {
      setPermissionStatus('unsupported')
      setErrorMessage('Geolocalizacao nao suportada neste dispositivo.')
      return null
    }

    setIsLoading(true)
    setErrorMessage(null)

    const result = await new Promise<GeolocationSnapshot | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const snapshot = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestampLocal: new Date(position.timestamp).toISOString(),
          }

          setCurrentLocation(snapshot)
          setIsLoading(false)
          resolve(snapshot)
        },
        (error) => {
          setErrorMessage(error.message || 'Nao foi possivel obter a localizacao.')
          setIsLoading(false)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        },
      )
    })

    return result
  }, [geolocationSupported])

  return useMemo(
    () => ({
      currentLocation,
      errorMessage,
      isLoading,
      permissionStatus,
      captureLocation,
    }),
    [captureLocation, currentLocation, errorMessage, isLoading, permissionStatus],
  )
}
