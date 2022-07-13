// Variables
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const dataContent = document.getElementById('dataContent');
const dataContentPaste = document.getElementById('dataContentPaste');
const showerData = document.getElementById('showerData');
const btnContainer = document.getElementById('btnContainer');
const copiedText = document.getElementById('copiedText');
const copiedType = document.getElementById('copiedType');
const allDataShow = document.getElementById('allDataShow');
const allDataShowContents = allDataShow.querySelector('.contents');
let solidData;
let isLoading = true;

// APi url
const API_URL = 'https://clipboard-test-api.herokuapp.com';
// const API_URL = 'http://localhost:8080';

// Events fire
copyBtn.addEventListener('click', copyDataFn);
saveBtn.addEventListener('click', saveDataFn);
document.addEventListener('copy', copyPasteClipboard);
dataContentPaste.addEventListener('paste', copyPasteClipboard);

function copyDataFn(e, textArea) {
    if (textArea || dataContent.value) {
        if (textArea) {
            textArea.select();
        } else {
            dataContent.select();
        }

        copyIdentifier(textArea);
        document.execCommand('copy');
    } else {
        alert('Please fill the text field');
    }
}

let dataContentWhich;
function copyIdentifier(textArea) {
    if (textArea) {
        dataContentWhich = textArea;
    } else {
        dataContentWhich = dataContent;
    }
}
// invoked
copyIdentifier();

function copyPasteClipboard(e) {
    e.preventDefault();

    // Copy as json
    if (e.type !== 'paste') e.clipboardData.setData('application/json', dataContentWhich.value);

    let copyDataType;
    if (e.clipboardData.getData('application/json')) {
        copyDataType = 'application/json';
        solidData = e.clipboardData.getData(copyDataType);
        copiedType.textContent = copyDataType;
        copiedText.textContent = solidData;
        showerData.style.display = 'block';
        e.type === 'paste' && (saveBtn.style.display = 'block');
    }
}

// Save clipboard to db
async function saveDataFn() {
    isLoading = true;
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ solidData }),
    });
    const { message, error } = await res.json();
    if (!error) {
        saveBtn.style.display = 'none';
        showerData.style.display = 'none';
        dataContent.value = '';
        alert(message);
        await getAllData();
    } else {
        alert(error);
    }
}

async function getAllData() {
    const res = await fetch(API_URL, {
        method: 'GET',
    });
    const { clipboards } = await res.json();
    showData(clipboards);
}
// Invoked all data
getAllData();

function showData(clipboards) {
    isLoading = false;
    allDataShowContents.innerHTML = '';

    if (isLoading) {
        allDataShowContents.textContent = 'Loading data...';
    } else {
        if (clipboards.length !== 0) {
            clipboards.map((item) => {
                const dateTime =
                    new Date(item.createdAt).toLocaleDateString() +
                    ' : ' +
                    new Date(item.createdAt).toLocaleTimeString();

                const singleData = `<div class="single__data" key="${item._id}">
                    <textarea cols="30" rows="6"
                        placeholder="Your content" readonly style="cursor: default;" title="Created at: ${dateTime}">${item.copiedText}</textarea>
                    <button type="button">Copy</button>
                </div>`;
                allDataShowContents.innerHTML += singleData;
            });

            document.querySelectorAll('.single__data').forEach((card) => {
                const textArea = card.querySelector('textarea');
                const btn = card.querySelector('button');

                btn.addEventListener('click', (e) => copyDataFn(e, textArea));
                textArea.addEventListener('keypress', () => {
                    getAllData();
                });
            });
        } else {
            allDataShowContents.textContent = 'Sorry, You have not any saved data!';
        }
    }
}
