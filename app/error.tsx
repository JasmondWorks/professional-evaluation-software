"use client"

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Something went wrong!</h1>
      <p style={styles.text}>{error.message || 'An unexpected error occurred.'}</p>
      <button
        style={styles.button}
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
   container: {
     display: 'flex',
     flexDirection: 'column',
     alignItems: 'center',
     justifyContent: 'center',
     height: '100vh',
   },
   title: {
     fontSize: '36px',
     fontWeight: 'bold',
     marginBottom: '20px',
   },
   text: {
     fontSize: '18px',
     marginBottom: '20px',
   },
   button: {
     padding: '10px 20px',
     fontSize: '16px',
     cursor: 'pointer',
     backgroundColor: '#322b80',
     color: 'white',
     border: 'none',
     borderRadius: '5px',
     fontWeight: 'bold',
   },
};
