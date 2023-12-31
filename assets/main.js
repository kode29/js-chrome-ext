const pickerBtn = document.querySelector('#picker-btn');
const clearBtn = document.querySelector('#clear-btn');
const colorList = document.querySelector('.all-colors');
const exportBtn = document.querySelector('#export-btn');

// retrieve picked colors from localstorage or initializating an empty array
let pickedColors = JSON.parse(localStorage.getItem("colors-list")) || [];

const copySvg = `<svg class='copySvg' xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M208 0H332.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128h80v64H64V448H256V416h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48z"/></svg>`;

// variable to keep track of the current color popup
let currentPopup = null;

// function to copy text to the clipbaord
const copyToClipboard = async (text, element) => {
    try{
        await navigator.clipboard.writeText(text);
        element.innerText = "Copied!";
        // Resetting element text after 1 second
        setTimeout(()=>{
            element.innerHTML = `${text} ${copySvg}`;
        }, 1000);
    } catch (error){
        alert("Failed to Copy text");
    }
};

// function to export colors as text file
const exportColors = () => {
    const colorText = pickedColors.join("\n");
    const blob = new Blob([colorText], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Colors.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to create the color popup
const createColorPopup = (color) => {
    const popup = document.createElement("div");
    popup.classList.add('color-popup');
    popup.innerHTML = `
        <div class="color-popup-content">
            <span class="close-popup">x</span>
            <div class="color-info">
                <div class="color-preview" style="background: ${color}; border: 1px solid ${color === "#ffffff" ? "#ccc" : color }"></div>
                <div class="color-details">
                    <div class="color-value">
                        <span class="label">Hex: </span>
                        <span class="value hex" data-color="${color}">${color} ${copySvg}</span>
                    </div>
                    <div class="color-value">
                        <span class="label">RGB:</span>
                        <span class="value rgb" data-color="${color}">${hexToRgb(color)}  ${copySvg}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Close button inside the popup
    const closePopup = popup.querySelector(".close-popup");
    closePopup.addEventListener("click", () => {
        document.body.removeChild(popup);
        currentPopup = null
    });

    // Event listeners to copy color values to clipboard
    const colorValues = popup.querySelectorAll(".value")
    colorValues.forEach((value) => {
        value.addEventListener('click', (e) => {
            const text = e.currentTarget.innerText;
            copyToClipboard(text, e.currentTarget);
        });
    });

    return popup;
}

// Function to dispay the picked colors
const showColors = () => {
    colorList.innerHTML = pickedColors.map((color)=> 
        `
            <li class="color">
                <span class="rect" style="background: ${color}; border: 1px solid ${color === "#ffffff" ? "#ccc" : color }"> </span>
                <span class="value hex" data-color="${color}">${color}</span>
            </li>
        `
    ).join("");

    const colorElements = document.querySelectorAll(".color");
    colorElements.forEach((li) => {
        const colorHex = li.querySelector(".value.hex");
        colorHex.addEventListener('click', (e)=>{
            const color = e.currentTarget.dataset.color;
            if(currentPopup){
                document.body.removeChild(currentPopup);
            }
            const popup = createColorPopup(color);
            document.body.appendChild(popup);
            currentPopup = popup;
        })
    })

    const pickedColorsContainer = document.querySelector(".colors-list");
    pickedColorsContainer.classList.toggle("hide", pickedColors.length === 0);
}

// Function to convert a hex tolor code to rgb format
const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
}

// Function to activate the eye dropper color picker
const activateEyeDropper = async () => {
    document.body.style.display = "none";
    try {
        // opening the eye dropper and retrieve the selected color
        const { sRGBHex } = await new EyeDropper().open();

        if (!pickedColors.includes(sRGBHex)){
            pickedColors.push(sRGBHex);
            localStorage.setItem("colors-list", JSON.stringify(pickedColors));
        }

        showColors();
    }catch (error){
        alert("Failed to copy the color code");
    }finally{
        document.body.style.display = "block";
    }
};

// function to clear all picked colors
const clearAllColors = () => {
    pickedColors = [];
    localStorage.removeItem("colors-list");
    showColors();
}

// event listener for buttons
clearBtn.addEventListener('click', clearAllColors)
pickerBtn.addEventListener('click', activateEyeDropper);
exportBtn.addEventListener('click', exportColors)

// Display picked colors on document load
showColors();