window.addEventListener("load", () => {
    fetch("listes.json").then(res => res.json()).then(annees => {
        var searchParams = new URLSearchParams(window.location.href);
        displayQuestion(generateQuestion(annees, searchParams.getAll("categories")));
    });
});

function displayQuestion(question) {
    document.getElementById("question").textContent = question.question;
    var answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";
    question.answers.forEach(answer => {
        let answerButton = document.createElement("button");
        if (question.type == "color")
            answerButton.style.backgroundColor = answer;
        else
            answerButton.textContent = answer;
        answersDiv.appendChild(answerButton);
    });
}

function generateQuestion(annees, categories, yearMin = null, yearMax = null) {
    // TODO : Filter the years
    var category = pickRandom(categories);
    var question, answers = [], type = "text";
    if (category == "animal") {
        var liste = getRandomListe(annees, l => l.animal);
        question = `Quel est l'animal de la liste ${liste.nom} ?`;
        answers.push(liste.animal);
        while (answers.length < 4) {
            var randomListe = getRandomListe(annees, l => l.animal);
            if (randomListe.animal !== liste.animal)
                answers.push(randomListe.animal);
        }
    } else if (category == "musique") {
        var liste = getRandomListe(annees, l => l.musique);
        question = `Quelle est la musique de la liste ${liste.nom} ?`;
        answers.push(liste.musique);
        while (answers.length < 4) {
            var randomListe = getRandomListe(annees, l => l.musique);
            if (randomListe.musique !== liste.musique)
                answers.push(randomListe.musique);
        }
    } else if (category == "couleur") {
        type = "color";
        var liste = getRandomListe(annees, l => l.couleur);
        question = `Quelle est la couleur de la liste ${liste.nom} ?`;
        answers.push(liste.couleur);
        while (answers.length < 4) {
            var randomListe = getRandomListe(annees, l => l.couleur);
            if (randomListe.couleur !== liste.couleur)
                answers.push(randomListe.couleur);
        }
    } else if (category == "ecart") {
        var bde = getRandomListe(annees, l => l.ecart);
        question = `Quel est l'écart de vote du BDE ${bde.nom} ?`;
        answers.push(bde.ecart);
        while (answers.length < 4) {
            var randomBDE = getRandomListe(annees, l => l.ecart);
            if (randomBDE.ecart !== bde.ecart)
                answers.push(randomBDE.ecart);
        }
    } else if (category == "adversaire") {
        var annee = pickRandom(annees);
        var liste = pickRandom(annee.listes);
        var adversaire = pickRandom(annee.listes, l => l !== liste);
        question = `Quelle est la liste adverse de ${liste.nom} en ${annee.annee} ?`;
        answers.push(adversaire.nom);
        for (let i = 0; i < 3; i++)
            answers.push(pickRandom(pickRandom(annees, a => a !== annee).listes, l => !answers.includes(l.nom)).nom);
    } else if (category == "annee") {
        var annee = pickRandom(annees);
        var liste = pickRandom(annee.listes);
        question = `Quelle est l'année de la liste ${liste.nom} ?`;
        answers.push(annee.annee);
        for (let i = 0; i < 3; i++)
            answers.push(pickRandom(annees, a => a !== annee).annee);
    } else if (category == "bde") {
        var annee = pickRandom(annees, a => !a.unfinished);
        var bde = annee.listes[0];
        question = `Quel est le nom du BDE en ${annee.annee} ?`;
        answers.push(bde.nom);
        for (let i = 0; i < 3; i++)
            answers.push(pickRandom(annees, a => a !== annee && !answers.includes(a.listes[0].nom)).listes[0].nom);
    } else if (category == "suivant") {
        var annee = pickRandom(annees, a => !a.unfinished);
        var anneeIndex = annees.indexOf(annee);
        var bde = annee.listes[0];
        var suivant = TODO;
        question = `Quelle est le BDE successeur du BDE ${bde.nom} ?`;
        answers.push(suivant.nom);
        for (let i = 0; i < 3; i++)
            answers.push(pickRandom(annees, a => a !== annee && !answers.includes(a.listes[0].nom)).listes[0].nom);
    } else if (category == "resultat") {
        var annee = pickRandom(annees, a => !a.unfinished);
        question = `Quelle liste a gagné en ${annee.annee} ?`;
        answers.push(annee.listes[0].nom);
        for (let i = 1; i < Math.min(4, annee.listes.length); i++)
            answers.push(annee.listes[i].nom);
        for(let i = answers.length; i < 4; i++)
            answers.push(pickRandom(annees, a => a !== annee).listes[0].nom);
    }
    var correctAnswer = answers[0];
    answers = shuffle(answers);
    return { question, answers, correctAnswer, type };
}

function getRandomListe(annees, filter = null) {
    do {
        var liste = pickRandom(pickRandom(annees).listes);
    } while (filter !== null && !filter(liste));
    return liste;
}

function pickRandom(array, filter = null) {
    if (filter !== null)
        array = array.filter(filter);
    return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}