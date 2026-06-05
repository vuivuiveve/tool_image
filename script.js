/* ============================================================
   IMAGE STYLE EDITOR — JAVASCRIPT
   Xử lý upload ảnh, điều chỉnh border-radius & box-shadow,
   tạo mã CSS tự động, sao chép clipboard và tải ảnh.
   ============================================================ */

(function () {
  'use strict';

  // ==========================================================
  // 1. DOM REFERENCES
  // ==========================================================
  const $ = (sel) => document.querySelector(sel);

  const els = {
    // Theme
    themeToggle:     $('#themeToggle'),

    // Upload
    uploadArea:      $('#uploadArea'),
    fileInput:       $('#fileInput'),
    previewWrapper:  $('#previewWrapper'),
    previewImage:    $('#previewImage'),
    previewActions:  $('#previewActions'),
    btnChangeImage:  $('#btnChangeImage'),
    btnDownload:     $('#btnDownload'),

    // Border Radius
    borderRadius:      $('#borderRadius'),
    borderRadiusValue: $('#borderRadiusValue'),

    // Box Shadow
    shadowX:           $('#shadowX'),
    shadowXValue:      $('#shadowXValue'),
    shadowY:           $('#shadowY'),
    shadowYValue:      $('#shadowYValue'),
    shadowBlur:        $('#shadowBlur'),
    shadowBlurValue:   $('#shadowBlurValue'),
    shadowSpread:      $('#shadowSpread'),
    shadowSpreadValue: $('#shadowSpreadValue'),

    // Shadow Color & Opacity
    shadowColor:       $('#shadowColor'),
    shadowColorHex:    $('#shadowColorHex'),
    shadowOpacity:     $('#shadowOpacity'),
    shadowOpacityValue:$('#shadowOpacityValue'),

    // CSS Output
    cssCode:           $('#cssCode'),
    btnCopyCSS:        $('#btnCopyCSS'),

    // Reset
    btnReset:          $('#btnReset'),

    // Toast
    toast:             $('#toast'),
  };

  // ==========================================================
  // 2. DEFAULT VALUES
  // ==========================================================
  const DEFAULTS = {
    borderRadius: 0,
    shadowX:      0,
    shadowY:      4,
    shadowBlur:   10,
    shadowSpread: 0,
    shadowColor:  '#000000',
    shadowOpacity: 30,
  };

  // ==========================================================
  // 3. THEME (DARK / LIGHT MODE)
  // ==========================================================

  /** Khởi tạo theme từ localStorage hoặc preference hệ thống */
  function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  /** Chuyển đổi giữa dark và light mode */
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

  // ==========================================================
  // 4. UPLOAD ẢNH
  // ==========================================================

  /** Xử lý file được chọn — đọc và hiển thị preview */
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('⚠️ Vui lòng chọn file ảnh hợp lệ!');
      return;
    }

    // Giới hạn 10 MB
    if (file.size > 10 * 1024 * 1024) {
      showToast('⚠️ Ảnh quá lớn! Tối đa 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      els.previewImage.src = e.target.result;
      showPreview();
      applyStyles(); // Áp dụng styles hiện tại cho ảnh mới
    };
    reader.readAsDataURL(file);
  }

  /** Hiện preview, ẩn upload area */
  function showPreview() {
    els.uploadArea.classList.add('hidden');
    els.previewWrapper.classList.add('visible');
    els.previewActions.classList.add('visible');
  }

  /** Ẩn preview, hiện upload area (khi đổi ảnh) */
  function hidePreview() {
    els.uploadArea.classList.remove('hidden');
    els.previewWrapper.classList.remove('visible');
    els.previewActions.classList.remove('visible');
    els.previewImage.src = '';
    els.fileInput.value = '';
  }

  // — Click vào upload area → mở file dialog —
  function onUploadAreaClick() {
    els.fileInput.click();
  }

  // — Khi chọn file từ dialog —
  function onFileInputChange(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
  }

  // — Drag & Drop —
  function onDragOver(e) {
    e.preventDefault();
    els.uploadArea.classList.add('drag-over');
  }

  function onDragLeave() {
    els.uploadArea.classList.remove('drag-over');
  }

  function onDrop(e) {
    e.preventDefault();
    els.uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  // ==========================================================
  // 5. STYLE APPLICATION (Real-time)
  // ==========================================================

  /**
   * Lấy giá trị hiện tại từ các slider/input
   * và trả về object chứa tất cả style values.
   */
  function getValues() {
    return {
      borderRadius: parseInt(els.borderRadius.value),
      shadowX:      parseInt(els.shadowX.value),
      shadowY:      parseInt(els.shadowY.value),
      shadowBlur:   parseInt(els.shadowBlur.value),
      shadowSpread: parseInt(els.shadowSpread.value),
      shadowColor:  els.shadowColor.value,
      shadowOpacity: parseInt(els.shadowOpacity.value),
    };
  }

  /**
   * Chuyển đổi HEX color sang RGBA string.
   * @param {string} hex - Mã màu dạng #RRGGBB
   * @param {number} opacity - Giá trị opacity (0–100)
   * @returns {string} rgba(r, g, b, a)
   */
  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = (opacity / 100).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  /** Áp dụng styles cho preview image và cập nhật CSS output */
  function applyStyles() {
    const v = getValues();

    // Cập nhật output labels
    els.borderRadiusValue.textContent = v.borderRadius + 'px';
    els.shadowXValue.textContent      = v.shadowX + 'px';
    els.shadowYValue.textContent      = v.shadowY + 'px';
    els.shadowBlurValue.textContent   = v.shadowBlur + 'px';
    els.shadowSpreadValue.textContent = v.shadowSpread + 'px';
    els.shadowColorHex.textContent    = v.shadowColor.toUpperCase();
    els.shadowOpacityValue.textContent = v.shadowOpacity + '%';

    // Tính toán CSS values
    const borderRadiusCSS = v.borderRadius + 'px';
    const shadowRGBA = hexToRgba(v.shadowColor, v.shadowOpacity);
    const boxShadowCSS = `${v.shadowX}px ${v.shadowY}px ${v.shadowBlur}px ${v.shadowSpread}px ${shadowRGBA}`;

    // Áp dụng lên ảnh preview
    els.previewImage.style.borderRadius = borderRadiusCSS;
    els.previewImage.style.boxShadow    = boxShadowCSS;

    // Cập nhật slider track fill (gradient giả lập)
    updateSliderFills();

    // Cập nhật CSS code output
    updateCSSOutput(borderRadiusCSS, boxShadowCSS);
  }

  /** Cập nhật khối mã CSS hiển thị */
  function updateCSSOutput(borderRadius, boxShadow) {
    const code =
`.your-element {
  border-radius: ${borderRadius};
  box-shadow: ${boxShadow};
}`;
    els.cssCode.textContent = code;
  }

  /**
   * Tô màu phần "đã kéo" của slider bằng linear-gradient.
   * Áp dụng cho tất cả slider trên trang.
   */
  function updateSliderFills() {
    document.querySelectorAll('.slider').forEach((slider) => {
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      const val = parseFloat(slider.value);
      const pct = ((val - min) / (max - min)) * 100;
      slider.style.background =
        `linear-gradient(to right, var(--slider-fill) 0%, var(--slider-fill) ${pct}%, var(--slider-track) ${pct}%, var(--slider-track) 100%)`;
    });
  }

  // ==========================================================
  // 6. COPY CSS TO CLIPBOARD
  // ==========================================================
  async function copyCSS() {
    const text = els.cssCode.textContent;
    if (!text) {
      showToast('⚠️ Chưa có mã CSS để sao chép.');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('✅ Đã sao chép CSS!');
    } catch {
      // Fallback cho trình duyệt cũ
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('✅ Đã sao chép CSS!');
    }
  }

  // ==========================================================
  // 7. DOWNLOAD ẢNH ĐÃ CHỈNH SỬA
  // ==========================================================

  /**
   * Vẽ ảnh lên canvas với border-radius và box-shadow,
   * rồi trigger download.
   */
  function downloadImage() {
    const img = els.previewImage;
    if (!img.src || img.src === window.location.href) {
      showToast('⚠️ Chưa có ảnh để tải!');
      return;
    }

    const v = getValues();
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    // Tính padding chính xác cho mỗi cạnh dựa trên shadow
    // Canvas shadow không hỗ trợ spread, nên ta mô phỏng spread
    // bằng cách mở rộng vùng fill shadow
    const blur = v.shadowBlur;
    const spread = v.shadowSpread;
    const ox = v.shadowX;
    const oy = v.shadowY;

    // Padding mỗi cạnh = phần shadow tràn ra ngoài ảnh ở cạnh đó
    // Shadow tràn = blur + spread ± offset (tùy hướng)
    const padLeft   = Math.max(0, blur + spread - ox);
    const padRight  = Math.max(0, blur + spread + ox);
    const padTop    = Math.max(0, blur + spread - oy);
    const padBottom = Math.max(0, blur + spread + oy);

    const canvasW = imgW + padLeft + padRight;
    const canvasH = imgH + padTop + padBottom;

    const canvas = document.createElement('canvas');
    canvas.width  = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');

    // Nền trong suốt
    ctx.clearRect(0, 0, canvasW, canvasH);

    // Vị trí ảnh trên canvas (dịch theo padding trái/trên)
    const x = padLeft;
    const y = padTop;
    const r = v.borderRadius;

    // Canvas 2D API không có spread, nên ta mô phỏng:
    // Vẽ một rounded rect lớn hơn (mở rộng theo spread) để tạo shadow,
    // rồi clip ảnh theo rounded rect gốc
    const shadowRGBA = hexToRgba(v.shadowColor, v.shadowOpacity);

    // --- Vẽ shadow ---
    ctx.save();
    ctx.shadowOffsetX = ox;
    ctx.shadowOffsetY = oy;
    ctx.shadowBlur    = blur;
    ctx.shadowColor   = shadowRGBA;

    // Vẽ rounded rect (mở rộng theo spread) để shadow render đúng
    const sx = x - spread;
    const sy = y - spread;
    const sw = imgW + spread * 2;
    const sh = imgH + spread * 2;

    ctx.beginPath();
    roundedRect(ctx, sx, sy, sw, sh, Math.max(0, r + spread));
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();
    ctx.restore();

    // --- Xóa vùng fill đen bên trong (chỉ giữ shadow bên ngoài) ---
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    roundedRect(ctx, sx, sy, sw, sh, Math.max(0, r + spread));
    ctx.fill();
    ctx.restore();

    // --- Vẽ lại shadow lần nữa rồi clip ảnh đè lên ---
    // Bước 1: Vẽ shadow nền
    ctx.save();
    ctx.shadowOffsetX = ox;
    ctx.shadowOffsetY = oy;
    ctx.shadowBlur    = blur;
    ctx.shadowColor   = shadowRGBA;
    ctx.beginPath();
    roundedRect(ctx, sx, sy, sw, sh, Math.max(0, r + spread));
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();
    ctx.restore();

    // Bước 2: Xóa phần fill đen, chỉ giữ lại shadow
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    roundedRect(ctx, sx, sy, sw, sh, Math.max(0, r + spread));
    ctx.fill();
    ctx.restore();

    // Bước 3: Vẽ ảnh với clip bo góc đè lên (source-over)
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    roundedRect(ctx, x, y, imgW, imgH, r);
    ctx.clip();
    ctx.drawImage(img, x, y, imgW, imgH);
    ctx.restore();

    // Trigger download
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast('✅ Đã tải ảnh thành công!');
  }

  /**
   * Helper: Vẽ rounded rectangle trên Canvas 2D context.
   */
  function roundedRect(ctx, x, y, w, h, r) {
    // Đảm bảo radius không vượt quá nửa kích thước nhỏ nhất
    r = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
  }

  // ==========================================================
  // 8. RESET VỀ MẶC ĐỊNH
  // ==========================================================
  function resetAll() {
    els.borderRadius.value  = DEFAULTS.borderRadius;
    els.shadowX.value       = DEFAULTS.shadowX;
    els.shadowY.value       = DEFAULTS.shadowY;
    els.shadowBlur.value    = DEFAULTS.shadowBlur;
    els.shadowSpread.value  = DEFAULTS.shadowSpread;
    els.shadowColor.value   = DEFAULTS.shadowColor;
    els.shadowOpacity.value = DEFAULTS.shadowOpacity;
    applyStyles();
    showToast('↺ Đã đặt lại mặc định.');
  }

  // ==========================================================
  // 9. TOAST NOTIFICATION
  // ==========================================================
  let toastTimeout = null;

  function showToast(message) {
    clearTimeout(toastTimeout);
    els.toast.textContent = message;
    els.toast.classList.add('show');
    toastTimeout = setTimeout(() => {
      els.toast.classList.remove('show');
    }, 2500);
  }

  // ==========================================================
  // 10. EVENT LISTENERS
  // ==========================================================
  function bindEvents() {
    // Theme toggle
    els.themeToggle.addEventListener('click', toggleTheme);

    // Upload
    els.uploadArea.addEventListener('click', onUploadAreaClick);
    els.fileInput.addEventListener('change', onFileInputChange);
    els.uploadArea.addEventListener('dragover', onDragOver);
    els.uploadArea.addEventListener('dragleave', onDragLeave);
    els.uploadArea.addEventListener('drop', onDrop);

    // Change / Download
    els.btnChangeImage.addEventListener('click', hidePreview);
    els.btnDownload.addEventListener('click', downloadImage);

    // Sliders — lắng nghe event "input" cho real-time update
    const sliders = [
      els.borderRadius,
      els.shadowX,
      els.shadowY,
      els.shadowBlur,
      els.shadowSpread,
      els.shadowOpacity,
    ];
    sliders.forEach((slider) => {
      slider.addEventListener('input', applyStyles);
    });

    // Color picker
    els.shadowColor.addEventListener('input', applyStyles);

    // Copy CSS
    els.btnCopyCSS.addEventListener('click', copyCSS);

    // Reset
    els.btnReset.addEventListener('click', resetAll);
  }

  // ==========================================================
  // 11. INITIALIZATION
  // ==========================================================
  function init() {
    initTheme();
    bindEvents();
    applyStyles(); // Set initial CSS output & slider fills
  }

  // Chạy khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
