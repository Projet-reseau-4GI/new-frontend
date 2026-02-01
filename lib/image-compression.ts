/**
 * Utilitaires pour la compression d'images côté client.
 */

// Options de compression par défaut
const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_MAX_HEIGHT = 1920;
const DEFAULT_QUALITY = 0.8;
const MAX_FILE_SIZE_MB = 4.5; // Cible de taille max par fichier (pour laisser de la marge pour le total de 10Mo)

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
    // Pas de compression pour les petits fichiers ou les PDF
    if (file.size <= targetSizeMB * 1024 * 1024 || !file.type.startsWith('image/')) {
        return file;
    }

    console.log(`[Compression] Début compression pour ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    try {
        // Première passe : redimensionnement simple + qualité 0.8
        let compressed = await compressImage(file, 0.8);

        // Si toujours trop gros, on réduit la qualité
        if (compressed.size > targetSizeMB * 1024 * 1024) {
            console.log(`[Compression] Passe 2 requise pour ${file.name}`);
            compressed = await compressImage(file, 0.6, 1600, 1600);
        }

        // Si encore trop gros, on force une qualité basse
        if (compressed.size > targetSizeMB * 1024 * 1024) {
            console.log(`[Compression] Passe 3 (finale) requise pour ${file.name}`);
            compressed = await compressImage(file, 0.4, 1280, 1280);
        }

        console.log(`[Compression] Terminé pour ${file.name}. Nouvelle taille: ${(compressed.size / 1024 / 1024).toFixed(2)} MB`);
        return compressed;
    } catch (error) {
        console.error("Erreur de compression:", error);
        return file; // En cas d'erreur, on retourne l'original
    }
}
