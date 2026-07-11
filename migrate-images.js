
const admin = require('firebase-admin');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
// Ensure your environment variables are set for Cloudinary
// (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)

// IMPORTANT: Set up Firebase Admin credentials before running!
// 1. Go to your Firebase project settings > Service accounts.
// 2. Click "Generate new private key" and download the JSON file.
// 3. Save this file securely in your project (e.g., as 'serviceAccountKey.json').
// 4. Make sure this file is listed in your .gitignore to keep it private!
// 5. Set the environment variable:
//    - On Mac/Linux: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/serviceAccountKey.json"
//    - On Windows: set GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\serviceAccountKey.json"

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('ERROR: The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
    console.error('Please download your service account key from Firebase and set the path.');
    process.exit(1);
}

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.error("Firebase Admin initialization failed:", error.message);
    process.exit(1);
}


const db = admin.firestore();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

// Defines where to find the local images and what to name them in Cloudinary.
const imageMap = {
    '/assets/images/bullet350.png': 'reshowroom_assets/bullet350',
    '/assets/images/classic350.png': 'reshowroom_assets/classic350',
    '/assets/images/himalayan.png': 'reshowroom_assets/himalayan',
    '/assets/images/hunter350.png': 'reshowroom_assets/hunter350',
    '/assets/images/meteor350.png': 'reshowroom_assets/meteor350',
    '/assets/images/meteor650.png': 'reshowroom_assets/meteor650',
};

const imagesDir = path.join(__dirname, 'public', 'assets', 'images');

const migrateImages = async () => {
    console.log('--- Starting Image and Firestore Migration Script ---');
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();

    if (snapshot.empty) {
        console.log('No products found in Firestore. Exiting.');
        return;
    }

    console.log(`Found ${snapshot.docs.length} products. Checking each one for migration...`);

    const migrationPromises = [];

    for (const doc of snapshot.docs) {
        const product = doc.data();
        const oldImageUrl = product.imageUrl;

        // Check if the imageUrl is a local path that we need to migrate.
        if (oldImageUrl && imageMap[oldImageUrl]) {
            const newPublicId = imageMap[oldImageUrl];
            const localImageName = path.basename(oldImageUrl);
            const localImagePath = path.join(imagesDir, localImageName);

            if (!fs.existsSync(localImagePath)) {
                console.warn(`[SKIP] Product: "${product.name}". Local image not found at ${localImagePath}`);
                continue;
            }
            
            console.log(`[MIGRATE] Product: "${product.name}"`);
            console.log(`  - Old URL: ${oldImageUrl}`);

            const migrationPromise = cloudinary.uploader.upload(localImagePath, {
                public_id: newPublicId,
                folder: "reshowroom_assets", // Optional: organize in Cloudinary
                overwrite: true,
            })
            .then(uploadResult => {
                console.log(`  - Uploaded to Cloudinary with ID: ${uploadResult.public_id}`);
                // Now, update the Firestore document with the new public_id
                return doc.ref.update({
                    imageUrl: uploadResult.public_id
                });
            })
            .then(() => {
                console.log(`  - Successfully updated Firestore document for "${product.name}".`);
            })
            .catch(error => {
                console.error(`  - [FAIL] Failed to migrate for product: "${product.name}"`, error);
            });

            migrationPromises.push(migrationPromise);
        } else {
             // This logs products that are already migrated or have different/no image URLs.
            console.log(`[SKIP] Product: "${product.name}". No migration needed. Image URL: "${oldImageUrl}"`);
        }
    }
    
    await Promise.all(migrationPromises);
    console.log('\n--- Migration Script Finished ---');
    console.log(`${migrationPromises.length} products were targeted for migration.`);
};

migrateImages().catch(error => {
    console.error("An unexpected error occurred during the migration:", error);
});
