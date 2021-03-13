const twitch = window.Twitch.ext.rig;

// TODO documentation and helpful comments

function generateCard(question) {
    return `
        <div id="card-${question.id}") class="card editable">
            <p class="original-question">Q: ${question.question}</p>
            <p class="answer">${question.answer}</p>
            <p id="text-${question.id}" class="text">${question.text ? question.text : ""}</p>
        </div>
    `
}

function reloadCard(id) {
    fetch("https://interactive-faq.tk/question/" + id)
        .then(response => response.json())
        .then(question => {
            window.document.getElementById("card-" + id).outerHTML = generateCard(question);
            window.document.getElementById("card-" + id).addEventListener("click", () => {
                currentQuestion = id;
                openEditPage();
            });
        });
}

function loadView() {
    fetch("https://interactive-faq.tk/questions/")
        .then(response => response.json())
        .then(questions => {
            window.document.getElementById("questions").innerHTML = questions.map(question => generateCard(question)).join("");
            Array.from(window.document.getElementsByClassName("card")).map(card => {
                const id = card.id.split("-")[1];
                card.addEventListener("click", () => {
                    currentQuestion = id;
                    openEditPage();
                });
            });
        });
}

function reloadView() {
    window.document.getElementById("questions").innerHTML = "";
    loadView();
}

function openEditPage() {

    window.document.getElementById("overlay").classList.add("active");
    window.document.getElementById("edit-page").classList.add("active");

    if (currentQuestion != -1) {
    fetch("https://interactive-faq.tk/question/" + currentQuestion)
        .then(response => response.json())
        .then(data => {
            window.document.getElementById("edit-question").value = data.question;
            window.document.getElementById("edit-answer").value = data.answer;
            window.document.getElementById("edit-text").value = data.text;
        })
        .then(resizeAllTextareas);
    }
    else {            
        window.document.getElementById("edit-question").value = "";
        window.document.getElementById("edit-answer").value = "";
        window.document.getElementById("edit-text").value = "";

        resizeAllTextareas();
    }
}

function closeEditPage() {
    window.document.getElementById("overlay").classList.remove("active");
    window.document.getElementById("edit-page").classList.remove("active");
}

function save() {
    const question = window.document.getElementById("edit-question").value;
    const answer = window.document.getElementById("edit-answer").value;
    const text = window.document.getElementById("edit-text").value;
    
    // TODO "Success" or "Failure" popup
    if (currentQuestion == -1) {
        fetch("https://interactive-faq.tk/question/", {
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
        fetch("https://interactive-faq.tk/question/" + currentQuestion, {
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
            reloadCard(currentQuestion);
        });
    }
}

function del() {
    fetch("https://interactive-faq.tk/question/" + currentQuestion, {
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

// See https://stackoverflow.com/a/24676492/9216858 for more information
function resize(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}

function resizeAllTextareas() {
    Array.from(window.document.getElementsByTagName("textarea")).map(element => resize(element));
}

// Load all questions
loadView();

// Save token
var jwt;

// TODO Don't let the user click "Save" if extension isn't authorized yet
window.Twitch.ext.onAuthorized(auth => { jwt = auth.token });

// Current question being edited (if any) to refer to in save() and del()
var currentQuestion = -1;

// Creating a new question
window.document.getElementById("new-question-btn").addEventListener("click", () => {
    currentQuestion = -1;
    openEditPage();
});

// Auto-grow textareas in edit page
const questionTextarea = window.document.getElementById("edit-question");
questionTextarea.addEventListener("input", () => resize(questionTextarea));

const answerTextarea = window.document.getElementById("edit-answer");
answerTextarea.addEventListener("input", () => resize(answerTextarea));

const textTextarea = window.document.getElementById("edit-text");
textTextarea.addEventListener("input", () => resize(textTextarea));

// Save button in edit page
window.document.getElementById("save-btn").addEventListener("click", save);

// Cancel button in edit page
window.document.getElementById("cancel-btn").addEventListener("click", closeEditPage);

// Delete button in edit page
window.document.getElementById("delete-btn").addEventListener("click", del);
