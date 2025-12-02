class DocumentViewer {
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
    }

    async loadDocuments() {
        try {
            const user = await firebaseConfig.getCurrentUserWithVerification();
            if (!user) return;

            // Get documents accessible to user
            const snapshot = await firebaseConfig.db
                .collection(firebaseConfig.collections.DOCUMENTS)
                .where('accessLevel', 'in', this.getAllowedAccessLevels(user.role))
                .orderBy('uploadDate', 'desc')
                .get();

            this.documents = [];
            snapshot.forEach(doc => {
                this.documents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.renderDocumentList();
            
            // Load first document if available
            if (this.documents.length > 0) {
                await this.loadDocument(this.documents[0].id);
            }

        } catch (error) {
            console.error('Error loading documents:', error);
        }
    }

    getAllowedAccessLevels(userRole) {
        const levels = [firebaseConfig.ACCESS_LEVELS.PUBLIC];
        
        if (userRole === firebaseConfig.USER_ROLES.VIEWER || 
            userRole === firebaseConfig.USER_ROLES.MANAGER ||
            userRole === firebaseConfig.USER_ROLES.ADMIN) {
            levels.push(firebaseConfig.ACCESS_LEVELS.INTERNAL);
        }
        
        if (userRole === firebaseConfig.USER_ROLES.MANAGER ||
            userRole === firebaseConfig.USER_ROLES.ADMIN) {
            levels.push(firebaseConfig.ACCESS_LEVELS.CONFIDENTIAL);
        }
        
        if (userRole === firebaseConfig.USER_ROLES.ADMIN) {
            levels.push(firebaseConfig.ACCESS_LEVELS.SECRET, firebaseConfig.ACCESS_LEVELS.TOP_SECRET);
        }

        return levels;
    }

    renderDocumentList() {
        const container = document.getElementById('documentsList');
        if (!container) return;

        container.innerHTML = '';
        
        this.documents.forEach(doc => {
            const item = document.createElement('div');
            item.className = 'document-item';
            item.dataset.id = doc.id;
            
            const icon = this.getDocumentIcon(doc.type);
            const uploadDate = doc.uploadDate?.toDate().toLocaleDateString('ru-RU') || 'Неизвестно';
            
            item.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <span class="doc-icon">${icon}</span>
                    <div>
                        <div class="doc-name">${doc.name}</div>
                        <div class="doc-meta">
                            <span>${doc.type.toUpperCase()}</span>
                            <span>${uploadDate}</span>
                        </div>
                    </div>
                </div>
                <div class="doc-access" style="margin-top: 5px; font-size: 0.8em; color: ${this.getAccessLevelColor(doc.accessLevel)}">
                    ${this.getAccessLevelText(doc.accessLevel)}
                </div>
            `;

            item.onclick = () => this.loadDocument(doc.id);
            container.appendChild(item);
        });
    }

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
            [firebaseConfig.ACCESS_LEVELS.PUBLIC]: '#27ae60',
            [firebaseConfig.ACCESS_LEVELS.INTERNAL]: '#3498db',
            [firebaseConfig.ACCESS_LEVELS.CONFIDENTIAL]: '#f39c12',
            [firebaseConfig.ACCESS_LEVELS.SECRET]: '#e74c3c',
            [firebaseConfig.ACCESS_LEVELS.TOP_SECRET]: '#c0392b'
        };
        return colors[level] || '#95a5a6';
    }

    getAccessLevelText(level) {
        const texts = {
            [firebaseConfig.ACCESS_LEVELS.PUBLIC]: 'Публичный',
            [firebaseConfig.ACCESS_LEVELS.INTERNAL]: 'Внутренний',
            [firebaseConfig.ACCESS_LEVELS.CONFIDENTIAL]: 'Конфиденциально',
            [firebaseConfig.ACCESS_LEVELS.SECRET]: 'Секретно',
            [firebaseConfig.ACCESS_LEVELS.TOP_SECRET]: 'Совершенно секретно'
        };
        return texts[level] || 'Неизвестно';
    }

    async loadDocument(documentId) {
        try {
            const user = await firebaseConfig.getCurrentUserWithVerification();
            if (!user) return;

            // Check access
            const hasAccess = await firebaseConfig.verifyDocumentAccess(documentId, user.uid);
            if (!hasAccess) {
                alert('Доступ запрещен');
                await authSystem.logSecurityEvent('access_denied', user.uid, `Попытка доступа к документу ${documentId}`);
                return;
            }

            // Get document data
            const docRef = await firebaseConfig.db
                .collection(firebaseConfig.collections.DOCUMENTS)
                .doc(documentId)
                .get();

            if (!docRef.exists) {
                throw new Error('Документ не найден');
            }

            this.currentDocument = {
                id: documentId,
                ...docRef.data()
            };

            // Update UI
            this.updateDocumentInfo();
            
            // Log view
            await this.logDocumentView(documentId);

            // Load content based on type
            await this.loadDocumentContent();

        } catch (error) {
            console.error('Error loading document:', error);
            alert('Ошибка загрузки документа: ' + error.message);
        }
    }

    async loadDocumentContent() {
        const viewerArea = document.getElementById('viewer-content');
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
        const fileRef = firebaseConfig.storage.ref().child(storagePath);
        const url = await fileRef.getDownloadURL();

        if (type === 'pdf') {
            await this.loadPDF(url);
            if (pdfViewer) pdfViewer.style.display = 'block';
        } else if (['jpg', 'png', 'jpeg'].includes(type)) {
            await this.loadImage(url);
            if (imageViewer) imageViewer.style.display = 'block';
        } else {
            // For other formats, show download option
            if (unsupportedViewer) unsupportedViewer.style.display = 'block';
        }
    }

    async loadPDF(url) {
        try {
            // Using pdf.js for PDF rendering
            const loadingTask = pdfjsLib.getDocument(url);
            this.pdfDoc = await loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;
            this.currentPage = 1;

            await this.renderPDFPage();
        } catch (error) {
            console.error('Error loading PDF:', error);
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
        await watermarkSystem.applyWatermarkToCanvas(canvas);
    }

    async loadImage(url) {
        const img = document.getElementById('imageDisplay');
        img.src = url;
        
        img.onload = async () => {
            // Apply watermark
            await watermarkSystem.applyWatermarkToImage(img);
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
            'infoLastView': this.currentDocument.lastViewed?.toDate().toLocaleString('ru-RU') || 'Не просматривался'
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async logDocumentView(documentId) {
        const user = await firebaseConfig.getCurrentUserWithVerification();
        if (!user) return;

        // Update document view count
        await firebaseConfig.db
            .collection(firebaseConfig.collections.DOCUMENTS)
            .doc(documentId)
            .update({
                lastViewed: firebaseConfig.getCurrentTimestamp(),
                viewCount: firebase.firestore.FieldValue.increment(1)
            });

        // Log to audit
        await authSystem.logActivity('document_view', `Просмотр документа: ${this.currentDocument.name}`);
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

    filterDocuments(searchTerm) {
        const items = document.querySelectorAll('.document-item');
        items.forEach(item => {
            const name = item.querySelector('.doc-name').textContent.toLowerCase();
            const shouldShow = name.includes(searchTerm.toLowerCase());
            item.style.display = shouldShow ? 'flex' : 'none';
        });
    }

    filterByCategory(category) {
        // Implement category filtering
        console.log('Filter by category:', category);
    }

    // Viewer controls
    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel + 0.25, 3);
        this.updateZoom();
        this.renderPDFPage();
    }

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel - 0.25, 0.5);
        this.updateZoom();
        this.renderPDFPage();
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
        
        await authSystem.logActivity('print_attempt', `Попытка печати: ${this.currentDocument.name}`);
        
        // Check if printing is allowed
        if (this.currentDocument.accessLevel === firebaseConfig.ACCESS_LEVELS.TOP_SECRET) {
            alert('Печать запрещена для документов этого уровня');
            return;
        }

        window.print();
    }

    async downloadDoc() {
        if (!this.currentDocument) return;

        await authSystem.logActivity('download_attempt', `Попытка скачивания: ${this.currentDocument.name}`);
        
        // For PDF and images, open in new tab with watermark
        if (['pdf', 'jpg', 'png', 'jpeg'].includes(this.currentDocument.type)) {
            const fileRef = firebaseConfig.storage.ref().child(this.currentDocument.storagePath);
            const url = await fileRef.getDownloadURL();
            window.open(url, '_blank');
        } else {
            // For other formats, trigger download
            this.forceDownload();
        }
    }

    async forceDownload() {
        if (!this.currentDocument) return;

        const fileRef = firebaseConfig.storage.ref().child(this.currentDocument.storagePath);
        const url = await fileRef.getDownloadURL();
        
        const link = document.createElement('a');
        link.href = url;
        link.download = this.currentDocument.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await authSystem.logActivity('document_download', `Скачивание: ${this.currentDocument.name}`);
    }
}

// Initialize document viewer
const documentViewer = new DocumentViewer();

// Global functions for HTML
function goBack() {
    window.history.back();
}

function startSessionTimer() {
    // Session timer is managed by authSystem
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
window.forceDownload = () => documentViewer.forceDownload();
