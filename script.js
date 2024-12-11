const toggleThemeBtn = document.getElementById("toggleTheme");
const loader = document.getElementById("loader");
const detailsContainer = document.getElementById("result");
const recentSearchesContainer = document.getElementById("recentSearches");

let isDarkMode = true;

const searchGithub = async () => {
    const username = document.getElementById("searchInput").value.trim();
    if (!username || username.includes(" ")) {
        alert("Please enter a valid GitHub username (no spaces).");
        return;
    }

    loader.style.display = "block";
    detailsContainer.style.display = "none";

    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) throw new Error("User not found");

        const data = await response.json();

        updateRecentSearches(username);

        const reposResponse = await fetch(data.repos_url);
        const reposData = await reposResponse.json();

        displayUserDetails(data, reposData);
    } catch (error) {
        alert(error.message);
    } finally {
        loader.style.display = "none";
    }
};

const updateRecentSearches = (username) => {
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    if (!recentSearches.includes(username)) {
        recentSearches.unshift(username);
        if (recentSearches.length > 5) recentSearches.pop();
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    }
    renderRecentSearches();
};

const renderRecentSearches = () => {
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    recentSearchesContainer.innerHTML = `
        <h3>Recent Searches:</h3>
        ${recentSearches
            .map(
                (username) =>
                    `<a class="recent-btn" onclick="searchGithubByName('${username}')">${username}</a>`
            )
            .join("")}
    `;
};

const searchGithubByName = (username) => {
    document.getElementById("searchInput").value = username;
    searchGithub();
};

const displayUserDetails = (data, reposData) => {
    detailsContainer.style.display = "block";
    detailsContainer.innerHTML = `
        <div class="profile">
            <div class="profile-image">
                <img src="${data.avatar_url}" alt="Avatar of ${data.name || data.login}" />
            </div>
            <div class="profile-details">
                <h2>${data.name || data.login}</h2>
                <p>@${data.login}</p>
                <p>${data.bio || "No bio available."}</p>
                <p>Created: ${new Date(data.created_at).toLocaleDateString()}</p>
            </div>
        </div>
        <div class="stats">
            <p><strong>Public Repos:</strong> ${data.public_repos}</p>
            <p><strong>Followers:</strong> ${data.followers}</p>
            <p><strong>Following:</strong> ${data.following}</p>
        </div>
        <div class="repos">
            <h3>Top Repositories:</h3>
            ${reposData
                .slice(0, 5)
                .map(
                    (repo) =>
                        `<p><a href="${repo.html_url}" target="_blank">${repo.name}</a> - ${
                            repo.description || "No description"
                        }</p>`
                )
                .join("")}
        </div>
    `;
};

toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    isDarkMode = !isDarkMode;
    const icon = toggleThemeBtn.querySelector("i");
    icon.className = isDarkMode ? "fas fa-moon" : "fas fa-sun";
});

renderRecentSearches();
