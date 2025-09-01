// Rshare Application JavaScript
class RshareApp {
    constructor() {
        this.files = [];
        this.currentShareId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showStatus('Ready to share files', 'info');
    }

    setupEventListeners() {
        // Mode switching
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });

        // File upload
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Copy button
        document.getElementById('copyBtn').addEventListener('click', () => this.copyShareId());

        // Download functionality
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadFile());
        document.getElementById('receiveId').addEventListener('input', (e) => this.formatReceiveId(e));
        document.getElementById('receiveId').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.downloadFile();
        });
    }

    switchMode(mode) {
        // Update buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Update content
        document.querySelectorAll('.mode-content').forEach(content => {
            content.classList.toggle('active', content.classList.contains(`${mode}-mode`));
        });

        this.showStatus(mode === 'send' ? 'Ready to send files' : 'Ready to receive files', 'info');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = '#00f2fe';
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)';
    }

    handleDrop(e) {
        e.preventDefault();
        const uploadArea = e.currentTarget;
        uploadArea.style.borderColor = '#4facfe';
        uploadArea.style.background = 'linear-gradient(135deg, rgba(79, 172, 254, 0.05) 0%, rgba(0, 242, 254, 0.05) 100%)';
        
        const files = Array.from(e.dataTransfer.files);
        this.addFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
    }

    addFiles(newFiles) {
        newFiles.forEach(file => {
            if (file.size > 5 * 1024 * 1024 * 1024) { // 5GB limit
                this.showStatus(`File ${file.name} exceeds 5GB limit`, 'error');
                return;
            }
            this.files.push(file);
        });

        this.renderFileList();
        if (this.files.length > 0) {
            this.generateShareId();
        }
    }

    renderFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item slide-in';
            fileItem.innerHTML = `
                <div class="file-icon">
                    <i class="fas ${this.getFileIcon(file.type)}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
                <button class="file-remove" onclick="app.removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.renderFileList();
        
        if (this.files.length === 0) {
            document.getElementById('shareSection').style.display = 'none';
            this.currentShareId = null;
        }
    }

    generateShareId() {
        // Generate 6-digit random ID
        this.currentShareId = Math.random().toString().substr(2, 6);
        
        document.getElementById('generatedId').textContent = this.currentShareId;
        document.getElementById('shareSection').style.display = 'block';
        
        // Generate QR code
        this.generateQRCode();
        
        this.showStatus('Share ID generated successfully', 'success');
        
        // Simulate file upload progress
        this.simulateUpload();
    }

    generateQRCode() {
        const canvas = document.getElementById('qrCanvas');
        const shareUrl = `${window.location.origin}?id=${this.currentShareId}`;
        
        QRCode.toCanvas(canvas, shareUrl, {
            width: 200,
            margin: 2,
            color: {
                dark: '#4facfe',
                light: '#ffffff'
            }
        });
    }

    simulateUpload() {
        // Simulate upload progress for demo
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.showStatus('Files uploaded successfully', 'success');
            }
        }, 200);
    }

    copyShareId() {
        const shareId = document.getElementById('generatedId').textContent;
        navigator.clipboard.writeText(shareId).then(() => {
            const copyBtn = document.getElementById('copyBtn');
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.classList.add('success-bg');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.remove('success-bg');
            }, 2000);
            
            this.showStatus('Share ID copied to clipboard', 'success');
        });
    }

    formatReceiveId(e) {
        let value = e.target.value.replace(/\D/g, ''); // Only digits
        if (value.length > 6) value = value.substr(0, 6);
        e.target.value = value;
    }

    downloadFile() {
        const receiveId = document.getElementById('receiveId').value;
        
        if (receiveId.length !== 6) {
            this.showStatus('Please enter a valid 6-digit ID', 'error');
            return;
        }

        // Simulate file download
        this.simulateDownload(receiveId);
    }

    simulateDownload(shareId) {
        const downloadProgress = document.getElementById('downloadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const fileName = document.getElementById('downloadFileName');
        
        // Show progress
        downloadProgress.style.display = 'block';
        fileName.textContent = 'Downloading: example_file.pdf';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Simulate file download
                setTimeout(() => {
                    this.createDummyDownload();
                    downloadProgress.style.display = 'none';
                    this.showStatus('File downloaded successfully', 'success');
                }, 500);
            }
            
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }, 200);
        
        this.showStatus('Connecting to sender...', 'info');
    }

    createDummyDownload() {
        // Create a dummy file for demonstration
        const content = 'This is a demo file from Rshare application.\n\nRshare features:\n- Fast file sharing\n- End-to-end encryption\n- No registration required\n- Cross-platform support';
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rshare_demo_file.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return 'fa-image';
        if (mimeType.startsWith('video/')) return 'fa-video';
        if (mimeType.startsWith('audio/')) return 'fa-music';
        if (mimeType.includes('pdf')) return 'fa-file-pdf';
        if (mimeType.includes('word')) return 'fa-file-word';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fa-file-excel';
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fa-file-powerpoint';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'fa-file-archive';
        return 'fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showStatus(message, type = 'info') {
        const statusBar = document.getElementById('statusBar');
        const statusText = document.getElementById('statusText');
        
        statusText.textContent = message;
        statusBar.className = `status-bar show ${type}`;
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            statusBar.classList.remove('show');
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RshareApp();
    
    // Check for share ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('id');
    if (shareId) {
        // Switch to receive mode and populate ID
        app.switchMode('receive');
        document.getElementById('receiveId').value = shareId;
        app.showStatus('Share ID detected from URL', 'info');
    }
});

// Add some interactive animations
document.addEventListener('DOMContentLoaded', () => {
    // Add floating animation to features
    const features = document.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        feature.style.animationDelay = `${index * 0.2}s`;
        feature.classList.add('slide-in');
    });
    
    // Add pulse animation to upload area when empty
    const uploadArea = document.getElementById('uploadArea');
    setInterval(() => {
        if (window.app && window.app.files.length === 0) {
            uploadArea.classList.add('pulse');
            setTimeout(() => uploadArea.classList.remove('pulse'), 2000);
        }
    }, 5000);
});