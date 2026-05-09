export default function NotFound(){
   return(
      <div style={styles.container}>
         <h1 style={styles.title}>Oops! Page Not Found</h1>
         <p style={styles.text}>The page you are looking for could not be found.</p>
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
   },
};