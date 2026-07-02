import { db } from './src/firebase.js';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function main() {
  const q = query(collection(db, 'transactions'), where('userId', '==', 'usr_zz9vpist6'));
  const snap = await getDocs(q);
  console.log(`Transactions found: ${snap.size}`);
  snap.forEach(d => {
    console.log(d.data());
  });
}
main().catch(console.error);
