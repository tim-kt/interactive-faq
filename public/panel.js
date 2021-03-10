const input = window.document.getElementById("question");

input.addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
        window.document.getElementById("btn").click();
    }
});

async function query() {
    const input = window.document.getElementById("question").value;
    window.Twitch.ext.rig.log("Search input: " + input);

    if (!input || !input.trim()) {
        return;
    }

    const response = await fetch("http://localhost:8000/questions/query", {
        method: "POST",
        headers: {"Content-Type": "text/plain"},
        body: input,
    })
    
    if (response.status == 404) {
        window.document.getElementById("output").innerHTML = "Sorry, I couldn't find anything. Ask in chat!";
        window.Twitch.ext.rig.log("Received 404 :(");
    }
    else {
        const data = await response.json();
        window.Twitch.ext.rig.log("Received data: " + JSON.stringify(data));
        window.document.getElementById("output").innerHTML = generateCard(data.question, data.answer, data.text);
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
