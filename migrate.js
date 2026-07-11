const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, writeBatch } = require('firebase/firestore');

// Load environment variables from .env.local
const absEnvPath = path.join(__dirname, '.env.local');

console.log('Reading env from:', absEnvPath);
if (fs.existsSync(absEnvPath)) {
    const envContent = fs.readFileSync(absEnvPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const index = trimmed.indexOf('=');
            if (index > -1) {
                const key = trimmed.substring(0, index).trim();
                const val = trimmed.substring(index + 1).trim();
                process.env[key] = val;
            }
        }
    });
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('Firebase Config:', {
    projectId: firebaseConfig.projectId,
    apiKey: firebaseConfig.apiKey ? 'PRESENT' : 'MISSING'
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const parsePrice = (priceVal) => {
    if (typeof priceVal === 'number') return priceVal;
    if (typeof priceVal !== 'string') return 0;
    const isLakh = priceVal.toLowerCase().includes('l');
    const cleaned = priceVal.replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned) || 0;
    return isLakh ? Math.round(num * 100000) : Math.round(num);
};

const initialBikeModels = [
    { name: 'Classic 350', financeEnabled: true },
    { name: 'Himalayan 450', financeEnabled: true },
    { name: 'Bullet 350', financeEnabled: true },
    { name: 'Hunter 350', financeEnabled: true },
    { name: 'Meteor 350', financeEnabled: false },
    { name: 'Super Meteor 650', financeEnabled: true },
];

async function migrate() {
    try {
        console.log('Fetching products...');
        const querySnapshot = await getDocs(collection(db, 'products'));
        console.log(`Found ${querySnapshot.size} products.`);
        
        const batch = writeBatch(db);
        let updatedCount = 0;
        
        querySnapshot.forEach((document) => {
            const data = document.data();
            const originalPrice = data.price;
            const originalFinance = data.financeEnabled;
            
            const numericPrice = parsePrice(originalPrice);
            
            // Determine financeEnabled
            let financeEnabled = originalFinance;
            if (financeEnabled === undefined) {
                const match = initialBikeModels.find(m => m.name.toLowerCase() === data.name.toLowerCase());
                financeEnabled = match ? match.financeEnabled : true;
            }
            
            const updates = {};
            let needsUpdate = false;
            
            if (typeof originalPrice === 'string') {
                updates.price = numericPrice;
                needsUpdate = true;
                console.log(`- Product [${data.name}]: Convert price "${originalPrice}" -> ${numericPrice}`);
            }
            
            if (originalFinance === undefined) {
                updates.financeEnabled = financeEnabled;
                needsUpdate = true;
                console.log(`- Product [${data.name}]: Set financeEnabled -> ${financeEnabled}`);
            }
            
            if (needsUpdate) {
                const docRef = doc(db, 'products', document.id);
                batch.update(docRef, updates);
                updatedCount++;
            }
        });
        
        if (updatedCount > 0) {
            console.log(`Committing updates for ${updatedCount} products...`);
            await batch.commit();
            console.log('Migration completed successfully!');
        } else {
            console.log('No products needed updates.');
        }
    } catch (err) {
        console.error('Error during migration:', err);
    }
}

migrate();
