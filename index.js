document.addEventListener("DOMContentLoaded", async () => {
    const firebaseConfig = {
        apiKey: "AIzaSyCwjycLBjwLnaX7ukzcP8vGHa9TPL7jdRw",
        authDomain: "pestinvalintakone.firebaseapp.com",
        projectId: "pestinvalintakone",
        storageBucket: "pestinvalintakone.firebasestorage.app",
        messagingSenderId: "605582430584",
        appId: "1:605582430584:web:e2b5ba11cbf9dfc359f88d"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    const optionsContainer = document.querySelector(".search-options");
    const searchBox = document.querySelector(".search");
    const jobForm = document.querySelector(".job-form")
    let selectedValue = null;

    let jobs = {};
    try {
        const response = await fetch("jobs.json");
        jobs = await response.json();
    } catch (err) {
        console.error("Error loading JSON:", err);
        alert("Ongelma pestien latauksessa. Uudelleenlataa sivusto. Jos ongelma ei ratkea, ota yhteyttä aaro.heroja@partio.fi")
    }

    const loadJobs = (group) => {
        optionsContainer.innerHTML = "";

        if (!jobs[group]) return;

        jobs[group].forEach(job => {
            const div = document.createElement("div");
            div.classList.add("search-option");
            div.innerHTML = `<strong>${job.title}</strong><br/><br/>${job.description}`;
            optionsContainer.appendChild(div);

            div.addEventListener("click", () => {
                optionsContainer.querySelectorAll(".search-option").forEach(o => o.classList.remove("selected"));
                div.classList.add("selected");
                selectedValue = div.textContent;
                console.log("Selected job:", selectedValue);
            });
        });
    }

    const radios = document.querySelectorAll('input[name="agegroup"]');
    radios.forEach(radio => {
        radio.addEventListener("change", () => {
            loadJobs(radio.value);
        });
    });

    searchBox.addEventListener("input", () => {
        const query = searchBox.value.toLowerCase();

        optionsContainer.childNodes.forEach(opt => {
            const text = opt.textContent.toLowerCase();
            opt.hidden = !text.includes(query);
        });
    })

    optionsContainer.childNodes.forEach(opt => {
        opt.addEventListener("click", () => {

            optionsContainer.childNodes.forEach(o => o.classList.remove("selected"));

            opt.classList.add("selected");
            selectedValue = opt.textContent;
        });
    });

    jobForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // prevent page reload

        if (selectedValue === null) {
            alert("Valitse pestitoive 1.")
            return
        }

        const data = {
            firstName: document.getElementById("firstName").value,
            lastName: document.getElementById("lastName").value,
            ageGroup: document.querySelector('input[name="agegroup"]:checked')?.value,
            selectedJob: selectedValue
        };

        try {
            await db.collection("jobSelections").add(data);
            alert("Pestivalintasi lähetetty onnistuneesti!");
            jobForm.reset();
            optionsContainer.innerHTML = "";
            selectedValue = null;
        } catch (error) {
            console.error("Error writing document: ", error);
            alert("Jotain meni pieleen, yritä uudelleen.");
        }
    });
})
