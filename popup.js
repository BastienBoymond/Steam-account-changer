document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.getElementById('add-button');
  const formContainer = document.getElementById('form-container');
  const saveProfileButton = document.getElementById('save-profile');
  const profilesContainer = document.getElementById('profiles-container');

  // Charger les profils existants
  loadProfiles();

  // Gestionnaire pour le bouton d'ajout
  addButton.addEventListener('click', () => {
    formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
  });

  // Gestionnaire pour la sauvegarde du profil
  saveProfileButton.addEventListener('click', () => {
    const websiteName = document.getElementById('website-name').value;
    const profileName = document.getElementById('profile-name').value;
    const profileImage = document.getElementById('profile-image').value;

    if (websiteName && profileName && profileImage) {
      saveProfile({ websiteName, profileName, profileImage });
      formContainer.style.display = 'none';
      clearForm();
      loadProfiles();
    }
  });

  function saveProfile(profile) {
    chrome.storage.local.get(['profiles'], (result) => {
      const profiles = result.profiles || [];
      profiles.push(profile);
      chrome.storage.local.set({ profiles });
    });
  }

  function loadProfiles() {
    chrome.storage.local.get(['profiles'], (result) => {
      const profiles = result.profiles || [];
      profilesContainer.innerHTML = '';
      
      profiles.forEach((profile, index) => {
        const profileButton = createProfileButton(profile, index);
        profilesContainer.appendChild(profileButton);
      });
    });
  }

  function createProfileButton(profile, index) {
    const button = document.createElement('div');
    button.className = 'profile-button';
    button.innerHTML = `
      <img src="${profile.profileImage}" alt="${profile.websiteName}">
      <span>${profile.websiteName} - ${profile.profileName}</span>
    `;
    
    button.addEventListener('click', () => {
      changeSteamProfile(profile);
    });

    return button;
  }

  function changeSteamProfile(profile) {
    // Ouvrir la page de modification de profil Steam
    chrome.tabs.create({
      url: 'https://steamcommunity.com/my/edit'
    }, async (tab) => {
      try {
        // Attendre que la permission soit accordée
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: (profileData) => {
            console.log("Tentative de modification du profil");
            // Attendre que la page soit chargée
            setTimeout(() => {
              console.log("Tentative de modification du profil");
              const nameInputs = document.getElementsByName('personaName');
              if (nameInputs && nameInputs.length > 0) {
                const nameInput = nameInputs[0];
                nameInput.value = profileData.profileName;
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                nameInput.dispatchEvent(new Event('change', { bubbles: true }));
                const button = document.querySelector('button[type="submit"]');
                button.click();
                console.log("Nom du profil modifié avec succès");
              } else {
                console.log("Élément de nom non trouvé");
              }
            }, 3000);
          },
          args: [profile]
        });
      } catch (error) {
        console.error("Erreur lors de l'exécution du script:", error);
      }
    });
  }

  function clearForm() {
    document.getElementById('website-name').value = '';
    document.getElementById('profile-name').value = '';
    document.getElementById('profile-image').value = '';
  }
}); 