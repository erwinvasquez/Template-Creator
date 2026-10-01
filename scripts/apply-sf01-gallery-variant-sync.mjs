#!/usr/bin/env node
/**
 * SF-01 — sustituye estado local galleryManual/galleryIndex por hook canónico del contrato.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const TEMPLATES = [
  "fashion-atelier-v1",
  "fashion-celestine-v1",
  "fashion-lumen-v1",
  "fashion-velvet-v1",
  "fashion-nova-v1",
  "jewelry-orion-v1",
  "academy-voxa-v1",
  "food-trattoria-v1",
  "food-cantina-v1",
  "food-patisserie-v1",
];

const HOOK_IMPORT =
  "  useProductDetailGalleryVariantSync,\n} from \"@shopenlinea/commerce-runtime-contract\";";

function patchImports(content) {
  if (content.includes("useProductDetailGalleryVariantSync")) return content;
  return content.replace(
    /} from "@shopenlinea\/commerce-runtime-contract";/,
    HOOK_IMPORT,
  );
}

function patchGalleryManualGroup(content) {
  let c = content;
  c = c.replace(
    /  const \[galleryIndex, setGalleryIndex\] = useState\(0\);\n  const \[galleryManual, setGalleryManual\] = useState\(false\);\n/,
    "",
  );
  c = c.replace(
    /  const selected =\n    product\.variants\.find\(\(v\) => v\.id === product\.selectedVariantId\) ??\n    product\.variants\[0\];\n\n/,
    "",
  );
  const hookBlock = `  const {
    activeGalleryIndex: galleryIndex,
    mainImage,
    onGalleryItemClick,
    selectedVariant: selected,
  } = useProductDetailGalleryVariantSync({
    product,
    onSelectVariant: actions.selectVariant,
    pickerVariants,
    dimensions,
    maxAddQtyMap,
  });

`;
  if (!c.includes("useProductDetailGalleryVariantSync({")) {
    c = c.replace(
      /(  const maxAddQtyMap = useMemo\([\s\S]*?\);\n)/,
      `$1${hookBlock}`,
    );
  }
  c = c.replace(
    /  const mainImage = useMemo\(\(\) => \{[\s\S]*?\}, \[[\s\S]*?\]\);\n\n/,
    "",
  );
  c = c.replace(
    /  useEffect\(\(\) => \{\n    setQuantity\(1\);\n    setLocalError\(null\);\n    setGalleryManual\(false\);\n    if \(selected\) \{[\s\S]*?\n    \}\n  \}, \[selected\?\.id\]\); \/\/ eslint-disable-line react-hooks\/exhaustive-deps\n\n/,
    `  useEffect(() => {
    setQuantity(1);
    setLocalError(null);
  }, [selected?.id]);

`,
  );
  c = c.replace(
    /onClick=\{\(\) => \{\n                            setGalleryIndex\(i\);\n                            setGalleryManual\(true\);\n                          \}\}/g,
    "onClick={() => onGalleryItemClick(i)}",
  );
  c = c.replace(
    /onClick=\{\(\) => \{\n                          setGalleryIndex\(i\);\n                          setGalleryManual\(true\);\n                        \}\}/g,
    "onClick={() => onGalleryItemClick(i)}",
  );
  c = c.replace(
    /onClick=\{\(\) => setGalleryIndex\(i\)\}/g,
    "onClick={() => onGalleryItemClick(i)}",
  );
  return c;
}

function patchAcademy(content) {
  let c = content;
  if (c.includes("useProductDetailGalleryVariantSync")) return c;
  c = c.replace(
    /  const \[galleryIndex, setGalleryIndex\] = useState\(0\);\n/,
    "",
  );
  c = c.replace(
    /  const selected =\n    product\.variants\.find\(\(v\) => v\.id === product\.selectedVariantId\) ??\n    product\.variants\[0\];\n\n/,
    "",
  );
  const hookBlock = `  const {
    activeGalleryIndex: galleryIndex,
    mainImage,
    onGalleryItemClick,
    selectedVariant: selected,
  } = useProductDetailGalleryVariantSync({
    product,
    onSelectVariant: actions.selectVariant,
    pickerVariants,
    dimensions,
    maxAddQtyMap,
  });

`;
  if (!c.includes("useProductDetailGalleryVariantSync({")) {
    c = c.replace(
      /(  const maxAddQtyMap = useMemo\([\s\S]*?\);\n)/,
      `$1${hookBlock}`,
    );
  }
  c = c.replace(
    /  const mainImage =\n    product\.gallery\[galleryIndex\] \?\? product\.gallery\[0\] \?\? null;\n\n/,
    "",
  );
  c = c.replace(
    /onClick=\{\(\) => setGalleryIndex\(i\)\}/g,
    "onClick={() => onGalleryItemClick(i)}",
  );
  return c;
}

for (const id of TEMPLATES) {
  const file = path.join(
    root,
    "templates",
    id,
    "src/components/commerce/ProductDetailCommerceView.tsx",
  );
  if (!fs.existsSync(file)) {
    console.error("Missing", file);
    process.exit(1);
  }
  let content = fs.readFileSync(file, "utf8");
  content = patchImports(content);
  content =
    id === "academy-voxa-v1"
      ? patchAcademy(content)
      : patchGalleryManualGroup(content);
  if (!content.includes("useProductDetailGalleryVariantSync")) {
    console.error("Patch failed for", id);
    process.exit(1);
  }
  fs.writeFileSync(file, content);
  console.log("patched", id);
}
