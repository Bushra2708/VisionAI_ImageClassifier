// ==========================================================================
// DOM ELEMENT QUERIES
// ==========================================================================

const htmlEl = document.documentElement;
const themeToggleBtn = document.getElementById("themeToggleBtn");

const uploadPanel = document.getElementById("uploadPanel");
const uploadArea = document.getElementById("uploadArea");
const imageInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");

const previewContainer = document.getElementById("previewContainer");
const previewImage = document.getElementById("previewImage");
const removeBtn = document.getElementById("removeBtn");
const fileDetails = document.getElementById("fileDetails");

const predictBtn = document.getElementById("predictBtn");
const loaderContainer = document.getElementById("loaderContainer");
const resultCard = document.getElementById("resultCard");
const predictionText = document.getElementById("predictionText");
const resultDescription = document.getElementById("resultDescription");
const resetBtn = document.getElementById("resetBtn");

const categoryCards = document.querySelectorAll(".category-card");

let selectedFile = null;

// ==========================================================================
// THEME CONTROLLER (Persisted in localStorage)
// ==========================================================================

function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        htmlEl.setAttribute("data-theme", savedTheme);
    } else {
        // System preference default
        const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        htmlEl.setAttribute("data-theme", systemPrefersLight ? "light" : "dark");
    }
}

themeToggleBtn.addEventListener("click", () => {
    const currentTheme = htmlEl.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    htmlEl.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
});

// Initialize on execution
initTheme();

// ==========================================================================
// DRAG AND DROP & FILE PICKER INTERACTION
// ==========================================================================

// Clicks on dashed area trigger internal input
uploadArea.addEventListener("click", () => {
    imageInput.click();
});

uploadBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Avoid double picker trigger from parent click
    imageInput.click();
});

// Drag over styles
["dragenter", "dragover"].forEach(eventName => {
    uploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add("drag-over");
    }, false);
});

["dragleave", "drop"].forEach(eventName => {
    uploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove("drag-over");
    }, false);
});

// File Dropped
uploadArea.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        handleFileSelection(files[0]);
    }
});

// File Dialog selected
imageInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
    }
});

// Process Selected File
function handleFileSelection(file) {
    if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file.");
        return;
    }
    
    selectedFile = file;

    // Show image preview
    const reader = new FileReader();
    reader.onload = function(event) {
        previewImage.src = event.target.result;
        
        // Dynamic file details display
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
        fileDetails.innerText = `${file.name} (${sizeInMb} MB)`;

        // Adjust visibility
        uploadArea.classList.add("hidden");
        previewContainer.classList.remove("hidden");
        predictBtn.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
}

// Remove File / Reset Upload Area
removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clearUploadState();
});

function clearUploadState() {
    selectedFile = null;
    imageInput.value = "";
    previewImage.src = "";
    fileDetails.innerText = "";
    
    uploadArea.classList.remove("hidden");
    previewContainer.classList.add("hidden");
    predictBtn.classList.add("hidden");
}

// ==========================================================================
// PREDICTION DESCRIPTIONS MAPPING
// ==========================================================================

const categoryDescriptions = {
    "Airplane": "The network classified this object as an Airplane based on structural wing silhouettes, jet propulsion units, and aerodynamic outlines commonly associated with flight systems.",
    "Automobile": "The network classified this object as an Automobile. High-contrast indicators of motorized land vehicles, including tires, cabin curves, and ground-level chassis outlines, were detected.",
    "Bird": "The network classified this object as a Bird, matching natural features such as wing geometry, feathers, beak structures, and avian silhouettes.",
    "Cat": "The network classified this object as a Cat. Feline structural vectors including ear shapes, facial whisker layout, and mammalian outlines were detected in the pixel map.",
    "Deer": "The network classified this object as a Deer. Visual structures characteristic of forest ungulates, such as antler profiles, elongated legs, or soft muzzle geometry, were mapped.",
    "Dog": "The network classified this object as a Dog. The convolutional layers matched patterns mapping to canine muzzle geometry, floppy/upright ears, and domestic pet structures.",
    "Frog": "The network classified this object as a Frog. Detected patterns of wet-skinned amphibians, including crouching postures, circular heads, and hindleg bends.",
    "Horse": "The network classified this object as a Horse, identifying patterns representing large equine animals, such as slender legs, elongated skulls, and strong back curvatures.",
    "Ship": "The network classified this object as a Ship. Mapped maritime elements such as boat hulls, nautical superstructures, decks, and flotation silhouettes.",
    "Truck": "The network classified this object as a Truck. Heavy vehicle patterns were mapped, such as massive cabins, storage beds, multiple axles, or freight outlines."
};

// ==========================================================================
// ANALYSIS TRIGGER & NEURAL MODEL CALL
// ==========================================================================

predictBtn.addEventListener("click", async () => {
    if (!selectedFile) {
        alert("Please upload an image first!");
        return;
    }

    // Hide input actions and show loader
    uploadPanel.classList.add("hidden");
    loaderContainer.classList.remove("hidden");
    resultCard.classList.add("hidden");
    
    // Clear old active categories highlights
    categoryCards.forEach(card => card.classList.remove("predicted"));

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
        const response = await fetch("/predict", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Hide loader
        loaderContainer.classList.add("hidden");
        
        // Show result panel
        resultCard.classList.remove("hidden");

        // Map prediction values to labels
        const predictedClass = data.prediction;
        predictionText.innerText = predictedClass;

        // Custom narrative mapping based on the result
        const descText = categoryDescriptions[predictedClass] || 
            `The model mapped the target visual components to the ${predictedClass} category list.`;
        resultDescription.innerText = descText;

        // Highlight matching class card in showcase grid
        categoryCards.forEach(card => {
            const cardClass = card.getAttribute("data-class");
            if (cardClass && cardClass.toLowerCase() === predictedClass.toLowerCase()) {
                card.classList.add("predicted");
                // Scroll card into view gracefully if offscreen
                card.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        });

    } catch (error) {
        loaderContainer.classList.add("hidden");
        uploadPanel.classList.remove("hidden");
        alert(`Prediction failed: ${error.message || "Unknown Error"}`);
    }
});

// ==========================================================================
// SYSTEM RESET
// ==========================================================================

resetBtn.addEventListener("click", () => {
    // Clear prediction highlights
    categoryCards.forEach(card => card.classList.remove("predicted"));
    
    // Hide results
    resultCard.classList.add("hidden");
    
    // Reset upload and bring back workspace upload panel
    clearUploadState();
    uploadPanel.classList.remove("hidden");
    
    // Smooth scroll back to workspace top
    window.scrollTo({ top: 0, behavior: "smooth" });
});