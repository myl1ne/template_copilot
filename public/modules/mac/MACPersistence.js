import { MAC, MACLibrary } from './MACCore.js';

/**
 * MACPersistence - Save/load MAC definitions to/from various formats
 * 
 * Supports:
 * - JSON format for structured data
 * - Code strings for editable JavaScript
 * - LocalStorage for browser persistence
 * - File export/import
 */
export class MACPersistence {
    /**
     * Save MAC to JSON string
     */
    static toJSON(mac) {
        return JSON.stringify(mac.toJSON(), null, 2);
    }

    /**
     * Load MAC from JSON string
     */
    static fromJSON(jsonString) {
        try {
            const json = JSON.parse(jsonString);
            return MAC.fromJSON(json);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return null;
        }
    }

    /**
     * Save MAC to code string
     */
    static toCode(mac, includeMACImport = false) {
        const code = mac.toCode(0);
        if (includeMACImport) {
            return `import { MAC } from './modules/mac/MACCore.js';\n\n${code}`;
        }
        return code;
    }

    /**
     * Load MAC from code string
     */
    static fromCode(codeString) {
        return MACLibrary.fromCode(codeString);
    }

    /**
     * Save MAC to localStorage
     */
    static saveToLocalStorage(name, mac) {
        try {
            const data = {
                name,
                json: mac.toJSON(),
                code: mac.toCode(),
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(`mac_${name}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    /**
     * Load MAC from localStorage
     */
    static loadFromLocalStorage(name) {
        try {
            const data = localStorage.getItem(`mac_${name}`);
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            return MAC.fromJSON(parsed.json);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }

    /**
     * Get all saved MAC names from localStorage
     */
    static getAllSavedNames() {
        const names = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('mac_')) {
                names.push(key.substring(4));
            }
        }
        return names;
    }

    /**
     * Delete MAC from localStorage
     */
    static deleteFromLocalStorage(name) {
        localStorage.removeItem(`mac_${name}`);
    }

    /**
     * Export MAC as downloadable JSON file
     */
    static exportAsJSON(mac, filename) {
        const json = this.toJSON(mac);
        const blob = new Blob([json], { type: 'application/json' });
        this._downloadBlob(blob, `${filename}.json`);
    }

    /**
     * Export MAC as downloadable JavaScript file
     */
    static exportAsCode(mac, filename) {
        const code = this.toCode(mac, true);
        const blob = new Blob([code], { type: 'text/javascript' });
        this._downloadBlob(blob, `${filename}.js`);
    }

    /**
     * Import MAC from file
     */
    static async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    let mac;
                    
                    if (file.name.endsWith('.json')) {
                        mac = this.fromJSON(content);
                    } else if (file.name.endsWith('.js')) {
                        // Extract the MAC definition from the code
                        const codeMatch = content.match(/new MAC\([^)]+\)(?:\s*\.[^;]+)*/s);
                        if (codeMatch) {
                            mac = this.fromCode(codeMatch[0]);
                        }
                    }
                    
                    if (mac) {
                        resolve(mac);
                    } else {
                        reject(new Error('Could not parse MAC from file'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    /**
     * Helper to download blob as file
     */
    static _downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Export all templates from MACLibrary
     */
    static exportAllTemplates() {
        const templates = {};
        const names = MACLibrary.getAll();
        
        for (const name of names) {
            const mac = MACLibrary.get(name);
            templates[name] = mac.toJSON();
        }
        
        const json = JSON.stringify(templates, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        this._downloadBlob(blob, 'mac-templates.json');
    }

    /**
     * Import templates into MACLibrary
     */
    static importTemplates(jsonString) {
        try {
            const templates = JSON.parse(jsonString);
            let count = 0;
            
            for (const [name, json] of Object.entries(templates)) {
                const mac = MAC.fromJSON(json);
                MACLibrary.register(name, mac);
                count++;
            }
            
            return count;
        } catch (error) {
            console.error('Error importing templates:', error);
            return 0;
        }
    }
}

/**
 * MACAssetManager - Manage a collection of MAC assets
 */
export class MACAssetManager {
    constructor() {
        this.assets = new Map();
    }

    /**
     * Add an asset
     */
    add(name, mac, metadata = {}) {
        this.assets.set(name, {
            mac,
            metadata: {
                ...metadata,
                createdAt: metadata.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        });
    }

    /**
     * Get an asset
     */
    get(name) {
        const asset = this.assets.get(name);
        return asset ? asset.mac.clone() : null;
    }

    /**
     * Remove an asset
     */
    remove(name) {
        return this.assets.delete(name);
    }

    /**
     * List all assets
     */
    list() {
        return Array.from(this.assets.keys());
    }

    /**
     * Get asset with metadata
     */
    getWithMetadata(name) {
        return this.assets.get(name);
    }

    /**
     * Search assets by metadata
     */
    search(query) {
        const results = [];
        for (const [name, asset] of this.assets) {
            if (name.toLowerCase().includes(query.toLowerCase()) ||
                (asset.metadata.tags && asset.metadata.tags.some(t => 
                    t.toLowerCase().includes(query.toLowerCase())))) {
                results.push(name);
            }
        }
        return results;
    }

    /**
     * Export all assets
     */
    export() {
        const data = {};
        for (const [name, asset] of this.assets) {
            data[name] = {
                mac: asset.mac.toJSON(),
                metadata: asset.metadata
            };
        }
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import assets
     */
    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            let count = 0;
            
            for (const [name, asset] of Object.entries(data)) {
                const mac = MAC.fromJSON(asset.mac);
                this.add(name, mac, asset.metadata);
                count++;
            }
            
            return count;
        } catch (error) {
            console.error('Error importing assets:', error);
            return 0;
        }
    }

    /**
     * Save to localStorage
     */
    saveToLocalStorage(key = 'mac_asset_manager') {
        try {
            localStorage.setItem(key, this.export());
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    /**
     * Load from localStorage
     */
    loadFromLocalStorage(key = 'mac_asset_manager') {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                return this.import(data);
            }
            return 0;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return 0;
        }
    }

    /**
     * Clear all assets
     */
    clear() {
        this.assets.clear();
    }
}
