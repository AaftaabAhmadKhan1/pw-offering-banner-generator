const THEME_CONFIG = {
    basic: {
        label: "Basic",
        description: "Bright blue accenting for the entry plan banner set.",
        color: "#2F80ED",
        fillColor: "#B2DDFF",
        filePrefix: "Basic",
    },
    infinity: {
        label: "Infinity",
        description: "Fresh green accenting for the Infinity plan banner set.",
        color: "#38C793",
        fillColor: "#B8F1D5",
        filePrefix: "Infinity",
    },
    pro: {
        label: "Pro",
        description: "Bold amber accenting for the premium Pro plan banner set.",
        color: "#F4B000",
        fillColor: "#FFE29A",
        filePrefix: "Pro",
    },
};

const PLATFORM_CONFIG = {
    app: {
        label: "App",
        sectionTitle: "App Platform",
        previewWidth: 328,
        exportWidth: 1312,
        columns: 2,
        paddingX: 24,
        paddingTop: 48,
        paddingBottom: 48,
        columnGap: 32,
        rowGap: 40,
        iconSize: 64,
        iconTextGap: 28,
        textMaxWidth: 524,
    },
    web: {
        label: "Web",
        sectionTitle: "Web Platform",
        previewWidth: 530,
        exportWidth: 2120,
        columns: 3,
        paddingX: 64,
        paddingTop: 56,
        paddingBottom: 56,
        columnGap: 32,
        rowGap: 40,
        iconSize: 64,
        iconTextGap: 28,
        textMaxWidth: 551,
    },
};

const MODE_CONFIG = {
    light: {
        label: "Light Mode",
        background: "#FFFFFF",
        text: "#3E434D",
    },
    dark: {
        label: "Dark Mode",
        background: "#0B0B0F",
        text: "#F4F6FB",
    },
};

const EXPORT_STYLE = {
    font: "500 56px 'Reddit Sans'",
    lineHeight: 64,
};

let featureIdCounter = 0;
let draggedFeatureId = null;
let refs = {};

document.addEventListener("DOMContentLoaded", () => {
    refs = {
        featureList: document.getElementById("featureList"),
        featureCount: document.getElementById("featureCount"),
        themeDescription: document.getElementById("themeDescription"),
        themeBadge: document.getElementById("themeBadge"),
        modeBadge: document.getElementById("modeBadge"),
        selectionBadge: document.getElementById("selectionBadge"),
        previewSubheading: document.getElementById("previewSubheading"),
        previewToggleGroup: document.getElementById("previewToggleGroup"),
        previewBoard: document.getElementById("previewBoard"),
        emptyState: document.getElementById("emptyState"),
        downloadBtn: document.getElementById("downloadBtn"),
        addFeatureBtn: document.getElementById("addFeatureBtn"),
        form: document.getElementById("bannerForm"),
        planTheme: document.getElementById("planTheme"),
    };

    refs.addFeatureBtn.addEventListener("click", () => addFeature("", true));
    refs.downloadBtn.addEventListener("click", downloadBanners);
    refs.form.addEventListener("change", renderPreview);
    refs.featureList.addEventListener("dragover", handleFeatureDragOver);
    refs.featureList.addEventListener("drop", handleFeatureDrop);
    refs.featureList.addEventListener("dragleave", handleFeatureDragLeave);

    addFeature("", false);
    updateThemeDescription();
    renderPreview();
});

