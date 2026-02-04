/**
 * Utilitaires pour la compression d'images côté client.
 */

// Options de compression optimisées pour l'OCR
const DEFAULT_MAX_WIDTH = 2560; // Haute résolution pour préserver les détails fins
const DEFAULT_MAX_HEIGHT = 2560;
const DEFAULT_QUALITY = 0.92; // Qualité supérieure pour éviter les artefacts de bordure
const MAX_FILE_SIZE_MB = 5.0; // Augmenté pour permettre de meilleures images

/**
 * Compresse une image en redimensionnant et en ajustant la qualité JPEG.
 * @param file Le fichier image à compresser
 * @param quality La qualité de compression (0 à 1)
 * @param maxWidth La largeur maximale
 * @param maxHeight La hauteur maximale
 * @returns Une promesse qui résout vers le fichier compressé
 */
export async function compressImage(
    file: File,
    quality = DEFAULT_QUALITY,
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT
): Promise<File> {
    // Si ce n'est pas une image, on retourne le fichier tel quel
    if (!file.type.startsWith('image/')) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calcul des nouvelles dimensions en gardant le ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Impossible de créer le contexte canvas"));
                    return;
                }

                // Optimisation de la qualité du rendu
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Application de filtres pour améliorer l'OCR (contraste et luminosité)
                // Ces filtres aident à rendre le texte plus noir et le fond plus blanc
                ctx.filter = "contrast(1.15) brightness(1.02) saturate(0.9)";

                ctx.drawImage(img, 0, 0, width, height);

                // Conversion en blob/file
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Erreur lors de la compression"));
                            return;
                        }

                        // Création du nouveau fichier
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg', // On force JPEG pour une meilleure compression
                            lastModified: Date.now(),
                        });

                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
}

/**
 * Tente de compresser une image pour qu'elle passe sous une certaine taille.
 * Essaye successivement des qualités inférieures si nécessaire.
 */
export async function smartCompressImage(file: File, targetSizeMB = MAX_FILE_SIZE_MB): Promise<File> {
    // Pas de traitement pour les fichiers non-images (PDF)
    if (!file.type.startsWith('image/')) {
        return file;
    }

    // On force maintenant le traitement même pour les petits fichiers pour appliquer les filtres d'amélioration OCR
    console.log(`[Compression] Traitement d'amélioration OCR pour ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    try {
        // Première passe : redimensionnement haute qualité
        let compressed = await compressImage(file, 0.9, 2560, 2560);

        // Si toujours trop gros, on réduit légèrement
        if (compressed.size > targetSizeMB * 1024 * 1024) {
            console.log(`[Compression] Passe 2 requise pour ${file.name}`);
            compressed = await compressImage(file, 0.85, 2048, 2048);
        }

        // Si encore trop gros, on force une limite de sécurité mais en gardant de la netteté
        if (compressed.size > targetSizeMB * 1024 * 1024) {
            console.log(`[Compression] Passe 3 (finale) requise pour ${file.name}`);
            compressed = await compressImage(file, 0.75, 1920, 1920);
        }

        console.log(`[Compression] Terminé pour ${file.name}. Nouvelle taille: ${(compressed.size / 1024 / 1024).toFixed(2)} MB`);
        return compressed;
    } catch (error) {
        console.error("Erreur de compression:", error);
        return file; // En cas d'erreur, on retourne l'original
    }
}
