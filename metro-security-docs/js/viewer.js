class DocumentViewerManager {
    constructor() {
        this.currentDocument = null;
        this.documents = [];
        this.zoomLevel = 1.0;
        this.rotation = 0;
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.init();
    }

    async init() {
        await this.loadDocuments();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
    }

    async loadDocuments() {
        try {
            const user = authManager.getCurrentUser();
            if (!user) return;

            this.documents = await firebaseApp.FirebaseHelper.getDocumentsForUser(user.uid, user.role);
            this.renderDocumentList();
            
            if (this.documents.length > 0) {
                await this.loadDocument(this.documents[0].id);
            }

        } catch (error) {
            console.error('Error loading documents:', error);
            this.showError('Ошибка загрузки документов');
        }
    }

    renderDocumentList() {
        const container = document.getElementById('documentsList');
        if (!container) return;

        container.innerHTML = '';
        
        this.documents.forEach(doc => {
            const item = this.createDocumentItem(doc);
            container.appendChild(item);
        });
    }

    createDocumentItem(doc) {
        const item = document.createElement('div');
        item.className = 'document-item';
        item.dataset.id = doc.id;
        
        const icon = this.getDocumentIcon(doc.type);
        const uploadDate = doc.uploadDate?.toDate().toLocaleDateString('ru-RU') || 'Неизвестно';
        const size = this.formatFileSize(doc.size);
        
        item.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span class="doc-icon">${icon}</span>
                <div style="flex: 1;">
                    <div class="doc-name">${doc.name}</div>
                    <div class="doc-meta">
                        <span>${doc.type.toUpperCase()} • ${size}</span>
                        <span>${uploadDate}</span>
                    </div>
                </div>
            </div>
            <div class="doc-access" style="margin-top: 5px; font-size: 0.8em; color: ${this.getAccessLevelColor(doc.accessLevel)}">
                ${this.getAccessLevelText(doc.accessLevel)}
            </div>
        `;

        item.onclick = () => this.loadDocument(doc.id);
        return item;
    }

    async loadDocument(documentId) {
        try {
            const user = authManager.getCurrentUser();
            if (!user) return;

            // Check access
            const hasAccess = await firebaseApp.FirebaseHelper.checkDocumentAccess(documentId, user.uid);
            if (!hasAccess) {
                await authManager.logSecurityEvent('access_denied', user.uid, `Попытка доступа к документу ${documentId}`);
                this.showError('Доступ запрещен');
                return;
            }

            // Get document data
            const docRef = await firebaseApp.collections.DOCUMENTS.doc(documentId).get();
            if (!docRef.exists) {
                throw new Error('Документ не найден');
            }

            this.currentDocument = {
                id: documentId,
                ...docRef.data()
            };

            // Update UI
            this.updateDocumentInfo();
            
            // Update active item
            this.updateActiveDocumentItem(documentId);

            // Load content
            await this.loadDocumentContent();

            // Increment view count
            await firebaseApp.FirebaseHelper.incrementDocumentView(documentId);

            // Log view
            await authManager.logAudit('document_view', `Просмотр документа: ${this.currentDocument.name}`);

        } catch (error) {
            console.error('Error loading document:', error);
            this.showError('Ошибка загрузки документа: ' + error.message);
        }
    }

    async loadDocumentContent() {
        const pdfViewer = document.getElementById('pdfViewer');
        const imageViewer = document.getElementById('imageViewer');
        const unsupportedViewer = document.getElementById('unsupportedViewer');

        // Hide all viewers
        [pdfViewer, imageViewer, unsupportedViewer].forEach(viewer => {
            if (viewer) viewer.style.display = 'none';
        });

        if (!this.currentDocument) return;

        const { type, storagePath } = this.currentDocument;

        // Get download URL
        const fileRef = firebaseApp.storage.ref().child(storagePath);
        const url = await fileRef.getDownloadURL();

        if (type === 'pdf') {
            await this.loadPDF(url);
            if (pdfViewer) pdfViewer.style.display = 'block';
        } else if (['jpg', 'png', 'jpeg'].includes(type)) {
            await this.loadImage(url);
            if (imageViewer) imageViewer.style.display = 'block';
        } else {
            // For other formats, show download option
            if (unsupportedViewer) {
                unsupportedViewer.style.display = 'block';
                document.getElementById('unsupportedFileName').textContent = this.currentDocument.name;
            }
        }
    }

    async loadPDF(url) {
        try {
            // Using pdf.js
            const loadingTask = pdfjsLib.getDocument(url);
            this.pdfDoc = await loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;
            this.currentPage = 1;

            await this.renderPDFPage();
        } catch (error) {
            console.error('Error loading PDF:', error);
            this.showError('Ошибка загрузки PDF');
        }
    }

    async renderPDFPage() {
        const canvas = document.getElementById('pdfCanvas');
        const ctx = canvas.getContext('2d');

        const page = await this.pdfDoc.getPage(this.currentPage);
        const viewport = page.getViewport({ scale: this.zoomLevel * 1.5 });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;

        // Apply watermark
        await watermarkManager.applyWatermarkToCanvas(canvas, authManager.getCurrentUser());
    }

    async loadImage(url) {
        const img = document.getElementById('imageDisplay');
        img.src = url;
        
        img.onload = async () => {
            // Apply watermark
            await watermarkManager.applyWatermarkToImage(img, authManager.getCurrentUser());
        };
    }

    updateDocumentInfo() {
        if (!this.currentDocument) return;

        const fields = {
            'documentTitle': this.currentDocument.name,
            'infoTitle': this.currentDocument.name,
            'infoType': this.currentDocument.type.toUpperCase(),
            'infoSize': this.formatFileSize(this.currentDocument.size),
            'infoDate': this.currentDocument.uploadDate?.toDate().toLocaleDateString('ru-RU') || 'Неизвестно',
            'infoAccess': this.getAccessLevelText(this.currentDocument.accessLevel),
            'infoLastView': this.currentDocument.lastViewed?.toDate().toLocaleString('ru-RU') || 'Не просматривался',
            'infoViews': this.currentDocument.viewCount || 0
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    updateActiveDocumentItem(documentId) {
        // Remove active class from all items
        document.querySelectorAll('.document-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current item
        const activeItem = document.querySelector(`.document-item[data-id="${documentId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('docSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterDocuments(e.target.value);
            });
        }

        // Categories
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterByCategory(e.target.textContent);
            });
        });
    }

    setupRealTimeUpdates() {
        // Listen for new documents
        const user = authManager.getCurrentUser();
        if (!user) return;

        firebaseApp.collections.DOCUMENTS
            .where('accessLevel', 'in', firebaseApp.FirebaseHelper.getAllowedAccessLevels(user.role))
            .orderBy('uploadDate', 'desc')
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const doc = {
                            id: change.doc.id,
                            ...change.doc.data()
                        };
                        
                        // Add to local array
                        this.documents.unshift(doc);
                        
                        // Update UI
                        this.renderDocumentList();
                    }
                });
            });
    }

    filterDocuments(searchTerm) {
        const items = document.querySelectorAll('.document-item');
        items.forEach(item => {
            const name = item.querySelector('.doc-name').textContent.toLowerCase();
            const shouldShow = name.includes(searchTerm.toLowerCase());
            item.style.display = shouldShow ? 'flex' : 'none';
        });
    }

    filterByCategory(category) {
        const items = document.querySelectorAll('.document-item');
        
        items.forEach(item => {
            const accessLevel = item.querySelector('.doc-access').textContent;
            const shouldShow = category === 'Все документы' || 
                             this.getAccessLevelFromText(accessLevel) === category;
            
            item.style.display = shouldShow ? 'flex' : 'none';
        });
    }

    // Utility functions
    getDocumentIcon(type) {
        const icons = {
            'pdf': '📕',
            'docx': '📘',
            'doc': '📗',
            'xlsx': '📊',
            'pptx': '📑',
            'jpg': '🖼️',
            'png': '🖼️',
            'jpeg': '🖼️'
        };
        return icons[type] || '📄';
    }

    getAccessLevelColor(level) {
        const colors = {
            [firebaseApp.ACCESS_LEVELS.PUBLIC]: '#27ae60',
            [firebaseApp.ACCESS_LEVELS.INTERNAL]: '#3498db',
            [firebaseApp.ACCESS_LEVELS.CONFIDENTIAL]: '#f39c12',
            [firebaseApp.ACCESS_LEVELS.SECRET]: '#e74c3c',
            [firebaseApp.ACCESS_LEVELS.TOP_SECRET]: '#c0392b'
        };
        return colors[level] || '#95a5a6';
    }

    getAccessLevelText(level) {
        const texts = {
            [firebaseApp.ACCESS_LEVELS.PUBLIC]: 'Публичный',
            [firebaseApp.ACCESS_LEVELS.INTERNAL]: 'Внутренний',
            [firebaseApp.ACCESS_LEVELS.CONFIDENTIAL]: 'Конфиденциально',
            [firebaseApp.ACCESS_LEVELS.SECRET]: 'Секретно',
            [firebaseApp.ACCESS_LEVELS.TOP_SECRET]: 'Совершенно секретно'
        };
        return texts[level] || 'Неизвестно';
    }

    getAccessLevelFromText(text) {
        const reverseMap = {
            'Публичный': firebaseApp.ACCESS_LEVELS.PUBLIC,
            'Внутренний': firebaseApp.ACCESS_LEVELS.INTERNAL,
            'Конфиденциально': firebaseApp.ACCESS_LEVELS.CONFIDENTIAL,
            'Секретно': firebaseApp.ACCESS_LEVELS.SECRET,
            'Совершенно секретно': firebaseApp.ACCESS_LEVELS.TOP_SECRET
        };
        return reverseMap[text] || text;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Add to viewer
        const viewer = document.querySelector('.viewer-content');
        if (viewer) {
            viewer.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }

    // Viewer controls
    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel + 0.25, 3);
        this.updateZoom();
        if (this.pdfDoc) this.renderPDFPage();
    }

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel - 0.25, 0.5);
        this.updateZoom();
        if (this.pdfDoc) this.renderPDFPage();
    }

    updateZoom() {
        const zoomElement = document.getElementById('zoomLevel');
        if (zoomElement) {
            zoomElement.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
    }

    rotateDoc() {
        this.rotation = (this.rotation + 90) % 360;
        const img = document.getElementById('imageDisplay');
        if (img) {
            img.style.transform = `rotate(${this.rotation}deg)`;
        }
    }

    async printDoc() {
        if (!this.currentDocument) return;
        
        await authManager.logAudit('print_attempt', `Попытка печати: ${this.currentDocument.name}`);
        
        // Check if printing is allowed
        if (this.currentDocument.accessLevel === firebaseApp.ACCESS_LEVELS.TOP_SECRET) {
            this.showError('Печать запрещена для документов этого уровня');
            return;
        }

        window.print();
    }

    async downloadDoc() {
        if (!this.currentDocument) return;

        await authManager.logAudit('download_attempt', `Попытка скачивания: ${this.currentDocument.name}`);
        
        const fileRef = firebaseApp.storage.ref().child(this.currentDocument.storagePath);
        const url = await fileRef.getDownloadURL();
        
        // For security, open in new tab with watermark
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <html>
                <head>
                    <title>${this.currentDocument.name}</title>
                    <style>
                        body { margin: 0; padding: 20px; background: #f5f5f5; }
                        .watermarked { opacity: 0.1; position: fixed; z-index: 1000; }
                    </style>
                </head>
                <body>
                    <div class="watermarked">${authManager.getCurrentUser()?.email} | ${new Date().toLocaleString()} | Metro Security</div>
                    <iframe src="${url}" width="100%" height="95%" style="border: none;"></iframe>
                </body>
            </html>
        `);
    }
}

// Initialize document viewer
const documentViewer = new DocumentViewerManager();

// Global functions for HTML
function goBack() {
    window.history.back();
}

function startSessionTimer() {
    // Managed by authManager
}

// Export
window.documentViewer = documentViewer;
window.goBack = goBack;
window.startSessionTimer = startSessionTimer;
window.zoomIn = () => documentViewer.zoomIn();
window.zoomOut = () => documentViewer.zoomOut();
window.rotateDoc = () => documentViewer.rotateDoc();
window.printDoc = () => documentViewer.printDoc();
window.downloadDoc = () => documentViewer.downloadDoc();
