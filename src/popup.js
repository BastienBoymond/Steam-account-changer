import { saveProfile, loadProfiles, createProfileButton } from './profileManager.js';
import { changeSteamProfile } from './steamProfileChanger.js';

document.addEventListener('DOMContentLoaded', async () => {
  const addButton = document.getElementById('add-button');
  const formContainer = document.getElementById('form-container');
  const saveProfileButton = document.getElementById('save-profile');
  const profilesContainer = document.getElementById('profiles-container');

  // Charger les profils existants
  await updateProfilesList();

  // Gestionnaire pour le bouton d'ajout
  addButton.addEventListener('click', () => {
    formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
  });

  // Gestionnaire pour la sauvegarde du profil
  saveProfileButton.addEventListener('click', async () => {
    const websiteName = document.getElementById('website-name').value;
    const profileName = document.getElementById('profile-name').value;
    const profileImage = document.getElementById('profile-image').value;

    if (websiteName && profileName && profileImage) {
      await saveProfile({ websiteName, profileName, profileImage });
      formContainer.style.display = 'none';
      clearForm();
      await updateProfilesList();
    }
  });

  async function updateProfilesList() {
    const profiles = await loadProfiles();
    profilesContainer.innerHTML = '';
    
    profiles.forEach((profile, index) => {
      const profileButton = createProfileButton(profile, index, changeSteamProfile);
      profilesContainer.appendChild(profileButton);
    });
  }
  
  function clearForm() {
    document.getElementById('website-name').value = '';
    document.getElementById('profile-name').value = '';
    document.getElementById('profile-image').value = '';
  }
}); 