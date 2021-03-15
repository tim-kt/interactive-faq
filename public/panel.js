const twitch = window.Twitch.ext.rig;

async function query() {
    const input = window.document.getElementById("question-field").value;

    if (!input || !input.trim()) {
        return;
    }

    const response = await fetch("https://interactive-faq.tk/questions/" + channel + "/query", {
        method: "POST",
        headers: {"Content-Type": "text/plain"},
        body: input,
    });
    
    // Properly handle error cases
    if (response.status == 200) {
        const data = await response.json();
        window.document.getElementById("output").innerHTML = generateCard(data.question, data.answer, data.text);
    }
    else if (response.status == 404) {
        window.document.getElementById("output").innerHTML = `<div id="error" class="${theme}">Sorry, I couldn't find anything.<br>Ask in chat!</div>`;
    }
    else {        
        window.document.getElementById("output").innerHTML = `<div id="error" class="${theme}">Something went wrong...<br>Please try searching again!</div>`;
    }
}

function generateCard(question, answer, text) {
    return `
        <div class="card">
            <p class="original-question">Q: ${question}</p>
            <p class="answer">${answer}</p>
            <p class="text">${text ? text : ""}</p>
            <p class="wrong-answer">Not what you were looking for? Ask away in chat!</p>
        </div>
    `
}

const questionField = window.document.getElementById("question-field");
const searchButton = window.document.getElementById("search-button");
questionField.addEventListener("keyup", (event) => {
    if (event.key == "Enter") {
        query();
    }
});
searchButton.addEventListener("click", query);



// Save channel ID
var channel;
window.Twitch.ext.onAuthorized(auth => { channel = auth.channelId });


// Switch between light and dark theme
var theme;
window.Twitch.ext.onContext(context => {
    theme = context.theme;
    window.document.body.className = theme;
    const error = window.document.getElementById("error");
    if (error) {
        error.className = theme;
    }
})
