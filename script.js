const body = document.body;                                             // Access the body element

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// References to DOM elements:
let result = body.querySelector(".result");                             // Display for the current value                         
let copyResult = body.querySelector(".copy-result");                    // Display for copied text
let previousValue = "0";                                                // Stores the previous number
let currentValue = "0";                                                 // Currently entered number
let currentOperator = "";                                               // Currently selected operator
let resultValue = 0;                                                    // Temporary calculation result

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Buttons in the DOM:
const copyButton = body.querySelector(".copy-button");                  // Copy button

const numberButtons = body.querySelectorAll(".number");                 // Number buttons (HTML-Collection)
const operatorButtons = body.querySelectorAll(".operator");             //  Operator buttons (HTML-Collection)

const cButton = body.querySelector(".c");                               // Clear button
const deleteButton = body.querySelector(".delete-button");              // Delete button
const equalsButton = body.querySelector(".equals-button");              // Equals button
const commaButton = body.querySelector(".comma-symbol");                // Decimal point button
const signButton = body.querySelector(".sign-button");                  // Sign button (-)

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Functions:
// Calculate the maximum number of characters that fit on the display
function getMaxChars() {
    const displayWidth = result.clientWidth;
    const style = window.getComputedStyle(result);
    const fontSize = parseFloat(style.fontSize);
    const charWidth = fontSize * 0.6;                                   // Estimate: 60% of font size

    return Math.floor(displayWidth / charWidth);
}

// Limit the length of the result to fit the display
function limitResultLength(value) {
    const displayWidth = result.clientWidth;
    const style = window.getComputedStyle(result);
    const fontSize = parseFloat(style.fontSize);
    const charWidth = fontSize * 0.6;
    const maxChars = Math.floor(displayWidth / charWidth);

    let text = value.toString();

    // Trim text if it exceeds maxChars
    if (text.length > maxChars) text = text.slice(0, maxChars);

    // Limit decimal places to 8
    if (text.includes(".")) {
        const [int, dec] = text.split(".");
        if (dec.length > 8) text = int + "." + dec.slice(0, 8);
    }

    return text;
}

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Event Listener:
// Number button click
numberButtons.forEach(button => {
    button.addEventListener("click", function() {
        if (currentValue.length >= getMaxChars()) return;

        // Removes leading zero
        if (currentValue == "0") currentValue = "";

        currentValue += button.textContent;
        result.textContent = currentValue;
    })
})

// Decimal point button click
commaButton.addEventListener("click", function() {
    if (currentValue.length >= getMaxChars()) return;

    // Only one decimal point allowed
    if (!currentValue.includes(".")) currentValue += ".";

    result.textContent = currentValue;
})

// Sign button click (-)
signButton.addEventListener("click", function() {
    // Already negative
    if (currentValue.includes("-")) return;

    // Apply sign only if 0
    if (currentValue === "0") currentValue = "-";

    result.textContent = currentValue;
})

// Operator button click (+ , -, ×, ÷)
operatorButtons.forEach(button => {
    button.addEventListener("click", function() {
        if (currentOperator == "") {
            if (currentValue.length >= getMaxChars()) return;

            // Save current number
            previousValue = currentValue;

            // Set operator
            currentOperator = button.textContent;

            result.textContent = previousValue + " " + currentOperator;

            // Reset for next number
            currentValue = "0";
        }
    })
})


// Equals button click: Perform calculation
equalsButton.addEventListener("click", function() {
    if (previousValue == "0" && currentOperator == "") {
        result.textContent = currentValue;
        return;
    }

    // Calculate based on the operator
    switch(currentOperator) {
        case "+":
            resultValue = Number(previousValue.replace(",", ".")) + Number(currentValue.replace(",", "."));
            break;

        case "-":
            resultValue = Number(previousValue.replace(",", ".")) - Number(currentValue.replace(",", "."));
            break;

        case "×":
            resultValue = Number(previousValue.replace(",", ".")) * Number(currentValue.replace(",", "."));
            break;

        case "÷":
            if (Number(currentValue) === 0) {
                // Division by 0
                result.textContent = "ERROR";
                return;
            }

            resultValue = Number(previousValue.replace(",", ".")) / Number(currentValue.replace(",", "."));
            break;
    }

    // Reset and show result
    previousValue = "0";
    currentOperator = "";
    currentValue = limitResultLength(resultValue);

    result.textContent = currentValue;

    resultValue = 0;
})

// Clear button click: Reset everything
cButton.addEventListener("click", function() {
    currentValue = "0";
    previousValue = "0";
    currentOperator = "";
    result.textContent = currentValue;
})

// Delete button click: Remove last character/operator
deleteButton.addEventListener("click", function() {
    if (previousValue === "0" && currentOperator === "" && currentValue !== 0) {
        currentValue = currentValue.slice(0, -1);
        if (currentValue == "") currentValue = "0";

        result.textContent = currentValue;

    } else if (previousValue !== "0" && currentOperator !== "" && currentValue === "0" || previousValue === "0" && currentOperator !== "" && currentValue === "0") {
        currentOperator = "";
        currentValue = previousValue;

        result.textContent = currentValue;

        previousValue = "0";

    } else if (previousValue !== "0" && currentOperator !== "" && currentValue !== "0" || previousValue === "0" && currentOperator !== "" && currentValue === 0 || previousValue === "0" && currentOperator !== "" && currentValue !== 0) {
        currentValue = currentValue.slice(0, -1);
        if (currentValue == "") currentValue = "0";
        if (currentValue == "0") {
            result.textContent = previousValue + " " + currentOperator;
        } else {
            result.textContent = currentValue;
        }
    }
})


// Copy button click: Copy current expression to clipboard
copyButton.addEventListener("click", function() {
    let textToCopy = "";

    // Determine what to copy depending on current state
    if (previousValue === "0" && !currentOperator && currentValue === "0") {
        textToCopy = "0";

    } else if (previousValue === "0" && currentOperator && currentValue === "0") {
        textToCopy = `0 ${currentOperator} 0`;

    } else if (previousValue === "0" && currentOperator && currentValue !== "0") {
        textToCopy = `0 ${currentOperator} ${currentValue}`;

    } else if (previousValue !== "0" && currentOperator && currentValue === "0") {
        textToCopy = `${previousValue} ${currentOperator} 0`;

    } else if (previousValue !== "0" && currentOperator && currentValue !== "0") {
        textToCopy = `${previousValue} ${currentOperator} ${currentValue}`;

    } else if (previousValue !== "0" && !currentOperator && currentValue === "0") {
        textToCopy = previousValue;

    } else {
        textToCopy = currentValue;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(textToCopy);

    // Show feedback and hide after 10 seconds
    copyResult.textContent = `Copied: ${textToCopy}`;
    setTimeout(() => {
        copyResult.innerHTML = "&nbsp;"
        return;
    }, 10000)
});