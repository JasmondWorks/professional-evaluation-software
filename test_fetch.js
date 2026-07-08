const jwt = require('jsonwebtoken');

async function main() {
  const token = jwt.sign({ org: 'test org' }, 'secret'); // Or whatever secret
  
  // We can just query the endpoint directly if we have the token
  // But wait, the route doesn't verify the secret, it just calls jwt.decode!
  // jwt.decode doesn't need a secret.
  
  const res = await fetch('http://localhost:3000/api/getDataEntry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  const data = await res.json();
  console.log("getDataEntry API response:", JSON.stringify(data, null, 2));
}
main();
