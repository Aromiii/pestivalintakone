import { firebaseConfig } from "/firebaseConfig.js"

document.addEventListener("DOMContentLoaded", async () => {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    const optionsContainer = document.querySelector(".search-options");
    const searchBox = document.querySelector(".search");
    const jobForm = document.querySelector(".job-form")
    let selectedJobs = [];

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
            div.innerHTML = `${job}`;
            optionsContainer.appendChild(div);

            div.addEventListener("click", () => {
                const index = selectedJobs.indexOf(job);

                if (index !== -1) {
                    selectedJobs.splice(index, 1);
                    div.classList.remove("selected");
                    console.log("Removed job:", selectedJobs);
                    return;
                }

                if (selectedJobs.length >= 10) {
                    alert("Olet jo valinnut kymmenen pestitoivetta. Valitse jokin pestitoive pois, että voi valita kyseisen pesti toiveeksi.")
                    return
                }

                selectedJobs.push(job);
                div.classList.add("selected");
            });
        });
    }

    const radios = document.querySelectorAll('input[name="agegroup"]');
    radios.forEach(radio => {
        radio.addEventListener("change", () => {
            selectedJobs = [];
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

    jobForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (selectedJobs.length < 10) {
            alert("Et ole vielä valinnut kymmentä pestitoivetta. Valitse kymmenen pestitoivetta ja uudelleenpalauta lomake.")
            return
        }

        const ageGroup = document.querySelector('input[name="agegroup"]:checked')?.value
        const jobTime = document.querySelector('input[name="jobtime"]:checked')?.value

        if (ageGroup === undefined || jobTime === undefined) {
            alert("Muista täyttää kaikki lomakkeen pakolliset kohdat, jotka huomaat tähdistä *")
            return
        }

        const data = {
            firstName: document.getElementById("firstName").value,
            lastName: document.getElementById("lastName").value,
            ageGroup: ageGroup,
            jobTime: jobTime,
            selectedJobs: selectedJobs,
            details: document.getElementById("details").value
        };

        try {
            await db.collection("jobSelections").add(data);
            jobForm.reset();
            optionsContainer.innerHTML = "";
            selectedJobs = [];
            alert("Pestivalintasi lähetetty onnistuneesti!");
        } catch (error) {
            console.error("Error writing document: ", error);
            alert("Jotain meni pieleen, yritä uudelleen.");
        }
    });
})
