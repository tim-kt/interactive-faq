const twitch = window.Twitch.ext.rig;

// TODO This is horrible code. Refactor it.

function generateCard(question) {
    return `
        <div id="card-${question.id}" onClick=edit(${question.id}) class="card editable">
            <p class="original-question">Q: ${question.question}</p>
            <p class="answer">${question.answer}</p>
            <p id="text-${question.id}" class="text">${question.text ? question.text : ""}</p>
        </div>
    `
}

function generateEditPage(question, id) {
    return `
        <p>Question</p>
        <textarea id="edit-question" onInput=autoGrow(this)>${question.question}</textarea>
        <p>Answer</p>
        <textarea id="edit-answer" onInput=autoGrow(this)>${question.answer}</textarea>
        <p>Text</p>
        <textarea id="edit-text" onInput=autoGrow(this)>${question.text}</textarea>
        <div class="edit-actions">
            <button class="btn edit-btn save-btn white-on-purple" onClick=save(${id})>Save</button>
            <button class="btn edit-btn cancel-btn" onClick=closeEditPage()>Cancel</button>
            <button class="btn edit-btn delete-btn" onClick=delQuestion(${id})>Delete</button>
        </div>
    `
}

function generateCreatePage() {
    return `
        <p>Question</p>
        <textarea id="edit-question" onInput=autoGrow(this)></textarea>
        <p>Answer</p>
        <textarea id="edit-answer" onInput=autoGrow(this)></textarea>
        <p>Text</p>
        <textarea id="edit-text" onInput=autoGrow(this)></textarea>
        <div class="edit-actions">
            <button class="btn edit-btn white-on-purple" onClick=save(-1)>Create</button>
            <button class="btn edit-btn cancel-btn" onClick=closeEditPage()>Cancel</button>
        </div>
    `
}

function loadView() {
    fetch("http://localhost:8000/questions/")
        .then(response => response.json())
        .then(questions => {
            window.document.getElementById("questions").innerHTML = questions.map(question => generateCard(question)).join("");
        });
}

function reloadView() {
    window.document.getElementById("questions").innerHTML = "";
    loadView();
}

function reloadCard(id) {
    fetch("http://localhost:8000/question/" + id)
        .then(response => response.json())
        .then(question => {
            window.document.getElementById("card-" + id).outerHTML = generateCard(question);
        });
}

function edit(id) {
    window.document.getElementById("overlay").classList.add("active");
    window.document.getElementById("edit-page").classList.add("active");

    // Get the question, generate the edit page and resize every textarea
    fetch("http://localhost:8000/question/" + id)
        .then(response => response.json())
        .then(data => window.document.getElementById("edit-page").innerHTML = generateEditPage(data, id))
        .then(() => Array.from(window.document.getElementsByTagName("textarea")).map(element => autoGrow(element)));
}

function save(id) {
    const question = window.document.getElementById("edit-question").value;
    const answer = window.document.getElementById("edit-answer").value;
    const text = window.document.getElementById("edit-text").value;
    
    Array.from(window.document.getElementsByClassName("edit-btn")).map(button => button.disabled = true);

    // TODO "Success" or "Failure" popup
    if (id == -1) {
        fetch("http://localhost:8000/question/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + jwt,
            },
            body: JSON.stringify({
                "question": question,
                "answer": answer,
                "text": text,
            }),
        }).then(() => {
            closeEditPage();
    
            // TODO this isn't very efficient
            reloadView();
        });
    }
        else {
        fetch("http://localhost:8000/question/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + jwt,
            },
            body: JSON.stringify({
                "question": question,
                "answer": answer,
                "text": text,
            }),
        }).then(() => {
            closeEditPage();
            reloadCard(id);
        });
    }
}


function delQuestion(id) {
    fetch("http://localhost:8000/question/" + id, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + jwt,
        },
    }).then(() => {
        closeEditPage();
        // TODO this isn't very efficient either
        reloadView();
    });

}

function create() {
    window.document.getElementById("overlay").classList.add("active");
    window.document.getElementById("edit-page").classList.add("active");

    window.document.getElementById("edit-page").innerHTML = generateCreatePage();
    Array.from(window.document.getElementsByTagName("textarea")).map(element => autoGrow(element));
}

function closeEditPage() {
    window.document.getElementById("overlay").classList.remove("active");
    window.document.getElementById("edit-page").classList.remove("active");
}

// See https://stackoverflow.com/a/24676492/9216858 for more information
function autoGrow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}

// Load all questions
loadView();

// Save JWT
var jwt;

// TODO Don't let the user click "Save" if extension isn't authorized yet
window.Twitch.ext.onAuthorized(auth => { jwt = auth.token });
