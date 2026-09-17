const PRESENTATION_ATTRS = [
  "fill",
  "stroke",
  "color",
  "opacity",
  "fill-opacity",
  "stroke-opacity",
  "stroke-width",
  "stop-color",
  "font-family",
  "font-size",
  "font-weight",
] as const;

const GRAPHIC_SELECTOR =
  "path, circle, ellipse, rect, line, polyline, polygon, text, use";

const MIN_SVG_AREA = 40 * 40;
const FRAME_PADDING = 16;
const TITLE_BLOCK = 28;
const SVG_GAP = 12;
const CONTENT_PAD = 4;

export const EXPORT_GRAPH_TITLE_ATTR = "data-export-graph-title";

export interface SvgExportBox {
  pixelWidth: number;
  pixelHeight: number;
  viewBox: string;
}

export const findExportSvgs = (root: HTMLElement): SVGSVGElement[] =>
  Array.from(root.querySelectorAll("svg")).filter((svg) => {
    const box = svg.getBoundingClientRect();
    if (box.width * box.height < MIN_SVG_AREA) {
      return false;
    }

    return Array.from(svg.querySelectorAll(GRAPHIC_SELECTOR)).some((node) => {
      const nodeRect = node.getBoundingClientRect();
      return (
        !isExportNoise(node) &&
        !isFullBleedBackground(node, nodeRect, box) &&
        (nodeRect.width >= 0.5 || nodeRect.height >= 0.5)
      );
    });
  });

export const readExportGraphTitle = (root: HTMLElement): string | undefined => {
  const title = root
    .querySelector(`[${EXPORT_GRAPH_TITLE_ATTR}]`)
    ?.textContent?.trim();
  return title || undefined;
};

/**
 * Title for a PNG: graph-only frame first, then the live card title
 * without download/dropdown chrome.
 */
export const readChartTitle = (root: HTMLElement): string | undefined => {
  const graphTitle = readExportGraphTitle(root);
  if (graphTitle) {
    return graphTitle;
  }

  const titleEl =
    root.querySelector(".pf-v6-c-card__title") ??
    root.querySelector("[class*='card__title']");
  if (!titleEl) {
    return undefined;
  }

  const clone = titleEl.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll("[data-chart-download], [data-chart-export-exclude]")
    .forEach((node) => node.remove());
  const text = clone.textContent?.replace(/\s+/g, " ").trim();
  return text || undefined;
};

const isExportNoise = (el: Element): boolean =>
  Boolean(
    el.closest(
      "button, [role='button'], [class*='button'], [class*='overflow'], [class*='tooltip']",
    ),
  );

const isFullBleedBackground = (
  node: Element,
  nodeRect: DOMRect,
  svgRect: DOMRect,
): boolean =>
  node.tagName.toLowerCase() === "rect" &&
  nodeRect.width >= svgRect.width * 0.9 &&
  nodeRect.height >= svgRect.height * 0.9;

/**
 * Tight box around painted chart/legend marks, ignoring the SVG viewport
 * (Victory ChartLegend is often 200px tall with a short row of items).
 */
export const getSvgExportBox = (svg: SVGSVGElement): SvgExportBox => {
  const svgRect = svg.getBoundingClientRect();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  svg.querySelectorAll(GRAPHIC_SELECTOR).forEach((node) => {
    const nodeRect = node.getBoundingClientRect();
    if (
      isExportNoise(node) ||
      isFullBleedBackground(node, nodeRect, svgRect) ||
      (nodeRect.width < 0.5 && nodeRect.height < 0.5)
    ) {
      return;
    }

    minX = Math.min(minX, nodeRect.left);
    minY = Math.min(minY, nodeRect.top);
    maxX = Math.max(maxX, nodeRect.right);
    maxY = Math.max(maxY, nodeRect.bottom);
  });

  if (!Number.isFinite(minX) || maxX - minX < 1 || maxY - minY < 1) {
    return {
      pixelWidth: Math.max(1, svgRect.width),
      pixelHeight: Math.max(1, svgRect.height),
      viewBox:
        svg.getAttribute("viewBox") ||
        `0 0 ${svgRect.width || 1} ${svgRect.height || 1}`,
    };
  }

  const pixelWidth = maxX - minX + CONTENT_PAD * 2;
  const pixelHeight = maxY - minY + CONTENT_PAD * 2;
  const vb = svg.viewBox?.baseVal;
  const vbX = vb?.width ? vb.x : 0;
  const vbY = vb?.width ? vb.y : 0;
  const vbW = vb?.width ? vb.width : svgRect.width || 1;
  const vbH = vb?.height ? vb.height : svgRect.height || 1;
  const scaleX = vbW / (svgRect.width || 1);
  const scaleY = vbH / (svgRect.height || 1);
  const viewX = vbX + (minX - CONTENT_PAD - svgRect.left) * scaleX;
  const viewY = vbY + (minY - CONTENT_PAD - svgRect.top) * scaleY;

  return {
    pixelWidth,
    pixelHeight,
    viewBox: `${viewX} ${viewY} ${pixelWidth * scaleX} ${pixelHeight * scaleY}`,
  };
};

