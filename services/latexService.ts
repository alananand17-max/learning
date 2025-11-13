// services/latexService.ts

const PDFTEX_JS_URLS = [
    'https://cdn.jsdelivr.net/npm/pdftex-js/pdftex.min.js', // Primary CDN
    'https://unpkg.com/pdftex-js@latest/pdftex.min.js' // Fallback CDN
];

let pdftexPromise: Promise<any> | null = null;

const loadPdftexScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const existingScript = document.getElementById('pdftex-script');
        if (existingScript && existingScript.dataset.loaded === 'true') {
            resolve();
            return;
        }
        // If a script tag exists but isn't marked as loaded, remove it to try again cleanly.
        if (existingScript) {
            existingScript.remove();
        }

        const tryLoad = (index: number) => {
            if (index >= PDFTEX_JS_URLS.length) {
                reject(new Error('Failed to load the PDF engine from all sources. Please check your network connection or ad-blocker.'));
                return;
            }
            
            const url = PDFTEX_JS_URLS[index];
            const script = document.createElement('script');
            // Use the same ID for all attempts so we can find and remove it if it fails.
            script.id = 'pdftex-script';
            script.src = url;
            
            script.onload = () => {
                script.dataset.loaded = 'true';
                resolve();
            };
            
            script.onerror = () => {
                console.warn(`Failed to load PDF engine from ${url}. Trying next source.`);
                // Clean up the failed script tag before trying the next one.
                const currentScriptTag = document.getElementById('pdftex-script');
                if (currentScriptTag) {
                   currentScriptTag.remove();
                }
                tryLoad(index + 1);
            };

            document.body.appendChild(script);
        };

        tryLoad(0);
    });
};

const getPdftexInstance = async () => {
    if (!pdftexPromise) {
        pdftexPromise = new Promise(async (resolve, reject) => {
            try {
                await loadPdftexScript();
                // pdftex is now available on the window object
                const pdftex = new (window as any).PDFTeX();
                resolve(pdftex);
            } catch (error) {
                pdftexPromise = null; // Reset on failure so we can retry
                reject(error);
            }
        });
    }
    return pdftexPromise;
};

export async function compileLatexToPdf(latexCode: string): Promise<Blob> {
    try {
        const pdftex = await getPdftexInstance();
        
        const pdfBytes = await pdftex.compile(latexCode);
        
        if (!pdfBytes) {
            const logs = await pdftex.getLog();
            const relevantError = logs.split('\n').find((line: string) => line.startsWith('! '));
            console.error("Full LaTeX Log:", logs);
            throw new Error(`LaTeX compilation failed: ${relevantError || 'Unknown error. Check console for full logs.'}`);
        }

        return new Blob([pdfBytes], { type: 'application/pdf' });

    } catch (error) {
        console.error("PDF Compilation Error:", error);
        throw error;
    }
}
