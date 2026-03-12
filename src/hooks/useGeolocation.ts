import { useCallback, useEffect, useState } from 'react'

export type GeolocationSnapshot = {
  latitude: number
  longitude: number
  accuracy: number
  timestampLocal: string
}

type GeolocationPermissionStatus = PermissionState | 'unsupported' | 'unknown'

export type GeolocationCaptureStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'permission-denied'
  | 'unsupported'

type UseGeolocationResult = {
  currentLocation: GeolocationSnapshot | null
  errorMessage: string | null
  isLoading: boolean
  permissionStatus: GeolocationPermissionStatus
  status: GeolocationCaptureStatus
  captureLocation: () => Promise<GeolocationSnapshot | null>
}

type UseGeolocationOptions = {
  autoStart?: boolean
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationResult {
  const { autoStart = true } = options
  const geolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [currentLocation, setCurrentLocation] = useState<GeolocationSnapshot | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    geolocationSupported ? null : 'Geolocalizacao nao suportada neste dispositivo.',
  )
  const [isLoading, setIsLoading] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<GeolocationPermissionStatus>(
    geolocationSupported ? 'unknown' : 'unsupported',
  )
  const [status, setStatus] = useState<GeolocationCaptureStatus>(
    geolocationSupported ? 'idle' : 'unsupported',
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
        if (status.state === 'denied') {
          setStatus('permission-denied')
          setErrorMessage(
            'Permissao de localizacao negada. Libere a localizacao para concluir o check-in.',
          )
        }
        status.onchange = () => {
          setPermissionStatus(status.state)

          if (status.state === 'denied') {
            setStatus('permission-denied')
            setErrorMessage(
              'Permissao de localizacao negada. Libere a localizacao para concluir o check-in.',
            )
            setCurrentLocation(null)
          }
        }
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
      setStatus('unsupported')
      setErrorMessage('Geolocalizacao nao suportada neste dispositivo.')
      return null
    }

    setIsLoading(true)
    setStatus('loading')
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

          setPermissionStatus('granted')
          setCurrentLocation(snapshot)
          setStatus('success')
          setIsLoading(false)
          resolve(snapshot)
        },
        (error) => {
          const denied = error.code === error.PERMISSION_DENIED

          setCurrentLocation(null)
          setPermissionStatus((currentPermissionStatus) =>
            denied ? 'denied' : currentPermissionStatus,
          )
          setStatus(denied ? 'permission-denied' : 'error')
          setErrorMessage(
            denied
              ? 'Permissao de localizacao negada. Libere a localizacao para concluir o check-in.'
              : error.message || 'Nao foi possivel obter a localizacao.',
          )
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

  useEffect(() => {
    if (!autoStart || !geolocationSupported) {
      return
    }

    const timerId = window.setTimeout(() => {
      void captureLocation()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [autoStart, captureLocation, geolocationSupported])

  return {
    currentLocation,
    errorMessage,
    isLoading,
    permissionStatus,
    status,
    captureLocation,
  }
}