const inlineComputedPresentation = (source: Element, clone: Element): void => {
  const computed = window.getComputedStyle(source);
  for (const prop of PRESENTATION_ATTRS) {
    const value = computed.getPropertyValue(prop).trim();
    if (
      value &&
      value !== "none" &&
      value !== "normal" &&
      !value.includes("var(")
    ) {
      clone.setAttribute(prop, value);
    }
  }

  const sourceChildren = Array.from(source.children);
  const cloneChildren = Array.from(clone.children);
  sourceChildren.forEach((child, index) => {
    const clonedChild = cloneChildren[index];
    if (clonedChild) {
      inlineComputedPresentation(child, clonedChild);
    }
  });
};

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob || blob.size === 0) {
        reject(new Error("Failed to capture chart as PNG"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });

const loadSvgImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to capture chart as PNG"));
    image.src = url;
  });

const rasterizeSvg = async (
  svg: SVGSVGElement,
  scale: number,
): Promise<{ image: HTMLImageElement; width: number; height: number }> => {
  const exportBox = getSvgExportBox(svg);
  const clone = svg.cloneNode(true) as SVGSVGElement;
  inlineComputedPresentation(svg, clone);
  clone
    .querySelectorAll(
      "button, [role='button'], [class*='button'], [class*='overflow'], [class*='tooltip']",
    )
    .forEach((node) => node.remove());

  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(exportBox.pixelWidth));
  clone.setAttribute("height", String(exportBox.pixelHeight));
  clone.setAttribute("viewBox", exportBox.viewBox);
  clone.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const xml = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(
    new Blob([xml], { type: "image/svg+xml;charset=utf-8" }),
  );

  try {
    const image = await loadSvgImage(url);
    return {
      image,
      width: exportBox.pixelWidth * scale,
      height: exportBox.pixelHeight * scale,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const svgsToPngBlob = async (
  svgs: SVGSVGElement[],
  scale: number,
  backgroundColor: string,
  title?: string,
): Promise<Blob> => {
  if (svgs.length === 0) {
    throw new Error("Failed to capture chart as PNG");
  }

  const parts = await Promise.all(svgs.map((svg) => rasterizeSvg(svg, scale)));
  const padding = FRAME_PADDING * scale;
  const titleHeight = title ? TITLE_BLOCK * scale : 0;
  const gap = SVG_GAP * scale;
  const frameWidth = 720 * scale;
  const contentWidth = Math.max(
    frameWidth - padding * 2,
    ...parts.map((part) => part.width),
  );
  const contentHeight =
    parts.reduce((sum, part) => sum + part.height, 0) +
    gap * Math.max(0, parts.length - 1);

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(contentWidth + padding * 2);
  canvas.height = Math.ceil(padding + titleHeight + contentHeight + padding);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to capture chart as PNG");
  }

  context.fillStyle = backgroundColor || "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  let y = padding;
  if (title) {
    context.fillStyle =
      window.getComputedStyle(svgs[0]).color || "rgb(21, 21, 21)";
    context.font = `600 ${16 * scale}px "RedHatText", "Overpass", sans-serif`;
    context.textBaseline = "top";
    context.fillText(title, padding, y);
    y += titleHeight;
  }

  for (const part of parts) {
    const x = padding + (contentWidth - part.width) / 2;
    context.drawImage(part.image, x, y, part.width, part.height);
    y += part.height + gap;
  }

  return canvasToBlob(canvas);
};