function addFeature(initialValue = "", shouldFocus = true) {
    const wrapper = document.createElement("div");
    wrapper.className = "feature-item";
    wrapper.dataset.featureId = String(featureIdCounter++);
    wrapper.draggable = true;
    wrapper.addEventListener("dragstart", handleFeatureDragStart);
    wrapper.addEventListener("dragend", handleFeatureDragEnd);

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "feature-handle";
    handle.setAttribute("aria-label", "Drag to reorder feature");
    handle.title = "Drag to reorder";
    handle.innerHTML = "<span></span><span></span>";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "feature-input";
    input.placeholder = "Enter feature description";
    input.value = initialValue;
    input.addEventListener("input", renderPreview);
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addFeature("", true);
        }
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "icon-button";
    removeButton.setAttribute("aria-label", "Remove feature");
    removeButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 7H20"></path>
            <path d="M9 7V5.5C9 4.67 9.67 4 10.5 4H13.5C14.33 4 15 4.67 15 5.5V7"></path>
            <path d="M8 10V18"></path>
            <path d="M12 10V18"></path>
            <path d="M16 10V18"></path>
            <path d="M6 7L7 19C7.08 19.91 7.84 20.6 8.75 20.6H15.25C16.16 20.6 16.92 19.91 17 19L18 7"></path>
        </svg>
    `;
    removeButton.addEventListener("click", () => removeFeature(wrapper));

    wrapper.append(handle, input, removeButton);
    refs.featureList.appendChild(wrapper);

    updateFeatureCount();
    renderPreview();

    if (shouldFocus) {
        input.focus();
    }
}

function removeFeature(featureElement) {
    featureElement.classList.add("is-removing");
    window.setTimeout(() => {
        featureElement.remove();
        updateFeatureCount();
        renderPreview();
    }, 160);
}

function getFeatureTexts() {
    return Array.from(document.querySelectorAll(".feature-input"))
        .map((input) => input.value.trim())
        .filter(Boolean);
}

function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map((input) => input.value);
}

function updateFeatureCount() {
    const count = getFeatureTexts().length;
    refs.featureCount.textContent = `${count} item${count === 1 ? "" : "s"}`;
}

function collectState() {
    return {
        platforms: getCheckedValues("platform"),
        modes: getCheckedValues("displayMode"),
        theme: refs.planTheme.value,
        features: getFeatureTexts(),
    };
}

function updateThemeDescription() {
    refs.themeDescription.textContent = THEME_CONFIG[refs.planTheme.value].description;
}

function buildCombinations(state) {
    const combos = [];
    state.platforms.forEach((platform) => {
        state.modes.forEach((mode) => {
            combos.push({ platform, mode });
        });
    });
    return combos;
}

function renderPreview() {
    updateFeatureCount();
    updateThemeDescription();

    const state = collectState();
    const theme = THEME_CONFIG[state.theme];
    const combos = buildCombinations(state);

    refs.themeBadge.textContent = `${theme.label} Plan`;
    refs.modeBadge.textContent = state.modes.length ? state.modes.map((mode) => MODE_CONFIG[mode].label.replace(" Mode", "")).join(" & ") + " Mode" : "No Mode";
    refs.selectionBadge.textContent = `${combos.length} banner${combos.length === 1 ? "" : "s"} selected`;
    refs.previewSubheading.textContent = `${theme.label} plan card set`;

    renderPreviewToggleGroup(state.platforms);

    const renderable = state.features.length > 0 && combos.length > 0;
    refs.downloadBtn.disabled = !renderable;
    refs.emptyState.hidden = renderable;

    clearPreviewSections();

    if (!renderable) {
        return;
    }

    state.platforms.forEach((platform) => {
        const section = document.createElement("section");
        section.className = "preview-section";

        const heading = document.createElement("h3");
        heading.className = "preview-section-title";
        heading.textContent = PLATFORM_CONFIG[platform].sectionTitle;

        section.appendChild(heading);

        state.modes.forEach((mode) => {
            const cardWrap = document.createElement("div");
            cardWrap.className = "preview-card-wrap";

            const modeLabel = document.createElement("p");
            modeLabel.className = "preview-mode-label";
            modeLabel.textContent = MODE_CONFIG[mode].label;

            const bannerCard = createBannerPreview(state.features, state.theme, mode, platform);
            cardWrap.append(modeLabel, bannerCard);
            section.appendChild(cardWrap);
        });

        refs.previewBoard.appendChild(section);
    });
}

function clearPreviewSections() {
    refs.previewBoard.querySelectorAll(".preview-section").forEach((section) => section.remove());
}

function renderPreviewToggleGroup(platforms) {
    refs.previewToggleGroup.innerHTML = "";
    if (platforms.length <= 1) {
        return;
    }

    platforms.forEach((platform) => {
        const chip = document.createElement("span");
        chip.className = "preview-mini-chip";
        chip.textContent = PLATFORM_CONFIG[platform].label;
        refs.previewToggleGroup.appendChild(chip);
    });
}

function createBannerPreview(features, themeKey, modeKey, platformKey) {
    const canvas = renderBannerToCanvas(features, themeKey, modeKey, platformKey);
    canvas.className = "banner-canvas-preview";
    canvas.dataset.mode = modeKey;
    canvas.dataset.platform = platformKey;
    canvas.style.width = `${PLATFORM_CONFIG[platformKey].previewWidth}px`;
    return canvas;
}

function downloadBanners() {
    const state = collectState();
    const combos = buildCombinations(state);

    if (!state.features.length || combos.length === 0) {
        return;
    }

    combos.forEach((combo, index) => {
        const canvas = renderBannerToCanvas(state.features, state.theme, combo.mode, combo.platform);
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `${THEME_CONFIG[state.theme].filePrefix}-${capitalize(combo.platform)}-${combo.mode}-banner.png`;

        window.setTimeout(() => {
            link.click();
        }, index * 180);
    });

    const originalLabel = refs.downloadBtn.textContent;
    refs.downloadBtn.textContent = "Exported";
    refs.downloadBtn.disabled = true;

    window.setTimeout(() => {
        refs.downloadBtn.textContent = originalLabel;
        refs.downloadBtn.disabled = false;
    }, 1400);
}

function renderBannerToCanvas(features, themeKey, modeKey, platformKey) {
    const platform = PLATFORM_CONFIG[platformKey];
    const canvas = document.createElement("canvas");
    canvas.width = platform.exportWidth;
    const ctx = canvas.getContext("2d");
    const layout = measureBannerLayout(ctx, features, platformKey);
    canvas.height = layout.height;

    const theme = THEME_CONFIG[themeKey];
    const mode = MODE_CONFIG[modeKey];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = mode.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (modeKey === "light") {
        ctx.fillStyle = "rgba(24, 39, 75, 0.04)";
        ctx.fillRect(0, canvas.height - 2, canvas.width, 2);
    } else {
        const glow = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        glow.addColorStop(0, "rgba(255,255,255,0.02)");
        glow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.textBaseline = "top";
    ctx.font = EXPORT_STYLE.font;

    layout.items.forEach((item) => {
        drawStar(ctx, item.iconX, item.iconY, platform.iconSize / 2, theme.color, theme.fillColor);
        ctx.fillStyle = mode.text;
        item.lines.forEach((line, lineIndex) => {
            ctx.fillText(line, item.textX, item.textY + lineIndex * EXPORT_STYLE.lineHeight);
        });
    });

    return canvas;
}

function measureBannerLayout(ctx, features, platformKey) {
    const platform = PLATFORM_CONFIG[platformKey];
    const visible = features.slice(0, 6);
    const columns = platform.columns;
    const columnWidth = (platform.exportWidth - platform.paddingX * 2 - platform.columnGap * (columns - 1)) / columns;

    ctx.font = EXPORT_STYLE.font;

    const rows = [];
    for (let index = 0; index < visible.length; index += columns) {
        rows.push(visible.slice(index, index + columns));
    }

    const items = [];
    let currentY = platform.paddingTop;

    rows.forEach((rowFeatures) => {
        const measured = rowFeatures.map((feature) => {
            const lines = wrapCanvasText(ctx, feature, platform.textMaxWidth, EXPORT_STYLE.font);
            const textHeight = lines.length * EXPORT_STYLE.lineHeight;
            return { feature, lines, textHeight };
        });

        const rowHeight = Math.max(...measured.map((entry) => entry.textHeight));

        measured.forEach((entry, col) => {
            const originX = platform.paddingX + col * (columnWidth + platform.columnGap);
            items.push({
                iconX: originX + platform.iconSize / 2,
                iconY: currentY + platform.iconSize / 2,
                textX: originX + platform.iconSize + platform.iconTextGap,
                textY: currentY,
                lines: entry.lines,
            });
        });

        currentY += rowHeight + platform.rowGap;
    });

    const height = visible.length === 0
        ? platform.paddingTop + platform.paddingBottom
        : currentY - platform.rowGap + platform.paddingBottom;

    return { items, height };
}

function drawStar(ctx, x, y, radius, color, fillColor) {
    const spikes = 5;
    const outer = radius;
    const inner = radius * 0.45;
    let rotation = Math.PI / 2 * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(x, y - outer);
    for (let spike = 0; spike < spikes; spike += 1) {
        ctx.lineTo(x + Math.cos(rotation) * outer, y + Math.sin(rotation) * outer);
        rotation += step;
        ctx.lineTo(x + Math.cos(rotation) * inner, y + Math.sin(rotation) * inner);
        rotation += step;
    }
    ctx.closePath();
    ctx.fillStyle = fillColor || hexToRgba(color, 0.32);
    ctx.fill();
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function wrapCanvasText(ctx, text, maxWidth, font) {
    ctx.font = font;
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";

    words.forEach((word) => {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width <= maxWidth || !line) {
            line = candidate;
        } else {
            lines.push(line);
            line = word;
        }
    });

    if (line) {
        lines.push(line);
    }

    return lines;
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function handleFeatureDragStart(event) {
    const feature = event.currentTarget;
    draggedFeatureId = feature.dataset.featureId;
    feature.classList.add("is-dragging");
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", draggedFeatureId);
    }
}

function handleFeatureDragEnd(event) {
    event.currentTarget.classList.remove("is-dragging");
    refs.featureList.classList.remove("is-drag-active");
    clearFeatureDropMarkers();
    draggedFeatureId = null;
    renderPreview();
}

function handleFeatureDragOver(event) {
    event.preventDefault();
    refs.featureList.classList.add("is-drag-active");
    const afterElement = getFeatureDropTarget(event.clientY);
    clearFeatureDropMarkers();

    if (afterElement) {
        afterElement.classList.add("drop-before");
    } else {
        const lastItem = refs.featureList.querySelector(".feature-item:not(.is-dragging):last-of-type");
        if (lastItem) {
            lastItem.classList.add("drop-after");
        }
    }
}

function handleFeatureDrop(event) {
    event.preventDefault();
    const draggedElement = refs.featureList.querySelector(`[data-feature-id="${draggedFeatureId}"]`);
    if (!draggedElement) {
        return;
    }

    const afterElement = getFeatureDropTarget(event.clientY);
    if (afterElement) {
        refs.featureList.insertBefore(draggedElement, afterElement);
    } else {
        refs.featureList.appendChild(draggedElement);
    }

    clearFeatureDropMarkers();
    refs.featureList.classList.remove("is-drag-active");
    renderPreview();
}

function handleFeatureDragLeave(event) {
    if (!refs.featureList.contains(event.relatedTarget)) {
        refs.featureList.classList.remove("is-drag-active");
        clearFeatureDropMarkers();
    }
}

function getFeatureDropTarget(pointerY) {
    const candidates = Array.from(refs.featureList.querySelectorAll(".feature-item:not(.is-dragging)"));
    let closest = null;
    let closestOffset = Number.NEGATIVE_INFINITY;

    candidates.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const offset = pointerY - rect.top - rect.height / 2;
        if (offset < 0 && offset > closestOffset) {
            closestOffset = offset;
            closest = item;
        }
    });

    return closest;
}

function clearFeatureDropMarkers() {
    refs.featureList.querySelectorAll(".drop-before, .drop-after").forEach((item) => {
        item.classList.remove("drop-before", "drop-after");
    });
}

function hexToRgba(hex, alpha) {
    const normalized = hex.replace("#", "");
    const value = normalized.length === 3
        ? normalized.split("").map((char) => char + char).join("")
        : normalized;
    const red = Number.parseInt(value.slice(0, 2), 16);
    const green = Number.parseInt(value.slice(2, 4), 16);
    const blue = Number.parseInt(value.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
